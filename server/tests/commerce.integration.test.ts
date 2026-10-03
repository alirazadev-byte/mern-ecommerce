import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Product = require("../models/ProductModel");
import Inventory = require("../models/Inventory");
import MarketplaceOrder = require("../models/MarketplaceOrder");
import VendorOrder = require("../models/VendorOrder");
import Payment = require("../models/Payment");
import IdempotencyRecord = require("../models/IdempotencyRecord");
import ProcessedStripeEvent = require("../models/ProcessedStripeEvent");
import { createCheckout } from "../services/checkoutService";
import { getCustomerOrder, listVendorOrders, transitionVendorOrder, cancelPendingCustomerOrder } from "../services/orderService";
import type { PaymentGateway, CreatePaymentIntentInput, PaymentIntentResult, RefundResult } from "../services/paymentGateway";

const mongoUrl = process.env.TEST_MONGODB_URL;

class FakeGateway implements PaymentGateway {
  createCalls: CreatePaymentIntentInput[] = [];
  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    this.createCalls.push(input);
    return { id: `pi_${input.marketplaceOrderId}`, clientSecret: `secret_${input.marketplaceOrderId}`, status: "requires_payment_method" };
  }
  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult> {
    return { id: paymentIntentId, clientSecret: `secret_${paymentIntentId.replace(/^pi_/, "")}`, status: "requires_payment_method" };
  }
  async cancelPaymentIntent(): Promise<void> {}
  async refundPaymentIntent(): Promise<RefundResult> { return { id: "re_test", status: "succeeded" }; }
  constructWebhookEvent(): never { throw new Error("not used"); }
}

const shippingAddress = {
  recipientName: "Customer", email: "customer@example.com", country: "PK", city: "PB",
  address1: "123 Main Street", postalCode: "54000",
};

async function clean() {
  await Promise.all([
    Product.deleteMany({}), Inventory.deleteMany({}), MarketplaceOrder.deleteMany({}), VendorOrder.deleteMany({}),
    Payment.deleteMany({}), IdempotencyRecord.deleteMany({}), ProcessedStripeEvent.deleteMany({}),
  ]);
}

async function product(vendor: mongoose.Types.ObjectId, name: string, price: number, quantity: number) {
  const doc = await Product.create({
    vendor, name, subtitle: `${name} subtitle`, brand: "Test", descriptoion: "Test product", category: "test",
    price, images: ["https://example.com/item.png"], ratings: 0, reviews: [], productIsNew: true, status: "active",
  });
  await Inventory.create({ product: doc._id, vendor, sku: `SKU-${doc._id.toString().slice(-8)}`, quantity, status: quantity > 0 ? "available" : "unavailable" });
  return doc;
}

