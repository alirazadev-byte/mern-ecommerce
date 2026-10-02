import crypto from "crypto";
import type { Types } from "mongoose";
import Inventory = require("../models/Inventory");
import Product = require("../models/ProductModel");
import { INVENTORY_STATUSES } from "../domain/catalog";

function makeSku(productName: string): string {
  const prefix = productName.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase() || "ITEM";
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function createInventory(productId: Types.ObjectId, vendorId: Types.ObjectId, productName: string, quantity: number) {
  return Inventory.create({
    product: productId,
    vendor: vendorId,
    sku: makeSku(productName),
    quantity,
    status: quantity > 0 ? INVENTORY_STATUSES.AVAILABLE : INVENTORY_STATUSES.UNAVAILABLE,
  });
}

export async function setOwnedQuantity(vendorId: string, productId: string, quantity: number) {
  const ownedProduct = await Product.exists({ _id: productId, vendor: vendorId });
  if (!ownedProduct) return null;
  return Inventory.findOneAndUpdate(
    { product: productId, vendor: vendorId },
    {
      $set: {
        quantity,
        status: quantity > 0 ? INVENTORY_STATUSES.AVAILABLE : INVENTORY_STATUSES.UNAVAILABLE,
      },
    },
    { new: true, runValidators: true }
  );
}

export async function listVendorInventory(vendorId: string, page = 1, perPage = 25) {
  const safePage = Math.max(1, page);
  const safePerPage = Math.min(100, Math.max(1, perPage));
  const filter = { vendor: vendorId };
  const [items, totalItems] = await Promise.all([
    Inventory.find(filter)
      .select("product vendor sku quantity status updatedAt")
      .sort({ updatedAt: -1 })
      .skip((safePage - 1) * safePerPage)
      .limit(safePerPage)
      .lean(),
    Inventory.countDocuments(filter),
  ]);
  return { items, pagination: { currentPage: safePage, perPage: safePerPage, totalItems, totalPages: Math.ceil(totalItems / safePerPage) } };
}

export async function listAllInventory(page = 1, perPage = 50) {
  const safePage = Math.max(1, page);
  const safePerPage = Math.min(100, Math.max(1, perPage));
  const [items, totalItems] = await Promise.all([
    Inventory.find({}).select("product vendor sku quantity status updatedAt").sort({ updatedAt: -1 }).skip((safePage - 1) * safePerPage).limit(safePerPage).lean(),
    Inventory.countDocuments({}),
  ]);
  return { items, pagination: { currentPage: safePage, perPage: safePerPage, totalItems, totalPages: Math.ceil(totalItems / safePerPage) } };
}
