import type { CurrencyCode } from "../domain/commerce";

export const DEFAULT_CURRENCY: CurrencyCode = "INR";

export function legacyPriceToMinor(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Invalid persisted product price");
  }
  return Math.round(value * 100);
}

export function allocateShippingMinor(subtotalMinor: number): number {
  if (!Number.isInteger(subtotalMinor) || subtotalMinor < 0) {
    throw new Error("Invalid subtotal");
  }
  return Math.round(subtotalMinor * 0.1);
}
