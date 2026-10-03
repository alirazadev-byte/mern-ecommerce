import mongoose, { Schema, type Model, type Types } from "mongoose";
import { MARKETPLACE_ORDER_STATUSES, type MarketplaceOrderRecord, type ShippingAddressInput } from "../domain/commerce";

type IOrderAddressSnapshot = ShippingAddressInput;
type IMarketplaceOrder = MarketplaceOrderRecord;

type MarketplaceOrderModel = Model<IMarketplaceOrder>;

const addressSchema = new Schema<IOrderAddressSnapshot>({
  recipientName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  country: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  address1: { type: String, required: true, trim: true },
  address2: { type: String, trim: true },
  postalCode: { type: String, required: true, trim: true },
}, { _id: false });

const schema = new Schema<IMarketplaceOrder, MarketplaceOrderModel>({
  customer: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
  status: { type: String, enum: Object.values(MARKETPLACE_ORDER_STATUSES), default: MARKETPLACE_ORDER_STATUSES.PAYMENT_PENDING, required: true },
  currency: { type: String, enum: ["INR"], default: "INR", required: true },
  subtotalMinor: { type: Number, required: true, min: 0 },
  shippingMinor: { type: Number, required: true, min: 0 },
  discountMinor: { type: Number, required: true, min: 0, default: 0 },
  taxMinor: { type: Number, required: true, min: 0, default: 0 },
  totalMinor: { type: Number, required: true, min: 0 },
  shippingAddress: { type: addressSchema, required: true },
  reservationExpiresAt: { type: Date, required: true, index: true },
  inventoryReleased: { type: Boolean, required: true, default: false },
  checkoutIdempotencyKey: { type: String, required: true },
  paidAt: Date,
  cancelledAt: Date,
  refundedAt: Date,
}, { timestamps: true });

schema.index({ customer: 1, createdAt: -1 }, { name: "customer_orders_recent" });
schema.index({ customer: 1, checkoutIdempotencyKey: 1 }, { unique: true, name: "customer_checkout_idempotency" });
schema.index({ status: 1, reservationExpiresAt: 1, inventoryReleased: 1 }, { name: "expired_inventory_reservations" });

const MarketplaceOrder = (mongoose.models.MarketplaceOrder as MarketplaceOrderModel | undefined)
  ?? mongoose.model<IMarketplaceOrder, MarketplaceOrderModel>("MarketplaceOrder", schema);
export = MarketplaceOrder;
