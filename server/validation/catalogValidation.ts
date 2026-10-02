import type { CatalogQuery } from "../domain/catalog";
import ErrorHandler = require("../utils/Errorhandler");

export const CLIENT_OWNERSHIP_FIELDS = new Set([
  "vendor", "vendorId", "seller", "sellerId", "shop", "shopId", "owner", "ownerId", "userId",
]);

export interface VendorProductCreateInput {
  name: string;
  subtitle: string;
  brand: string;
  descriptoion: string;
  category: string;
  price: number;
  stock: number;
  productIsNew: boolean;
  images: string[];
}

export type VendorProductUpdateInput = Partial<Omit<VendorProductCreateInput, "images" | "stock">>;

function stringField(value: unknown, field: string, required: boolean): string | undefined {
  if (value === undefined && !required) return undefined;
  if (typeof value !== "string" || value.trim() === "") throw new ErrorHandler(`${field} must be a non-empty string`, 400);
  return value.trim();
}

function nonNegativeNumber(value: unknown, field: string, required: boolean): number | undefined {
  if (value === undefined && !required) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new ErrorHandler(`${field} must be a non-negative number`, 400);
  return parsed;
}

function booleanField(value: unknown, field: string, required: boolean): boolean | undefined {
  if (value === undefined && !required) return undefined;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new ErrorHandler(`${field} must be a boolean`, 400);
}

function objectPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new ErrorHandler("Request body must be an object", 400);
  return payload as Record<string, unknown>;
}

export function assertNoClientOwnershipFields(payload: Record<string, unknown>) {
  const field = Object.keys(payload).find((key) => CLIENT_OWNERSHIP_FIELDS.has(key));
  if (field) throw new ErrorHandler(`Ownership field '${field}' is server controlled`, 400);
}


export interface VendorRequestContext { seller?: { _id?: unknown; role?: string; active?: boolean } }
export function requireVendorId(req: VendorRequestContext): unknown {
  const seller = req.seller;
  if (!seller?._id || seller.role !== "vendor" || seller.active !== true) throw new ErrorHandler("Active vendor authentication required", 403);
  return seller._id;
}

export function parseCreateProduct(payload: unknown, images: string[]): VendorProductCreateInput {
  const body = objectPayload(payload);
  assertNoClientOwnershipFields(body);
  return {
    name: stringField(body.name, "name", true)!,
    subtitle: stringField(body.subtitle, "subtitle", true)!,
    brand: stringField(body.brand, "brand", true)!,
    descriptoion: stringField(body.descriptoion, "descriptoion", true)!,
    category: stringField(body.category, "category", true)!.toLowerCase(),
    price: nonNegativeNumber(body.price, "price", true)!,
    stock: nonNegativeNumber(body.stock, "stock", true)!,
    productIsNew: booleanField(body.productIsNew, "productIsNew", true)!,
    images,
  };
}

export function parseUpdateProduct(payload: unknown): VendorProductUpdateInput {
  const body = objectPayload(payload);
  assertNoClientOwnershipFields(body);
  if ("stock" in body) throw new ErrorHandler("Stock must be updated through the inventory endpoint", 400);
  const allowed = new Set(["name", "subtitle", "brand", "descriptoion", "category", "price", "productIsNew"]);
  const unsupported = Object.keys(body).find((key) => !allowed.has(key) && !CLIENT_OWNERSHIP_FIELDS.has(key));
  if (unsupported) throw new ErrorHandler(`Unsupported product field '${unsupported}'`, 400);

  const result: VendorProductUpdateInput = {};
  const name = stringField(body.name, "name", false); if (name !== undefined) result.name = name;
  const subtitle = stringField(body.subtitle, "subtitle", false); if (subtitle !== undefined) result.subtitle = subtitle;
  const brand = stringField(body.brand, "brand", false); if (brand !== undefined) result.brand = brand;
  const description = stringField(body.descriptoion, "descriptoion", false); if (description !== undefined) result.descriptoion = description;
  const category = stringField(body.category, "category", false); if (category !== undefined) result.category = category.toLowerCase();
  const price = nonNegativeNumber(body.price, "price", false); if (price !== undefined) result.price = price;
  const isNew = booleanField(body.productIsNew, "productIsNew", false); if (isNew !== undefined) result.productIsNew = isNew;
  if (Object.keys(result).length === 0) throw new ErrorHandler("No supported product fields supplied", 400);
  return result;
}

export function parseInventoryQuantity(payload: unknown): number {
  const body = objectPayload(payload);
  const allowed = new Set(["quantity"]);
  const unsupported = Object.keys(body).find((key) => !allowed.has(key));
  if (unsupported) throw new ErrorHandler(`Unsupported inventory field '${unsupported}'`, 400);
  return nonNegativeNumber(body.quantity, "quantity", true)!;
}

export function parseCatalogQuery(query: Record<string, unknown>): CatalogQuery {
  const page = Math.max(1, Number.parseInt(String(query.page ?? "1"), 10) || 1);
  const perPage = Math.min(50, Math.max(1, Number.parseInt(String(query.perPage ?? "12"), 10) || 12));
  const allowedSorts = new Set<CatalogQuery["sort"]>(["newest", "price_asc", "price_desc", "rating"]);
  const requestedSort = String(query.sort ?? "newest") as CatalogQuery["sort"];
  const sort = allowedSorts.has(requestedSort) ? requestedSort : "newest";
  const category = typeof query.category === "string" && query.category.trim() ? query.category.trim().toLowerCase() : undefined;
  const vendorId = typeof query.vendorId === "string" && query.vendorId.trim() ? query.vendorId.trim() : undefined;
  const search = typeof query.search === "string" && query.search.trim() ? query.search.trim().slice(0, 100) : undefined;
  return { page, perPage, category, vendorId, search, sort };
}

export const updateProductInput = parseUpdateProduct;
