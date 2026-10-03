import test from "node:test";
import assert from "node:assert/strict";
import { canTransitionFulfillment, canTransitionMarketplaceOrder, canTransitionPayment } from "../domain/commerce";
import { legacyPriceToMinor, allocateShippingMinor } from "../utils/money";

test("fulfillment state machine accepts only forward business transitions", () => {
  assert.equal(canTransitionFulfillment("pending", "processing"), true);
  assert.equal(canTransitionFulfillment("processing", "shipped"), true);
  assert.equal(canTransitionFulfillment("shipped", "delivered"), true);
  assert.equal(canTransitionFulfillment("delivered", "pending"), false);
  assert.equal(canTransitionFulfillment("cancelled", "shipped"), false);
});

test("legacy product price has one controlled minor-unit conversion boundary", () => {
  assert.equal(legacyPriceToMinor(10.99), 1099);
  assert.equal(legacyPriceToMinor(0), 0);
  assert.throws(() => legacyPriceToMinor(-1));
});

test("shipping is calculated from server minor-unit subtotal", () => {
  assert.equal(allocateShippingMinor(1099), 110);
});


test("marketplace and payment states reject backwards transitions", () => {
  assert.equal(canTransitionMarketplaceOrder("payment_pending", "paid"), true);
  assert.equal(canTransitionMarketplaceOrder("paid", "payment_pending"), false);
  assert.equal(canTransitionMarketplaceOrder("refunded", "paid"), false);
  assert.equal(canTransitionPayment("failed", "paid"), true);
  assert.equal(canTransitionPayment("paid", "failed"), false);
});
