import { Types } from "mongoose";
import Product = require("../models/ProductModel");
import Inventory = require("../models/Inventory");
import type { VendorProductCreateInput, VendorProductUpdateInput } from "../validation/catalogValidation";
import { createInventory } from "./inventoryService";
import { withTransaction } from "./transactionService";

type ProductModelLike = typeof Product;
type InventoryModelLike = typeof Inventory;
type InventoryCreator = typeof createInventory;

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export class VendorProductService {
  constructor(
    private readonly productModel: ProductModelLike = Product,
    private readonly inventoryModel: InventoryModelLike = Inventory,
    private readonly inventoryCreator: InventoryCreator = createInventory
  ) {}

  async create(vendorId: Types.ObjectId, input: VendorProductCreateInput) {
    const { stock, ...productInput } = input;
    const payload = {
      ...productInput,
      vendor: vendorId,
      slug: `${slugify(input.name)}-${new Types.ObjectId().toString().slice(-6)}`,
      category: input.category.toLowerCase(),
    };
    if (this.productModel === Product && this.inventoryModel === Inventory && this.inventoryCreator === createInventory) {
      return withTransaction(async (session) => {
        const [product] = await this.productModel.create([payload], { session });
        if (!product) throw new Error("Product was not created");
        const inventory = await this.inventoryCreator(product._id, vendorId, input.name, stock, session);
        return { product, inventory };
      });
    }
    const product = await this.productModel.create(payload);
    try {
      const inventory = await this.inventoryCreator(product._id, vendorId, input.name, stock);
      return { product, inventory };
    } catch (error) {
      await this.productModel.deleteOne({ _id: product._id, vendor: vendorId });
      throw error;
    }
  }

  async listOwned(vendorId: Types.ObjectId, page = 1, perPage = 25) {
    const safePage = Math.max(1, page);
    const safePerPage = Math.min(100, Math.max(1, perPage));
    const filter = { vendor: vendorId };
    const [products, totalItems] = await Promise.all([
      this.productModel.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safePerPage).limit(safePerPage).lean(),
      this.productModel.countDocuments(filter),
    ]);
    const ids = products.map((product) => product._id);
    const inventory = await this.inventoryModel.find({ product: { $in: ids }, vendor: vendorId }).lean();
    const byProduct = new Map(inventory.map((item) => [item.product.toString(), item]));
    return {
      products: products.map((product) => ({ ...product, stock: byProduct.get(product._id.toString())?.quantity ?? product.stock ?? 0 })),
      pagination: { currentPage: safePage, perPage: safePerPage, totalItems, totalPages: Math.ceil(totalItems / safePerPage) },
    };
  }

  async updateOwned(vendorId: Types.ObjectId, productId: string, updates: VendorProductUpdateInput) {
    if (updates.category) updates.category = updates.category.toLowerCase();
    return this.productModel.findOneAndUpdate({ _id: productId, vendor: vendorId }, { $set: updates }, { new: true, runValidators: true });
  }

  async deleteOwned(vendorId: Types.ObjectId, productId: string) {
    if (this.productModel === Product && this.inventoryModel === Inventory) {
      return withTransaction(async (session) => {
        const product = await this.productModel.findOneAndDelete({ _id: productId, vendor: vendorId }, { session });
        if (product) await this.inventoryModel.deleteOne({ product: product._id, vendor: vendorId }, { session });
        return product;
      });
    }
    const product = await this.productModel.findOneAndDelete({ _id: productId, vendor: vendorId });
    if (product) await this.inventoryModel.deleteOne({ product: product._id, vendor: vendorId });
    return product;
  }
}

export const vendorProductService = new VendorProductService();
