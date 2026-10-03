import crypto from "crypto";
import mongoose, { type ClientSession, type HydratedDocument, type Types } from "mongoose";
import Product = require("../models/ProductModel");
import Inventory = require("../models/Inventory");
import MarketplaceOrder = require("../models/MarketplaceOrder");
import type { MarketplaceOrderRecord, PaymentRecord } from "../domain/commerce";
import VendorOrder = require("../models/VendorOrder");
import Payment = require("../models/Payment");
import IdempotencyRecord = require("../models/IdempotencyRecord");
import ErrorHandler = require("../utils/Errorhandler");
import { PRODUCT_STATUSES } from "../domain/catalog";
import { DEFAULT_CURRENCY, legacyPriceToMinor, allocateShippingMinor } from "../utils/money";
import { IDEMPOTENCY_SCOPES, MARKETPLACE_ORDER_STATUSES, PAYMENT_STATUSES, RESERVATION_TTL_MINUTES, type CheckoutRequest, type OrderItemSnapshot } from "../domain/commerce";
import { reserveInventory, type ReservationLine } from "./inventoryReservationService";
import { withTransaction } from "./transactionService";
import { paymentGateway, type PaymentGateway } from "./paymentGateway";

interface VendorGroup {
  vendorId: string;
  items: OrderItemSnapshot[];
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
}

export interface CheckoutResult {
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  totals: { subtotalMinor: number; shippingMinor: number; discountMinor: number; taxMinor: number; totalMinor: number; currency: "INR" };
  reservationExpiresAt: string;
}