test("real MongoDB commerce invariants", { skip: !mongoUrl }, async (t) => {
  if (!mongoUrl) return;
  await mongoose.connect(mongoUrl);
  await clean();
  t.after(async () => { await clean(); await mongoose.disconnect(); });

  await t.test("server price wins and multivendor totals reconcile", async () => {
    const customer = new mongoose.Types.ObjectId();
    const vendorA = new mongoose.Types.ObjectId();
    const vendorB = new mongoose.Types.ObjectId();
    const a = await product(vendorA, "A", 10.99, 5);
    const b = await product(vendorB, "B", 5.5, 5);
    const gateway = new FakeGateway();
    const result = await createCheckout(customer, {
      items: [{ productId: a._id.toString(), quantity: 2 }, { productId: b._id.toString(), quantity: 1 }], shippingAddress,
    }, "integration-price-1", gateway);
    assert.equal(result.totals.subtotalMinor, 2748);
    assert.equal(gateway.createCalls[0]?.amountMinor, result.totals.totalMinor);
    const vendorOrders = await VendorOrder.find({ marketplaceOrder: result.orderId });
    assert.equal(vendorOrders.length, 2);
    assert.equal(vendorOrders.reduce((sum, order) => sum + order.totalMinor, 0), result.totals.totalMinor);
  });

  await t.test("last item race allows at most one checkout and stock never goes negative", async () => {
    await clean();
    const customerA = new mongoose.Types.ObjectId();
    const customerB = new mongoose.Types.ObjectId();
    const vendor = new mongoose.Types.ObjectId();
    const item = await product(vendor, "Last item", 20, 1);
    const gateway = new FakeGateway();
    const settled = await Promise.allSettled([
      createCheckout(customerA, { items: [{ productId: item._id.toString(), quantity: 1 }], shippingAddress }, "race-customer-a", gateway),
      createCheckout(customerB, { items: [{ productId: item._id.toString(), quantity: 1 }], shippingAddress }, "race-customer-b", gateway),
    ]);
    assert.equal(settled.filter((entry) => entry.status === "fulfilled").length, 1);
    assert.equal(settled.filter((entry) => entry.status === "rejected").length, 1);
    const inventory = await Inventory.findOne({ product: item._id });
    assert.equal(inventory?.quantity, 0);
  });

  await t.test("multi-item failure rolls back earlier inventory reservation and order documents", async () => {
    await clean();
    const customer = new mongoose.Types.ObjectId();
    const vendor = new mongoose.Types.ObjectId();
    const available = await product(vendor, "Available", 10, 1);
    const unavailable = await product(vendor, "Unavailable", 10, 0);
    const gateway = new FakeGateway();
    await assert.rejects(createCheckout(customer, {
      items: [{ productId: available._id.toString(), quantity: 1 }, { productId: unavailable._id.toString(), quantity: 1 }], shippingAddress,
    }, "multi-item-failure", gateway));
    assert.equal((await Inventory.findOne({ product: available._id }))?.quantity, 1);
    assert.equal(await MarketplaceOrder.countDocuments({ customer }), 0);
    assert.equal(await VendorOrder.countDocuments({ customer }), 0);
  });

  await t.test("same checkout idempotency key produces one order and one stock decrement", async () => {
    await clean();
    const customer = new mongoose.Types.ObjectId();
    const vendor = new mongoose.Types.ObjectId();
    const item = await product(vendor, "Idempotent", 15, 2);
    const gateway = new FakeGateway();
    const payload = { items: [{ productId: item._id.toString(), quantity: 1 }], shippingAddress };
    const first = await createCheckout(customer, payload, "same-checkout-key", gateway);
    const second = await createCheckout(customer, payload, "same-checkout-key", gateway);
    assert.equal(first.orderId, second.orderId);
    assert.equal(await MarketplaceOrder.countDocuments({ customer }), 1);
    assert.equal((await Inventory.findOne({ product: item._id }))?.quantity, 1);
  });

  await t.test("customer and vendor reads are ownership filtered and cancellation restores stock", async () => {
    await clean();
    const customerA = new mongoose.Types.ObjectId();
    const customerB = new mongoose.Types.ObjectId();
    const vendorA = new mongoose.Types.ObjectId();
    const vendorB = new mongoose.Types.ObjectId();
    const item = await product(vendorA, "Owned", 30, 2);
    const gateway = new FakeGateway();
    const result = await createCheckout(customerA, { items: [{ productId: item._id.toString(), quantity: 1 }], shippingAddress }, "ownership-cancel", gateway);
    assert.equal(await getCustomerOrder(customerB, result.orderId), null);
    assert.equal((await listVendorOrders(vendorB)).items.length, 0);
    const ownedOrders = (await listVendorOrders(vendorA)).items;
    assert.equal(ownedOrders.length, 1);
    assert.equal(await transitionVendorOrder(vendorB, ownedOrders[0]!._id.toString(), "processing"), null);
    await cancelPendingCustomerOrder(customerA, result.orderId, gateway);
    assert.equal((await Inventory.findOne({ product: item._id }))?.quantity, 2);
  });

});
