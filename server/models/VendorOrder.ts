import mongoose, { Schema, type Model, type Types } from "mongoose";
import { FULFILLMENT_STATUSES, type FulfillmentStatus, type OrderItemSnapshot } from "../domain/commerce";
import type { ShippingAddressInput as IOrderAddressSnapshot } from "../domain/commerce";

interface IVendorOrder {
  marketplaceOrder: Types.ObjectId;
  customer: Types.ObjectId;
  vendor: Types.ObjectId;
  status: FulfillmentStatus;
  currency: "INR";
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  items: OrderItemSnapshot[];
  shippingAddress: IOrderAddressSnapshot;
}

type VendorOrderModel = Model<IVendorOrder>;

const itemSchema = new Schema<OrderItemSnapshot>({
  productId: { type: String, required: true },
  vendorId: { type: String, required: true },
  sku: { type: String, required: true },
  productName: { type: String, required: true },
  image: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPriceMinor: { type: Number, required: true, min: 0 },
  lineTotalMinor: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ["INR"], default: "INR", required: true },
}, { _id: false });

const addressSchema = new Schema({
  recipientName: { type: String, required: true }, email: { type: String, required: true }, phone: String,
  country: { type: String, required: true }, city: { type: String, required: true }, address1: { type: String, required: true },
  address2: String, postalCode: { type: String, required: true },
}, { _id: false });

const schema = new Schema<IVendorOrder, VendorOrderModel>({
  marketplaceOrder: { type: Schema.Types.ObjectId, ref: "MarketplaceOrder", required: true, index: true },
  customer: { type: Schema.Types.ObjectId, ref: "user", required: true },
  vendor: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
  status: { type: String, enum: Object.values(FULFILLMENT_STATUSES), default: FULFILLMENT_STATUSES.PENDING, required: true },
  currency: { type: String, enum: ["INR"], default: "INR", required: true },
  subtotalMinor: { type: Number, required: true, min: 0 },
  shippingMinor: { type: Number, required: true, min: 0 },
  totalMinor: { type: Number, required: true, min: 0 },
  items: { type: [itemSchema], required: true },
  shippingAddress: { type: addressSchema, required: true },
}, { timestamps: true });

schema.index({ vendor: 1, createdAt: -1 }, { name: "vendor_orders_recent" });
schema.index({ vendor: 1, status: 1, createdAt: -1 }, { name: "vendor_orders_by_status" });
schema.index({ marketplaceOrder: 1, vendor: 1 }, { unique: true, name: "marketplace_vendor_unique" });

const VendorOrder = (mongoose.models.VendorOrder as VendorOrderModel | undefined)
  ?? mongoose.model<IVendorOrder, VendorOrderModel>("VendorOrder", schema);
export = VendorOrder;
