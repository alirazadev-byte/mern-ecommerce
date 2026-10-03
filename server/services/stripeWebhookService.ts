import type Stripe from "stripe";
import type { ClientSession } from "mongoose";
import MarketplaceOrder = require("../models/MarketplaceOrder");
import VendorOrder = require("../models/VendorOrder");
import Payment = require("../models/Payment");
import ProcessedStripeEvent = require("../models/ProcessedStripeEvent");
import { FULFILLMENT_STATUSES, MARKETPLACE_ORDER_STATUSES, PAYMENT_STATUSES, canTransitionMarketplaceOrder, canTransitionPayment } from "../domain/commerce";
import { withTransaction } from "./transactionService";
import { restoreInventoryForFullRefund } from "./orderService";
import type { PaymentGateway } from "./paymentGateway";

function paymentIntentFromEvent(event: Stripe.Event): Stripe.PaymentIntent | null {
  if (!event.type.startsWith("payment_intent.")) return null;
  return event.data.object as Stripe.PaymentIntent;
}

async function alreadyProcessed(eventId: string): Promise<boolean> {
  return Boolean(await ProcessedStripeEvent.exists({ eventId }));
}

async function markProcessed(event: Stripe.Event, session: ClientSession): Promise<void> {
  await ProcessedStripeEvent.create([{ eventId: event.id, type: event.type, processedAt: new Date() }], { session });
}

export async function processStripeEvent(event: Stripe.Event, gateway: PaymentGateway): Promise<"processed" | "duplicate" | "ignored"> {
  if (await alreadyProcessed(event.id)) return "duplicate";
  const intent = paymentIntentFromEvent(event);
  if (!intent) {
    try { await ProcessedStripeEvent.create({ eventId: event.id, type: event.type, processedAt: new Date() }); }
    catch (error: unknown) { if (typeof error === "object" && error !== null && Reflect.get(error, "code") === 11000) return "duplicate"; throw error; }
    return "ignored";
  }

  const payment = await Payment.findOne({ paymentIntentId: intent.id });
  if (!payment) {
    try { await ProcessedStripeEvent.create({ eventId: event.id, type: event.type, processedAt: new Date() }); }
    catch (error: unknown) { if (typeof error === "object" && error !== null && Reflect.get(error, "code") === 11000) return "duplicate"; throw error; }
    return "ignored";
  }
  const order = await MarketplaceOrder.findById(payment.marketplaceOrder);
  if (!order) return "ignored";

  if (event.type === "payment_intent.succeeded" && order.status === MARKETPLACE_ORDER_STATUSES.CANCELLED) {
    await gateway.refundPaymentIntent(intent.id, `late-success-refund:${event.id}`);
  }

  try {
    return await withTransaction(async (session) => {
      if (await ProcessedStripeEvent.exists({ eventId: event.id }).session(session)) return "duplicate" as const;
      const lockedPayment = await Payment.findById(payment._id).session(session);
      const lockedOrder = await MarketplaceOrder.findById(order._id).session(session);
      if (!lockedPayment || !lockedOrder) return "ignored" as const;

      if (event.type === "payment_intent.succeeded") {
        if (lockedOrder.status === MARKETPLACE_ORDER_STATUSES.CANCELLED) {
          if (canTransitionMarketplaceOrder(lockedOrder.status, MARKETPLACE_ORDER_STATUSES.REFUNDED)) lockedOrder.status = MARKETPLACE_ORDER_STATUSES.REFUNDED;
          lockedOrder.refundedAt = new Date();
          if (canTransitionPayment(lockedPayment.status, PAYMENT_STATUSES.REFUNDED)) lockedPayment.status = PAYMENT_STATUSES.REFUNDED;
          lockedPayment.refundedMinor = lockedPayment.amountMinor;
        } else if (lockedOrder.status === MARKETPLACE_ORDER_STATUSES.PAYMENT_PENDING) {
          if (canTransitionMarketplaceOrder(lockedOrder.status, MARKETPLACE_ORDER_STATUSES.PAID)) lockedOrder.status = MARKETPLACE_ORDER_STATUSES.PAID;
          lockedOrder.paidAt = new Date();
          if (canTransitionPayment(lockedPayment.status, PAYMENT_STATUSES.PAID)) lockedPayment.status = PAYMENT_STATUSES.PAID;
        }
        await lockedOrder.save({ session });
        await lockedPayment.save({ session });
      } else if (event.type === "payment_intent.payment_failed") {
        if (lockedPayment.status !== PAYMENT_STATUSES.PAID && lockedPayment.status !== PAYMENT_STATUSES.REFUNDED) {
          if (canTransitionPayment(lockedPayment.status, PAYMENT_STATUSES.FAILED)) lockedPayment.status = PAYMENT_STATUSES.FAILED;
          lockedPayment.lastFailureCode = intent.last_payment_error?.code ?? undefined;
          lockedPayment.lastFailureMessage = intent.last_payment_error?.message ?? undefined;
          await lockedPayment.save({ session });
        }
      } else if (event.type === "payment_intent.processing") {
        if (lockedPayment.status !== PAYMENT_STATUSES.PAID) {
          if (canTransitionPayment(lockedPayment.status, PAYMENT_STATUSES.PROCESSING)) lockedPayment.status = PAYMENT_STATUSES.PROCESSING;
          await lockedPayment.save({ session });
        }
      } else if (event.type === "payment_intent.canceled") {
        if (lockedOrder.status === MARKETPLACE_ORDER_STATUSES.PAYMENT_PENDING) {
          await restoreInventoryForFullRefund(lockedOrder._id, session);
          if (canTransitionMarketplaceOrder(lockedOrder.status, MARKETPLACE_ORDER_STATUSES.CANCELLED)) lockedOrder.status = MARKETPLACE_ORDER_STATUSES.CANCELLED;
          lockedOrder.cancelledAt = new Date();
          await lockedOrder.save({ session });
          await VendorOrder.updateMany({ marketplaceOrder: lockedOrder._id }, { $set: { status: FULFILLMENT_STATUSES.CANCELLED } }, { session });
        }
        if (lockedPayment.status !== PAYMENT_STATUSES.PAID && lockedPayment.status !== PAYMENT_STATUSES.REFUNDED) {
          if (canTransitionPayment(lockedPayment.status, PAYMENT_STATUSES.CANCELLED)) lockedPayment.status = PAYMENT_STATUSES.CANCELLED;
          await lockedPayment.save({ session });
        }
      }

      await markProcessed(event, session);
      return "processed" as const;
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && Reflect.get(error, "code") === 11000) return "duplicate";
    throw error;
  }
}
