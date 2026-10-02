import mongoose, { Schema, type Model, type Types } from "mongoose";
import { INVENTORY_STATUSES, type InventoryStatus } from "../domain/catalog";

interface IInventory {
  product: Types.ObjectId;
  vendor: Types.ObjectId;
  sku: string;
  quantity: number;
  status: InventoryStatus;
}

type InventoryModel = Model<IInventory>;

const inventorySchema = new Schema<IInventory, InventoryModel>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: Object.values(INVENTORY_STATUSES),
      default: INVENTORY_STATUSES.AVAILABLE,
      required: true,
    },
  },
  { timestamps: true }
);

inventorySchema.index({ product: 1 }, { unique: true, name: "inventory_product_unique" });
inventorySchema.index({ sku: 1 }, { unique: true, name: "inventory_sku_unique" });
inventorySchema.index({ vendor: 1, updatedAt: -1 }, { name: "vendor_inventory_recent" });
inventorySchema.index({ vendor: 1, status: 1, quantity: 1 }, { name: "vendor_inventory_availability" });

const Inventory = (mongoose.models.Inventory as InventoryModel | undefined) ?? mongoose.model<IInventory, InventoryModel>("Inventory", inventorySchema);
export = Inventory;
