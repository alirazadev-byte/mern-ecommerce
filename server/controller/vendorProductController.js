const cloudinary = require("cloudinary").v2;
const asyncHandler = require("../middlewares/Catachasyncerror");
const ErrorHandler = require("../utils/Errorhandler");
const vendorProductService = require("../services/vendorProductService");
const {
  requireVendorId,
  createProductInput,
  updateProductInput,
} = require("../validation/vendorProductValidation");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createVendorProduct = asyncHandler(async (req, res, next) => {
  const vendorId = requireVendorId(req);
  const validatedInput = createProductInput(req.body, []);
  const files = Array.isArray(req.files) ? req.files : [];

  if (files.length === 0) {
    return next(new ErrorHandler("At least one product image is required", 400));
  }

  const uploads = await Promise.all(
    files.map((file) => cloudinary.uploader.upload(file.path, { folder: "products" }))
  );
  const images = uploads.map((upload) => upload.secure_url);
  const product = await vendorProductService.create(vendorId, {
    ...validatedInput,
    images,
  });

  res.status(201).json({ success: true, product });
});

exports.listVendorProducts = asyncHandler(async (req, res) => {
  const vendorId = requireVendorId(req);
  const products = await vendorProductService.listOwned(vendorId);

  res.status(200).json({ success: true, products });
});

exports.updateVendorProduct = asyncHandler(async (req, res, next) => {
  const vendorId = requireVendorId(req);
  const updates = updateProductInput(req.body);
  const product = await vendorProductService.updateOwned(
    vendorId,
    req.params.id,
    updates
  );

  if (!product) {
    return next(new ErrorHandler("Product not found or not owned by vendor", 404));
  }

  res.status(200).json({ success: true, product });
});

exports.deleteVendorProduct = asyncHandler(async (req, res, next) => {
  const vendorId = requireVendorId(req);
  const product = await vendorProductService.deleteOwned(vendorId, req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found or not owned by vendor", 404));
  }

  res.status(200).json({ success: true, message: "Product deleted successfully" });
});
