/**
 * Ownership-sensitive product persistence. Vendor identity is always supplied
 * by authenticated server context, never by request payload.
 *
 * @typedef {import("../types/vendorOwnership").ResourceId} ResourceId
 * @typedef {import("../types/vendorOwnership").VendorProductCreateInput} VendorProductCreateInput
 * @typedef {import("../types/vendorOwnership").VendorProductUpdateInput} VendorProductUpdateInput
 */
class VendorProductService {
  /** @param {import("../types/vendorOwnership").VendorProductRepository} [productModel] */
  constructor(productModel) {
    this.productModel = productModel || require("../models/ProductModel");
  }

  /** @param {ResourceId} vendorId @param {VendorProductCreateInput} productInput */
  async create(vendorId, productInput) {
    return this.productModel.create({
      ...productInput,
      vendor: vendorId,
    });
  }

  /** @param {ResourceId} vendorId */
  async listOwned(vendorId) {
    return this.productModel.find({ vendor: vendorId }).sort({ createdAt: -1 });
  }

  /** @param {ResourceId} vendorId @param {ResourceId} productId @param {VendorProductUpdateInput} updates */
  async updateOwned(vendorId, productId, updates) {
    return this.productModel.findOneAndUpdate(
      { _id: productId, vendor: vendorId },
      { $set: updates },
      { new: true, runValidators: true }
    );
  }

  /** @param {ResourceId} vendorId @param {ResourceId} productId */
  async deleteOwned(vendorId, productId) {
    return this.productModel.findOneAndDelete({
      _id: productId,
      vendor: vendorId,
    });
  }
}

let defaultService;
function getDefaultService() {
  if (!defaultService) {
    defaultService = new VendorProductService();
  }
  return defaultService;
}

module.exports = {
  VendorProductService,
  create: (...args) => getDefaultService().create(...args),
  listOwned: (...args) => getDefaultService().listOwned(...args),
  updateOwned: (...args) => getDefaultService().updateOwned(...args),
  deleteOwned: (...args) => getDefaultService().deleteOwned(...args),
};
