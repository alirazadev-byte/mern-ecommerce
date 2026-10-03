import crypto from "crypto";
import type { Types } from "mongoose";
import MarketplaceOrder = require("../models/MarketplaceOrder");
import VendorOrder = require("../models/VendorOrder");
import Payment = require("../models/Payment");
import IdempotencyRecord = require("../models/IdempotencyRecord");
import ErrorHandler = require("../utils/Errorhandler");
import { FULFILLMENT_STATUSES, IDEMPOTENCY_SCOPES, MARKETPLACE_ORDER_STATUSES, PAYMENT_STATUSES, canTransitionMarketplaceOrder, canTransitionPayment } from "../domain/commerce";
import { withTransaction } from "./transactionService";
import { restoreInventoryForFullRefund } from "./orderService";
import { paymentGateway, type PaymentGateway } from "./paymentGateway";

export async function refundOrder(adminId: Types.ObjectId, orderId: string, key: string, gateway: PaymentGateway = paymentGateway()) {
  const requestHash = crypto.createHash("sha256").update(orderId).digest("hex");
  const existing = await IdempotencyRecord.findOne({ scope: IDEMPOTENCY_SCOPES.REFUND, actor: adminId, key });
  if (existing) {
    if (existing.requestHash !== requestHash) throw new ErrorHandler("Idempotency key was already used for another refund", 409);
    if (!existing.resourceId) throw new ErrorHandler("Refund is already being processed", 409);
    const payment = await Payment.findById(existing.resourceId);
    if (!payment) throw new ErrorHandler("Refund idempotency record is invalid", 409);
    return payment;
  }

  const order = await MarketplaceOrder.findById(orderId);
  if (!order || order.status !== MARKETPLACE_ORDER_STATUSES.PAID) throw new ErrorHandler("Only paid orders can be refunded", 409);
  const vendorOrders = await VendorOrder.find({ marketplaceOrder: order._id });
  if (vendorOrders.some((vendorOrder) => vendorOrder.status === FULFILLMENT_STATUSES.SHIPPED || vendorOrder.status === FULFILLMENT_STATUSES.DELIVERED)) {
    throw new ErrorHandler("Orders already shipped or delivered cannot be refunded by this operation", 409);
  }
  const payment = await Payment.findOne({ marketplaceOrder: order._id, status: PAYMENT_STATUSES.PAID });
  if (!payment?.paymentIntentId) throw new ErrorHandler("Paid order has no Stripe PaymentIntent", 409);

  try {
    await IdempotencyRecord.create({ scope: IDEMPOTENCY_SCOPES.REFUND, actor: adminId, key, requestHash, completed: false });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && Reflect.get(error, "code") === 11000) {
      const duplicate = await IdempotencyRecord.findOne({ scope: IDEMPOTENCY_SCOPES.REFUND, actor: adminId, key });
      if (!duplicate || duplicate.requestHash !== requestHash) throw new ErrorHandler("Idempotency key conflict", 409);
      if (!duplicate.resourceId) throw new ErrorHandler("Refund is already being processed", 409);
      const duplicatePayment = await Payment.findById(duplicate.resourceId);
      if (!duplicatePayment) throw new ErrorHandler("Refund idempotency record is invalid", 409);
      return duplicatePayment;
    }
    throw error;
  }
  try {
    await gateway.refundPaymentIntent(payment.paymentIntentId, `refund:${adminId.toString()}:${key}`);
    return withTransaction(async (session) => {
      const lockedOrder = await MarketplaceOrder.findOne({ _id: order._id, status: MARKETPLACE_ORDER_STATUSES.PAID }).session(session);
      if (!lockedOrder) throw new ErrorHandler("Order refund state changed while processing", 409);
      await restoreInventoryForFullRefund(lockedOrder._id, session);
      if (!canTransitionMarketplaceOrder(lockedOrder.status, MARKETPLACE_ORDER_STATUSES.REFUNDED)) throw new ErrorHandler("Invalid order refund transition", 409);
      lockedOrder.status = MARKETPLACE_ORDER_STATUSES.REFUNDED;
      lockedOrder.refundedAt = new Date();
      await lockedOrder.save({ session });
      await VendorOrder.updateMany({ marketplaceOrder: lockedOrder._id }, { $set: { status: FULFILLMENT_STATUSES.CANCELLED } }, { session });
      const updatedPayment = await Payment.findById(payment._id).session(session);
      if (!updatedPayment || !canTransitionPayment(updatedPayment.status, PAYMENT_STATUSES.REFUNDED)) throw new ErrorHandler("Payment could not be marked refunded", 409);
      updatedPayment.status = PAYMENT_STATUSES.REFUNDED;
      updatedPayment.refundedMinor = updatedPayment.amountMinor;
      await updatedPayment.save({ session });
      await IdempotencyRecord.updateOne({ scope: IDEMPOTENCY_SCOPES.REFUND, actor: adminId, key }, { $set: { resourceId: updatedPayment._id, completed: true } }, { session });
      return updatedPayment;
    });
  } catch (error) {
    await IdempotencyRecord.deleteOne({ scope: IDEMPOTENCY_SCOPES.REFUND, actor: adminId, key, completed: false });
    throw error;
  }
}
