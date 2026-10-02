const ErrorHandler = require("../utils/Errorhandler");

const CLIENT_OWNERSHIP_FIELDS = new Set([
  "vendor",
  "vendorId",
  "seller",
  "sellerId",
  "shop",
  "shopId",
  "owner",
  "ownerId",
  "userId",
]);

const CREATE_FIELDS = [
  "name",
  "subtitle",
  "brand",
  "descriptoion",
  "category",
  "price",
  "stock",
  "productIsNew",
];

const UPDATE_FIELDS = new Set(CREATE_FIELDS);

function assertNoClientOwnershipFields(payload = {}) {
  const suppliedOwnershipField = Object.keys(payload).find((key) =>
    CLIENT_OWNERSHIP_FIELDS.has(key)
  );

  if (suppliedOwnershipField) {
    throw new ErrorHandler(
      `Ownership field '${suppliedOwnershipField}' is server controlled`,
      400
    );
  }
}

/**
 * @param {import("../types/vendorOwnership").VendorRequestContext} req
 * @returns {import("../types/vendorOwnership").ResourceId}
 */
function requireVendorId(req) {
  const seller = req.seller;

  if (!seller || seller.role !== "vendor" || seller.active !== true || !seller._id) {
    throw new ErrorHandler("Active vendor authentication required", 403);
  }

  return seller._id;
}

function parseBoolean(value, fieldName) {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new ErrorHandler(`${fieldName} must be a boolean`, 400);
}

function parseNonNegativeNumber(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ErrorHandler(`${fieldName} must be a non-negative number`, 400);
  }
  return parsed;
}

function normalizeProductFields(payload, { partial = false } = {}) {
  assertNoClientOwnershipFields(payload);

  const normalized = {};
  const requiredStrings = ["name", "subtitle", "brand", "descriptoion", "category"];

  for (const field of requiredStrings) {
    if (payload[field] !== undefined) {
      if (typeof payload[field] !== "string" || payload[field].trim() === "") {
        throw new ErrorHandler(`${field} must be a non-empty string`, 400);
      }
      normalized[field] = payload[field].trim();
    } else if (!partial) {
      throw new ErrorHandler(`${field} is required`, 400);
    }
  }

  if (payload.price !== undefined) {
    normalized.price = parseNonNegativeNumber(payload.price, "price");
  } else if (!partial) {
    throw new ErrorHandler("price is required", 400);
  }

  if (payload.stock !== undefined) {
    normalized.stock = parseNonNegativeNumber(payload.stock, "stock");
  } else if (!partial) {
    throw new ErrorHandler("stock is required", 400);
  }

  if (payload.productIsNew !== undefined) {
    normalized.productIsNew = parseBoolean(payload.productIsNew, "productIsNew");
  } else if (!partial) {
    throw new ErrorHandler("productIsNew is required", 400);
  }

  if (partial && Object.keys(normalized).length === 0) {
    throw new ErrorHandler("No supported product fields supplied", 400);
  }

  return normalized;
}

/** @returns {import("../types/vendorOwnership").VendorProductCreateInput} */
function createProductInput(payload, images) {
  return {
    ...normalizeProductFields(payload),
    images,
  };
}

/** @returns {import("../types/vendorOwnership").VendorProductUpdateInput} */
function updateProductInput(payload) {
  const unsupportedField = Object.keys(payload).find(
    (field) => !UPDATE_FIELDS.has(field) && !CLIENT_OWNERSHIP_FIELDS.has(field)
  );

  if (unsupportedField) {
    throw new ErrorHandler(`Unsupported product field '${unsupportedField}'`, 400);
  }

  return normalizeProductFields(payload, { partial: true });
}

module.exports = {
  CLIENT_OWNERSHIP_FIELDS,
  assertNoClientOwnershipFields,
  requireVendorId,
  createProductInput,
  updateProductInput,
};
