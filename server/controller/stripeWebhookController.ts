import type { Request, Response } from "express";
import type Stripe from "stripe";
import { paymentGateway } from "../services/paymentGateway";
import { processStripeEvent } from "../services/stripeWebhookService";

export async function stripeWebhook(req: Request, res: Response) {
  const signature = req.header("stripe-signature");
  if (!signature || !Buffer.isBuffer(req.body)) return res.status(400).json({ success: false, message: "Invalid Stripe webhook request" });
  const gateway = paymentGateway();
  let event: Stripe.Event;
  try {
    event = gateway.constructWebhookEvent(req.body, signature);
  } catch {
    return res.status(400).json({ success: false, message: "Invalid Stripe webhook signature" });
  }
  try {
    const result = await processStripeEvent(event, gateway);
    return res.json({ received: true, result });
  } catch {
    return res.status(500).json({ success: false, message: "Stripe webhook processing failed" });
  }
}
