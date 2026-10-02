import type { NextFunction, Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import asyncHandler = require("../middlewares/Catachasyncerror");
import ErrorHandler = require("../utils/Errorhandler");
import { vendorProductService } from "../services/vendorProductService";
import { parseCreateProduct, parseUpdateProduct, parseInventoryQuantity } from "../validation/catalogValidation";
import { listVendorInventory, setOwnedQuantity } from "../services/inventoryService";
import { requireRouteParam } from "../validation/requestParams";

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

function vendorId(req: Request) {
  if (!req.seller?._id || req.seller.role !== "vendor" || !req.seller.active) throw new ErrorHandler("Active vendor authentication required", 403);
  return req.seller._id;
}

export const createVendorProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const files = Array.isArray(req.files) ? req.files : [];
  if (files.length === 0) return next(new ErrorHandler("At least one product image is required", 400));
  const uploads = await Promise.all(files.map((file) => cloudinary.uploader.upload(file.path, { folder: "products" })));
  const input = parseCreateProduct(req.body, uploads.map((upload) => upload.secure_url));
  const result = await vendorProductService.create(vendorId(req), input);
  res.status(201).json({ success: true, ...result });
});

export const listVendorProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1); const perPage = Number(req.query.perPage ?? 25);
  const result = await vendorProductService.listOwned(vendorId(req), page, perPage);
  res.status(200).json({ success: true, ...result });
});

export const updateVendorProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const product = await vendorProductService.updateOwned(vendorId(req), requireRouteParam(req, "id"), parseUpdateProduct(req.body));
  if (!product) return next(new ErrorHandler("Product not found or not owned by vendor", 404));
  res.status(200).json({ success: true, product });
});

export const deleteVendorProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const product = await vendorProductService.deleteOwned(vendorId(req), requireRouteParam(req, "id"));
  if (!product) return next(new ErrorHandler("Product not found or not owned by vendor", 404));
  res.status(200).json({ success: true, message: "Product deleted successfully" });
});

export const updateVendorInventory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const inventory = await setOwnedQuantity(vendorId(req).toString(), requireRouteParam(req, "productId"), parseInventoryQuantity(req.body));
  if (!inventory) return next(new ErrorHandler("Product inventory not found or not owned by vendor", 404));
  res.status(200).json({ success: true, inventory });
});

export const getVendorInventory = asyncHandler(async (req: Request, res: Response) => {
  const result = await listVendorInventory(vendorId(req).toString(), Number(req.query.page ?? 1), Number(req.query.perPage ?? 25));
  res.status(200).json({ success: true, ...result });
});
