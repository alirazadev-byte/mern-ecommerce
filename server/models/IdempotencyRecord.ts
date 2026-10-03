import mongoose, { Schema, type Model, type Types } from "mongoose";
import { IDEMPOTENCY_SCOPES, type IdempotencyScope } from "../domain/commerce";

interface IIdempotencyRecord {
  scope: IdempotencyScope;
  actor: Types.ObjectId;
  key: string;
  requestHash: string;
  resourceId?: Types.ObjectId;
  completed: boolean;
}

type IdempotencyModel = Model<IIdempotencyRecord>;
const schema = new Schema<IIdempotencyRecord, IdempotencyModel>({
  scope: { type: String, enum: Object.values(IDEMPOTENCY_SCOPES), required: true },
  actor: { type: Schema.Types.ObjectId, required: true },
  key: { type: String, required: true, trim: true },
  requestHash: { type: String, required: true },
  resourceId: { type: Schema.Types.ObjectId },
  completed: { type: Boolean, required: true, default: false },
}, { timestamps: true });
schema.index({ scope: 1, actor: 1, key: 1 }, { unique: true, name: "idempotency_actor_scope_key" });

const IdempotencyRecord = (mongoose.models.IdempotencyRecord as IdempotencyModel | undefined)
  ?? mongoose.model<IIdempotencyRecord, IdempotencyModel>("IdempotencyRecord", schema);
export = IdempotencyRecord;
