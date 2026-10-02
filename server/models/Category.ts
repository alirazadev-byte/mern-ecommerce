import mongoose, { Schema, type Model, type Types } from "mongoose";

interface ICategory {
  name: string;
  slug: string;
  active: boolean;
  createdBy?: Types.ObjectId;
}

type CategoryModel = Model<ICategory>;

const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    active: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 }, { unique: true, name: "category_slug_unique" });
categorySchema.index({ active: 1, name: 1 }, { name: "active_category_name" });

const Category = (mongoose.models.Category as CategoryModel | undefined) ?? mongoose.model<ICategory, CategoryModel>("Category", categorySchema);
export = Category;
