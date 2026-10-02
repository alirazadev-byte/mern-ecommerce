import mongoose, { Schema, type Model, type Types } from "mongoose";
import { PRODUCT_STATUSES, type ProductStatus } from "../domain/catalog";

interface IProductReviewSnapshot {
  user: {
    _id: string;
    name?: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
}

interface IProduct {
  vendor?: Types.ObjectId;
  slug?: string;
  name: string;
  subtitle: string;
  brand: string;
  descriptoion: string;
  category: string;
  categoryRef?: Types.ObjectId;
  price: number;
  images: string[];
  ratings: number;
  reviewCount: number;
  reviews: IProductReviewSnapshot[];
  stock?: number;
  productIsNew: boolean;
  stripeId?: string;
  status: ProductStatus;
}

type ProductModel = Model<IProduct>;

const reviewSnapshotSchema = new Schema<IProductReviewSnapshot>(
  {
    user: {
      _id: { type: String, required: true },
      name: { type: String },
      avatar: { type: String },
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct, ProductModel>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "Shop", index: true, immutable: true },
    slug: { type: String, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    descriptoion: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, lowercase: true },
    categoryRef: { type: Schema.Types.ObjectId, ref: "Category" },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], required: true, default: [] },
    ratings: { type: Number, required: true, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, required: true, default: 0, min: 0 },
    reviews: { type: [reviewSnapshotSchema], default: [] },
    // Compatibility-only until legacy stock has been moved to Inventory.
    stock: { type: Number, min: 0 },
    productIsNew: { type: Boolean, required: true },
    stripeId: { type: String },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUSES),
      default: PRODUCT_STATUSES.ACTIVE,
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 }, { unique: true, sparse: true, name: "product_slug_unique" });
productSchema.index({ vendor: 1, createdAt: -1 }, { name: "vendor_products_recent" });
productSchema.index({ status: 1, category: 1, createdAt: -1 }, { name: "public_category_recent" });
productSchema.index({ status: 1, ratings: -1, createdAt: -1 }, { name: "public_rating_recent" });
productSchema.index({ name: "text", subtitle: "text", brand: "text" }, { name: "catalog_text_search", weights: { name: 5, brand: 3, subtitle: 1 } });

const Product = (mongoose.models.Product as ProductModel | undefined) ?? mongoose.model<IProduct, ProductModel>("Product", productSchema);
export = Product;
