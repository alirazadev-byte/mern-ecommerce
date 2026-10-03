import type { ClientSession, Types } from "mongoose";
import MarketplaceOrder = require("../models/MarketplaceOrder");
import VendorOrder = require("../models/VendorOrder");
import Payment = require("../models/Payment");
import ErrorHandler = require("../utils/Errorhandler");
import { FULFILLMENT_STATUSES, MARKETPLACE_ORDER_STATUSES, PAYMENT_STATUSES, canTransitionFulfillment, canTransitionMarketplaceOrder, canTransitionPayment, type FulfillmentStatus } from "../domain/commerce";
import { restoreInventory, type ReservationLine } from "./inventoryReservationService";
import { withTransaction } from "./transactionService";
import { paymentGateway, type PaymentGateway } from "./paymentGateway";

function reservationLines(vendorOrders: Array<{ vendor: Types.ObjectId; items: Array<{ productId: string; quantity: number }> }>): ReservationLine[] {
  return vendorOrders.flatMap((order) => order.items.map((item) => ({ productId: item.productId, vendorId: order.vendor.toString(), quantity: item.quantity })));
}

async function releaseOrderInventory(orderId: Types.ObjectId, session: ClientSession): Promise<void> {
  const order = await MarketplaceOrder.findById(orderId).session(session);
  if (!order || order.inventoryReleased) return;
  const vendorOrders = await VendorOrder.find({ marketplaceOrder: orderId }).session(session);
  await restoreInventory(reservationLines(vendorOrders), session);
  order.inventoryReleased = true;
  await order.save({ session });
}

export async function listCustomerOrders(customerId: Types.ObjectId, page = 1, perPage = 20) {
  const safePage = Math.max(1, page);
  const safePerPage = Math.min(100, Math.max(1, perPage));
  const filter = { customer: customerId };
  const [items, totalItems] = await Promise.all([
    MarketplaceOrder.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safePerPage).limit(safePerPage).lean(),
    MarketplaceOrder.countDocuments(filter),
  ]);
  return { items, pagination: { currentPage: safePage, perPage: safePerPage, totalItems, totalPages: Math.ceil(totalItems / safePerPage) } };
}

export async function getCustomerOrder(customerId: Types.ObjectId, orderId: string) {
  const order = await MarketplaceOrder.findOne({ _id: orderId, customer: customerId }).lean();
  if (!order) return null;
  const vendorOrders = await VendorOrder.find({ marketplaceOrder: order._id }).select("status vendor subtotalMinor shippingMinor totalMinor items createdAt updatedAt").lean();
  const payment = await Payment.findOne({ marketplaceOrder: order._id, customer: customerId }).select("status amountMinor currency refundedMinor").lean();
  return { ...order, vendorOrders, payment };
}

export async function listVendorOrders(vendorId: Types.ObjectId, page = 1, perPage = 20) {
  const safePage = Math.max(1, page);
  const safePerPage = Math.min(100, Math.max(1, perPage));
  const filter = { vendor: vendorId };
  const [items, totalItems] = await Promise.all([
    VendorOrder.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safePerPage).limit(safePerPage).lean(),
    VendorOrder.countDocuments(filter),
  ]);
  return { items, pagination: { currentPage: safePage, perPage: safePerPage, totalItems, totalPages: Math.ceil(totalItems / safePerPage) } };
}

export async function transitionVendorOrder(vendorId: Types.ObjectId, vendorOrderId: string, target: FulfillmentStatus) {
  const order = await VendorOrder.findOne({ _id: vendorOrderId, vendor: vendorId });
  if (!order) return null;
  if (!canTransitionFulfillment(order.status, target)) {
    throw new ErrorHandler(`Cannot transition fulfillment from ${order.status} to ${target}`, 409);
  }
  const marketplaceOrder = await MarketplaceOrder.findById(order.marketplaceOrder);
  if (!marketplaceOrder || marketplaceOrder.status !== MARKETPLACE_ORDER_STATUSES.PAID) {
    throw new ErrorHandler("Fulfillment cannot advance before payment is confirmed", 409);
  }
  order.status = target;
  await order.save();
  return order;
}

export async function cancelPendingCustomerOrder(customerId: Types.ObjectId, orderId: string, gateway: PaymentGateway = paymentGateway()) {
  const order = await MarketplaceOrder.findOne({ _id: orderId, customer: customerId });
  if (!order) return null;
  if (order.status !== MARKETPLACE_ORDER_STATUSES.PAYMENT_PENDING) throw new ErrorHandler("Only payment-pending orders can be cancelled by the customer", 409);
  const payment = await Payment.findOne({ marketplaceOrder: order._id, customer: customerId });
  if (payment?.paymentIntentId) await gateway.cancelPaymentIntent(payment.paymentIntentId);

  return withTransaction(async (session) => {
    const locked = await MarketplaceOrder.findOne({ _id: order._id, customer: customerId, status: MARKETPLACE_ORDER_STATUSES.PAYMENT_PENDING }).session(session);
    if (!locked) throw new ErrorHandler("Order can no longer be cancelled", 409);
    await releaseOrderInventory(locked._id, session);
    if (!canTransitionMarketplaceOrder(locked.status, MARKETPLACE_ORDER_STATUSES.CANCELLED)) throw new ErrorHandler("Invalid order cancellation transition", 409);
    locked.status = MARKETPLACE_ORDER_STATUSES.CANCELLED;
    locked.cancelledAt = new Date();
    await locked.save({ session });
    await VendorOrder.updateMany({ marketplaceOrder: locked._id }, { $set: { status: FULFILLMENT_STATUSES.CANCELLED } }, { session });
    const lockedPayment = await Payment.findOne({ marketplaceOrder: locked._id }).session(session);
    if (lockedPayment && canTransitionPayment(lockedPayment.status, PAYMENT_STATUSES.CANCELLED)) {
      lockedPayment.status = PAYMENT_STATUSES.CANCELLED;
      await lockedPayment.save({ session });
    }
    return locked;
  });
}

export async function releaseExpiredOrder(orderId: Types.ObjectId): Promise<boolean> {
  return withTransaction(async (session) => {
    const order = await MarketplaceOrder.findOne({
      _id: orderId,
      status: MARKETPLACE_ORDER_STATUSES.PAYMENT_PENDING,
      reservationExpiresAt: { $lte: new Date() },
      inventoryReleased: false,
    }).session(session);
    if (!order) return false;
    await releaseOrderInventory(order._id, session);
    if (!canTransitionMarketplaceOrder(order.status, MARKETPLACE_ORDER_STATUSES.CANCELLED)) return false;
    order.status = MARKETPLACE_ORDER_STATUSES.CANCELLED;
    order.cancelledAt = new Date();
    await order.save({ session });
    await VendorOrder.updateMany({ marketplaceOrder: order._id }, { $set: { status: FULFILLMENT_STATUSES.CANCELLED } }, { session });
    const payment = await Payment.findOne({ marketplaceOrder: order._id }).session(session);
    if (payment && canTransitionPayment(payment.status, PAYMENT_STATUSES.CANCELLED)) {
      payment.status = PAYMENT_STATUSES.CANCELLED;
      await payment.save({ session });
    }
    return true;
  });
}

export async function restoreInventoryForFullRefund(orderId: Types.ObjectId, session: ClientSession): Promise<void> {
  await releaseOrderInventory(orderId, session);
}
