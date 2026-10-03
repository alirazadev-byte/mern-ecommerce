import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Stripe from "stripe";

test("Stripe webhook is mounted before JSON body parsing and uses raw payload", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "..", "server.ts"), "utf8");
  const webhook = source.indexOf('app.post("/api/v2/payments/webhook"');
  const json = source.indexOf("app.use(express.json");
  assert.ok(webhook >= 0);
  assert.ok(json > webhook);
  assert.match(source, /express\.raw\(\{ type: "application\/json" \}\)/);
});

test("Stripe signature verification accepts a valid test signature and rejects an invalid one", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_phase4";
  process.env.STRIPE_API_KEY = "pk_test_phase4";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_phase4_test";
  const { paymentGateway } = await import("../services/paymentGateway");
  const payload = JSON.stringify({ id: "evt_phase4", object: "event", type: "payment_intent.succeeded", data: { object: { id: "pi_phase4", object: "payment_intent" } } });
  const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET });
  const event = paymentGateway().constructWebhookEvent(Buffer.from(payload), signature);
  assert.equal(event.id, "evt_phase4");
  assert.throws(() => paymentGateway().constructWebhookEvent(Buffer.from(payload), "bad-signature"));
});

test("webhook service persists provider event identifiers for deduplication", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "..", "services", "stripeWebhookService.ts"), "utf8");
  assert.match(source, /ProcessedStripeEvent/);
  assert.match(source, /eventId:\s*event\.id/);
});
