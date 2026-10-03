import test from "node:test";
import assert from "node:assert/strict";
import { parseCheckoutRequest } from "../validation/commerceValidation";

const shippingAddress = {
  recipientName: "Customer",
  email: "customer@example.com",
  country: "PK",
  city: "PB",
  address1: "123 Main Street",
  postalCode: "54000",
};

test("checkout accepts identifiers and quantities without client money", () => {
  const parsed = parseCheckoutRequest({ items: [{ productId: "product-1", quantity: 2 }], shippingAddress });
  assert.equal(parsed.items[0]?.quantity, 2);
  assert.equal(parsed.shippingAddress.country, "PK");
});

test("checkout rejects client-controlled price and total fields", () => {
  assert.throws(() => parseCheckoutRequest({
    items: [{ productId: "product-1", quantity: 1, price: 1 }],
    shippingAddress,
    totalMinor: 1,
  }), /server controlled/);
});

test("checkout rejects duplicate products and invalid quantities", () => {
  assert.throws(() => parseCheckoutRequest({
    items: [{ productId: "product-1", quantity: 1 }, { productId: "product-1", quantity: 2 }],
    shippingAddress,
  }), /Duplicate product/);
  assert.throws(() => parseCheckoutRequest({ items: [{ productId: "product-1", quantity: 0 }], shippingAddress }), /quantity/);
});
