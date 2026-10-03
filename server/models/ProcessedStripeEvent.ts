import mongoose, { Schema, type Model } from "mongoose";
interface IProcessedStripeEvent { eventId: string; type: string; processedAt: Date; }
type ProcessedStripeEventModel = Model<IProcessedStripeEvent>;
const schema = new Schema<IProcessedStripeEvent, ProcessedStripeEventModel>({
  eventId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  processedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });
const ProcessedStripeEvent = (mongoose.models.ProcessedStripeEvent as ProcessedStripeEventModel | undefined)
  ?? mongoose.model<IProcessedStripeEvent, ProcessedStripeEventModel>("ProcessedStripeEvent", schema);
export = ProcessedStripeEvent;
