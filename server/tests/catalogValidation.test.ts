import test from "node:test";
import assert from "node:assert/strict";
import { parseCatalogQuery, parseCreateProduct, parseInventoryQuantity, parseUpdateProduct } from "../validation/catalogValidation";

test("catalog query bounds pagination and normalizes category", () => {
  const query = parseCatalogQuery({ page: "0", perPage: "500", category: " Phones ", sort: "price_desc" });
  assert.deepEqual(query, { page: 1, perPage: 50, category: "phones", vendorId: undefined, search: undefined, sort: "price_desc" });
});

test("client ownership fields are rejected on create", () => {
  assert.throws(() => parseCreateProduct({ name: "A", subtitle: "B", brand: "C", descriptoion: "D", category: "E", price: 1, stock: 1, productIsNew: true, vendorId: "other" }, ["x"]), /server controlled/);
});

test("stock cannot be changed through product update", () => {
  assert.throws(() => parseUpdateProduct({ stock: 10 }), /inventory endpoint/);
});

test("inventory quantity must be non-negative", () => {
  assert.equal(parseInventoryQuantity({ quantity: "4" }), 4);
  assert.throws(() => parseInventoryQuantity({ quantity: -1 }), /non-negative/);
});
