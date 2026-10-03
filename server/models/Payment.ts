import mongoose, { Schema, type Model, type Types } from "mongoose";
import { PAYMENT_STATUSES, type PaymentRecord } from "../domain/commerce";

type IPayment = PaymentRecord;

type PaymentModel = Model<IPayment>;
const schema = new Schema<IPayment, PaymentModel>({
  marketplaceOrder: { type: Schema.Types.ObjectId, ref: "MarketplaceOrder", required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
  provider: { type: String, enum: ["stripe"], default: "stripe", required: true },
  paymentIntentId: { type: String, unique: true, sparse: true },
  status: { type: String, enum: Object.values(PAYMENT_STATUSES), default: PAYMENT_STATUSES.PENDING, required: true },
  amountMinor: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ["INR"], default: "INR", required: true },
  refundedMinor: { type: Number, required: true, min: 0, default: 0 },
  lastFailureCode: String,
  lastFailureMessage: String,
}, { timestamps: true });

const Payment = (mongoose.models.Payment as PaymentModel | undefined)
  ?? mongoose.model<IPayment, PaymentModel>("Payment", schema);
export = Payment;
