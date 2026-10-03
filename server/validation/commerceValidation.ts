import type { Request } from "express";
import ErrorHandler = require("../utils/Errorhandler");
import type { CheckoutRequest, ShippingAddressInput } from "../domain/commerce";

const FORBIDDEN_CHECKOUT_FIELDS = new Set([
  "price", "unitPrice", "unitPriceMinor", "subtotal", "subtotalMinor", "discount", "discountMinor",
  "shipping", "shippingMinor", "total", "totalPrice", "totalMinor", "vendor", "vendorId", "sellerId",
  "paymentStatus", "orderStatus", "status", "userId", "customerId",
]);

function object(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ErrorHandler(`${name} must be an object`, 400);
  return value as Record<string, unknown>;
}

function text(value: unknown, name: string, required = true): string | undefined {
  if (value === undefined || value === null || value === "") {
    if (required) throw new ErrorHandler(`${name} is required`, 400);
    return undefined;
  }
  if (typeof value !== "string") throw new ErrorHandler(`${name} must be a string`, 400);
  const normalized = value.trim();
  if (!normalized && required) throw new ErrorHandler(`${name} is required`, 400);
  return normalized || undefined;
}

function shippingAddress(value: unknown): ShippingAddressInput {
  const body = object(value, "shippingAddress");
  return {
    recipientName: text(body.recipientName, "shippingAddress.recipientName")!,
    email: text(body.email, "shippingAddress.email")!,
    phone: text(body.phone, "shippingAddress.phone", false),
    country: text(body.country, "shippingAddress.country")!,
    city: text(body.city, "shippingAddress.city")!,
    address1: text(body.address1, "shippingAddress.address1")!,
    address2: text(body.address2, "shippingAddress.address2", false),
    postalCode: text(body.postalCode, "shippingAddress.postalCode")!,
  };
}

export function parseCheckoutRequest(value: unknown): CheckoutRequest {
  const body = object(value, "checkout");
  for (const field of FORBIDDEN_CHECKOUT_FIELDS) {
    if (field in body) throw new ErrorHandler(`${field} is server controlled`, 400);
  }
  if (!Array.isArray(body.items) || body.items.length === 0) throw new ErrorHandler("items must contain at least one product", 400);
  if (body.items.length > 50) throw new ErrorHandler("checkout supports at most 50 line items", 400);
  const seen = new Set<string>();
  const items = body.items.map((raw, index) => {
    const item = object(raw, `items[${index}]`);
    for (const field of FORBIDDEN_CHECKOUT_FIELDS) {
      if (field in item) throw new ErrorHandler(`items[${index}].${field} is server controlled`, 400);
    }
    const productId = text(item.productId, `items[${index}].productId`)!;
    if (seen.has(productId)) throw new ErrorHandler(`Duplicate product in checkout: ${productId}`, 400);
    seen.add(productId);
    const quantity = item.quantity;
    if (!Number.isInteger(quantity) || Number(quantity) < 1 || Number(quantity) > 99) {
      throw new ErrorHandler(`items[${index}].quantity must be an integer between 1 and 99`, 400);
    }
    return { productId, quantity: Number(quantity) };
  });
  return { items, shippingAddress: shippingAddress(body.shippingAddress) };
}

export function requireIdempotencyKey(req: Request): string {
  const value = req.header("Idempotency-Key")?.trim();
  if (!value || value.length < 8 || value.length > 128) {
    throw new ErrorHandler("Idempotency-Key header must be between 8 and 128 characters", 400);
  }
  return value;
}
