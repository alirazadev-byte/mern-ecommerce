import type { NextFunction, Request, Response } from "express";
import Product = require("../models/ProductModel");
import ErrorHandler = require("../utils/Errorhandler");
import { getPublicProduct, listPublicCatalog } from "../services/catalogService";
import { parseCatalogQuery } from "../validation/catalogValidation";
import { listAllInventory } from "../services/inventoryService";
import { requireRouteParam } from "../validation/requestParams";

export async function fetchProducts(req: Request, res: Response) {
  const query = parseCatalogQuery({ ...req.query, page: req.params.page ?? req.query.page, perPage: req.params.perPage ?? req.query.perPage });
  res.json(await listPublicCatalog(query));
}

export async function fetchSingleProduct(req: Request, res: Response, next: NextFunction) {
  const product = await getPublicProduct(requireRouteParam(req, "id"));
  if (!product) return next(new ErrorHandler("Product not found", 404));
  res.json(product);
}

export async function productReview(req: Request, res: Response) {
  const { user, rating, comment, productId } = req.body;
  if (!rating || !comment) return res.status(400).json({ message: "All fields are required" });
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  const existingReviewIndex = product.reviews.findIndex((review) => review.user?._id?.toString() === user?._id?.toString());
  if (existingReviewIndex !== -1) {
    const review = product.reviews[existingReviewIndex];
    if (review) { review.rating = rating; review.comment = comment; }
  } else {
    product.reviews.push({ user: { _id: String(user?._id ?? ""), name: user?.name, avatar: user?.avatar }, rating, comment, createdAt: new Date() });
  }
  product.reviewCount = product.reviews.length;
  product.ratings = product.reviewCount ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviewCount : 0;
  await product.save({ validateBeforeSave: false });
  return res.status(201).json({ message: "Review added successfully" });
}

export async function adminInventory(req: Request, res: Response) {
  const result = await listAllInventory(Number(req.query.page ?? 1), Number(req.query.perPage ?? 50));
  res.status(200).json({ success: true, ...result });
}

export async function deleteProductAsAdmin(req: Request, res: Response, next: NextFunction) {
  const product = await Product.findByIdAndDelete(requireRouteParam(req, "id"));
  if (!product) return next(new ErrorHandler("Product not found", 404));
  const Inventory = require("../models/Inventory");
  await Inventory.deleteOne({ product: product._id });
  res.status(200).json({ success: true, message: "Product deleted successfully" });
}