function requestHash(input: CheckoutRequest): string {
  const canonical = JSON.stringify({
    items: [...input.items].sort((a, b) => a.productId.localeCompare(b.productId)),
    shippingAddress: input.shippingAddress,
  });
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

async function loadOrderForRetry(customerId: Types.ObjectId, key: string, hash: string, gateway: PaymentGateway): Promise<CheckoutResult | null> {
  const record = await IdempotencyRecord.findOne({ scope: IDEMPOTENCY_SCOPES.CHECKOUT, actor: customerId, key });
  if (!record) return null;
  if (record.requestHash !== hash) throw new ErrorHandler("Idempotency key was already used with a different checkout request", 409);
  if (!record.resourceId) throw new ErrorHandler("Checkout with this idempotency key is still being processed", 409);
  const order = await MarketplaceOrder.findOne({ _id: record.resourceId, customer: customerId });
  const payment = order ? await Payment.findOne({ marketplaceOrder: order._id, customer: customerId }) : null;
  if (!order || !payment) throw new ErrorHandler("Stored idempotent checkout could not be resolved", 409);
  return ensurePaymentIntent(order, payment, customerId, key, gateway);
}

function paymentStatusFromStripe(status: string): "pending" | "requires_action" | "processing" | "paid" {
  if (status === "succeeded") return PAYMENT_STATUSES.PAID;
  if (status === "processing") return PAYMENT_STATUSES.PROCESSING;
  if (status === "requires_action" || status === "requires_payment_method" || status === "requires_confirmation") return PAYMENT_STATUSES.REQUIRES_ACTION;
  return PAYMENT_STATUSES.PENDING;
}

async function ensurePaymentIntent(order: HydratedDocument<MarketplaceOrderRecord>, payment: HydratedDocument<PaymentRecord>, customerId: Types.ObjectId, key: string, gateway: PaymentGateway): Promise<CheckoutResult> {
  let clientSecret: string | undefined;
  if (!payment.paymentIntentId) {
    const intent = await gateway.createPaymentIntent({
      amountMinor: order.totalMinor,
      currency: "inr",
      marketplaceOrderId: order._id.toString(),
      customerId: customerId.toString(),
      idempotencyKey: `checkout:${customerId.toString()}:${key}`,
    });
    payment.paymentIntentId = intent.id;
    payment.status = paymentStatusFromStripe(intent.status);
    await payment.save();
    clientSecret = intent.clientSecret;
  } else {
    const intent = await gateway.retrievePaymentIntent(payment.paymentIntentId);
    clientSecret = intent.clientSecret;
    payment.status = paymentStatusFromStripe(intent.status);
    await payment.save();
  }
  return {
    orderId: order._id.toString(),
    paymentIntentId: payment.paymentIntentId!,
    clientSecret,
    status: order.status,
    totals: {
      subtotalMinor: order.subtotalMinor,
      shippingMinor: order.shippingMinor,
      discountMinor: order.discountMinor,
      taxMinor: order.taxMinor,
      totalMinor: order.totalMinor,
      currency: order.currency,
    },
    reservationExpiresAt: order.reservationExpiresAt.toISOString(),
  };
}

async function createCheckoutTransaction(customerId: Types.ObjectId, input: CheckoutRequest, key: string, hash: string): Promise<{ order: HydratedDocument<MarketplaceOrderRecord>; payment: HydratedDocument<PaymentRecord> }> {
  return withTransaction(async (session: ClientSession) => {
    await IdempotencyRecord.create([{ scope: IDEMPOTENCY_SCOPES.CHECKOUT, actor: customerId, key, requestHash: hash, completed: false }], { session });

    const productIds = input.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds }, status: PRODUCT_STATUSES.ACTIVE }).session(session);
    if (products.length !== productIds.length) throw new ErrorHandler("One or more products are unavailable", 409);

    const inventories = await Inventory.find({ product: { $in: productIds } }).session(session);
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));
    const inventoryMap = new Map(inventories.map((inventory) => [inventory.product.toString(), inventory]));
    const groups = new Map<string, VendorGroup>();
    const reservations: ReservationLine[] = [];

    for (const requested of input.items) {
      const product = productMap.get(requested.productId);
      const inventory = inventoryMap.get(requested.productId);
      if (!product?.vendor || !inventory || inventory.vendor.toString() !== product.vendor.toString()) {
        throw new ErrorHandler(`Product ${requested.productId} is not available for checkout`, 409);
      }
      const unitPriceMinor = legacyPriceToMinor(product.price);
      const lineTotalMinor = unitPriceMinor * requested.quantity;
      const vendorId = product.vendor.toString();
      const item: OrderItemSnapshot = {
        productId: product._id.toString(), vendorId, sku: inventory.sku, productName: product.name,
        image: product.images[0], quantity: requested.quantity, unitPriceMinor, lineTotalMinor, currency: DEFAULT_CURRENCY,
      };
      const group = groups.get(vendorId) ?? { vendorId, items: [], subtotalMinor: 0, shippingMinor: 0, totalMinor: 0 };
      group.items.push(item);
      group.subtotalMinor += lineTotalMinor;
      groups.set(vendorId, group);
      reservations.push({ productId: product._id.toString(), vendorId, quantity: requested.quantity });
    }

    for (const group of groups.values()) {
      group.shippingMinor = allocateShippingMinor(group.subtotalMinor);
      group.totalMinor = group.subtotalMinor + group.shippingMinor;
    }
    const subtotalMinor = [...groups.values()].reduce((sum, group) => sum + group.subtotalMinor, 0);
    const shippingMinor = [...groups.values()].reduce((sum, group) => sum + group.shippingMinor, 0);
    const totalMinor = subtotalMinor + shippingMinor;

    await reserveInventory(reservations, session);
    const reservationExpiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60_000);
    const [order] = await MarketplaceOrder.create([{
      customer: customerId, status: MARKETPLACE_ORDER_STATUSES.PAYMENT_PENDING, currency: DEFAULT_CURRENCY,
      subtotalMinor, shippingMinor, discountMinor: 0, taxMinor: 0, totalMinor,
      shippingAddress: input.shippingAddress, reservationExpiresAt, inventoryReleased: false, checkoutIdempotencyKey: key,
    }], { session });

    if (!order) throw new Error("Marketplace order was not created");

    await VendorOrder.insertMany([...groups.values()].map((group) => ({
      marketplaceOrder: order._id, customer: customerId, vendor: new mongoose.Types.ObjectId(group.vendorId),
      currency: DEFAULT_CURRENCY, subtotalMinor: group.subtotalMinor, shippingMinor: group.shippingMinor,
      totalMinor: group.totalMinor, items: group.items, shippingAddress: input.shippingAddress,
    })), { session });

    const [payment] = await Payment.create([{
      marketplaceOrder: order._id, customer: customerId, provider: "stripe", status: PAYMENT_STATUSES.PENDING,
      amountMinor: totalMinor, currency: DEFAULT_CURRENCY, refundedMinor: 0,
    }], { session });

    if (!payment) throw new Error("Payment record was not created");

    await IdempotencyRecord.updateOne(
      { scope: IDEMPOTENCY_SCOPES.CHECKOUT, actor: customerId, key },
      { $set: { resourceId: order._id, completed: true } },
      { session }
    );
    return { order, payment };
  });
}

export async function createCheckout(customerId: Types.ObjectId, input: CheckoutRequest, key: string, gateway: PaymentGateway = paymentGateway()): Promise<CheckoutResult> {
  const hash = requestHash(input);
  const retry = await loadOrderForRetry(customerId, key, hash, gateway);
  if (retry) return retry;
  try {
    const { order, payment } = await createCheckoutTransaction(customerId, input, key, hash);
    return ensurePaymentIntent(order, payment, customerId, key, gateway);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && Reflect.get(error, "code") === 11000) {
      const duplicate = await loadOrderForRetry(customerId, key, hash, gateway);
      if (duplicate) return duplicate;
    }
    throw error;
  }
}
