import MarketplaceOrder = require("../models/MarketplaceOrder");
import Payment = require("../models/Payment");
import { MARKETPLACE_ORDER_STATUSES, PAYMENT_STATUSES } from "../domain/commerce";
import { paymentGateway, type PaymentGateway } from "./paymentGateway";
import { releaseExpiredOrder } from "./orderService";

export async function cleanupExpiredReservations(limit = 100, gateway: PaymentGateway = paymentGateway()): Promise<number> {
  const orders = await MarketplaceOrder.find({
    status: MARKETPLACE_ORDER_STATUSES.PAYMENT_PENDING,
    reservationExpiresAt: { $lte: new Date() },
    inventoryReleased: false,
  }).select("_id").sort({ reservationExpiresAt: 1 }).limit(limit).lean();

  let released = 0;
  for (const order of orders) {
    const payment = await Payment.findOne({ marketplaceOrder: order._id });
    if (payment?.status === PAYMENT_STATUSES.PAID || payment?.status === PAYMENT_STATUSES.REFUNDED) continue;
    if (payment?.paymentIntentId) {
      try {
        const intent = await gateway.retrievePaymentIntent(payment.paymentIntentId);
        if (intent.status === "succeeded" || intent.status === "processing") continue;
        await gateway.cancelPaymentIntent(payment.paymentIntentId);
      } catch {
        continue;
      }
    }
    if (await releaseExpiredOrder(order._id)) released += 1;
  }
  return released;
}

export function startReservationCleanup(intervalMs = 5 * 60_000): NodeJS.Timeout {
  const timer = setInterval(() => {
    cleanupExpiredReservations().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown reservation cleanup error";
      console.error(`Reservation cleanup failed: ${message}`);
    });
  }, intervalMs);
  timer.unref();
  return timer;
}
