import mongoose, { type FilterQuery } from "mongoose";
import Product = require("../models/ProductModel");
import Inventory = require("../models/Inventory");
import { PRODUCT_STATUSES, type CatalogQuery } from "../domain/catalog";

function sortFor(sort: CatalogQuery["sort"]): Record<string, 1 | -1> {
  if (sort === "price_asc") return { price: 1, _id: 1 };
  if (sort === "price_desc") return { price: -1, _id: 1 };
  if (sort === "rating") return { ratings: -1, createdAt: -1 };
  return { createdAt: -1, _id: -1 };
}

interface ProductFilterShape { status?: unknown; category?: string; vendor?: string; $text?: { $search: string }; $or?: unknown[]; }

function publicFilter(query: CatalogQuery): FilterQuery<ProductFilterShape> {
  const filter: FilterQuery<ProductFilterShape> = {
    $or: [{ status: PRODUCT_STATUSES.ACTIVE }, { status: { $exists: false } }],
  };
  if (query.category) filter.category = query.category;
  if (query.vendorId && mongoose.Types.ObjectId.isValid(query.vendorId)) filter.vendor = query.vendorId;
  if (query.search) filter.$text = { $search: query.search };
  return filter;
}

export async function listPublicCatalog(query: CatalogQuery) {
  const filter = publicFilter(query);
  const projection = "vendor slug name subtitle brand descriptoion category categoryRef price images ratings reviewCount reviews stock productIsNew status createdAt";
  const [products, totalItems] = await Promise.all([
    Product.find(filter)
      .select(projection)
      .sort(sortFor(query.sort))
      .skip((query.page - 1) * query.perPage)
      .limit(query.perPage)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const productIds = products.map((product) => product._id);
  const inventory = await Inventory.find({ product: { $in: productIds } }).select("product quantity status sku").lean();
  const inventoryByProduct = new Map(inventory.map((item) => [item.product.toString(), item]));
  const hydratedProducts = products.map((product) => {
    const currentInventory = inventoryByProduct.get(product._id.toString());
    return {
      ...product,
      stock: currentInventory?.quantity ?? product.stock ?? 0,
      inventory: currentInventory ? { sku: currentInventory.sku, status: currentInventory.status } : undefined,
    };
  });

  return {
    products: hydratedProducts,
    pagination: {
      currentPage: query.page,
      perPage: query.perPage,
      totalItems,
      totalPages: Math.ceil(totalItems / query.perPage),
    },
  };
}

export async function getPublicProduct(identifier: string) {
  const base = { $or: [{ status: PRODUCT_STATUSES.ACTIVE }, { status: { $exists: false } }] };
  const identity = mongoose.Types.ObjectId.isValid(identifier) ? { _id: identifier } : { slug: identifier.toLowerCase() };
  const product = await Product.findOne({ $and: [base, identity] }).lean();
  if (!product) return null;
  const inventory = await Inventory.findOne({ product: product._id }).select("quantity status sku").lean();
  return { ...product, stock: inventory?.quantity ?? product.stock ?? 0, inventory: inventory ?? undefined };
}
