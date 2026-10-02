const test = require("node:test");
const assert = require("node:assert/strict");
const { VendorProductService } = require("../services/vendorProductService");

function queryChain(result) {
  return {
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    async lean() { return result.map((record) => ({ ...record })); },
  };
}

function createFakeProductModel(seed = []) {
  const records = new Map(seed.map((record) => [record._id, { ...record }]));
  return {
    records,
    async create(input) {
      const id = `p-${records.size + 1}`;
      const record = { _id: id, ...input };
      records.set(id, record);
      return { ...record };
    },
    find(filter) {
      return queryChain([...records.values()].filter((record) => String(record.vendor) === String(filter.vendor)));
    },
    async countDocuments(filter) {
      return [...records.values()].filter((record) => String(record.vendor) === String(filter.vendor)).length;
    },
    async findOneAndUpdate(filter, update) {
      const current = records.get(filter._id);
      if (!current || String(current.vendor) !== String(filter.vendor)) return null;
      const next = { ...current, ...update.$set };
      records.set(filter._id, next);
      return { ...next };
    },
    async findOneAndDelete(filter) {
      const current = records.get(filter._id);
      if (!current || String(current.vendor) !== String(filter.vendor)) return null;
      records.delete(filter._id);
      return { ...current };
    },
    async deleteOne(filter) { records.delete(String(filter._id)); },
  };
}

function createFakeInventoryModel() {
  const records = new Map();
  return {
    records,
    find() { return { async lean() { return [...records.values()]; } }; },
    async deleteOne(filter) { records.delete(String(filter.product)); },
  };
}

function productInput() {
  return { name: "Product A", subtitle: "Sub", brand: "Brand", descriptoion: "Description", category: "Phones", price: 100, stock: 3, productIsNew: true, images: ["image"] };
}

test("vendor-created product ownership comes from authenticated vendor and stock goes to inventory", async () => {
  const products = createFakeProductModel();
  const inventory = createFakeInventoryModel();
  const createInventory = async (productId, vendorId, name, quantity) => {
    const row = { _id: "i-1", product: productId, vendor: vendorId, sku: `${name}-SKU`, quantity };
    inventory.records.set(String(productId), row);
    return row;
  };
  const service = new VendorProductService(products, inventory, createInventory);
  const result = await service.create("vendor-a", productInput());
  assert.equal(result.product.vendor, "vendor-a");
  assert.equal(products.records.get(result.product._id).stock, undefined);
  assert.equal(inventory.records.get(result.product._id).quantity, 3);
});

test("vendor can update its own product", async () => {
  const products = createFakeProductModel([{ _id: "product-a", vendor: "vendor-a", name: "Before" }]);
  const service = new VendorProductService(products, createFakeInventoryModel(), async () => ({}));
  const product = await service.updateOwned("vendor-a", "product-a", { name: "After" });
  assert.equal(product.name, "After");
});

test("vendor cannot update another vendor product and data remains unchanged", async () => {
  const products = createFakeProductModel([{ _id: "product-a", vendor: "vendor-a", name: "Original" }]);
  const service = new VendorProductService(products, createFakeInventoryModel(), async () => ({}));
  assert.equal(await service.updateOwned("vendor-b", "product-a", { name: "Tampered" }), null);
  assert.equal(products.records.get("product-a").name, "Original");
});

test("vendor cannot delete another vendor product and data remains present", async () => {
  const products = createFakeProductModel([{ _id: "product-a", vendor: "vendor-a", name: "Original" }]);
  const service = new VendorProductService(products, createFakeInventoryModel(), async () => ({}));
  assert.equal(await service.deleteOwned("vendor-b", "product-a"), null);
  assert.equal(products.records.has("product-a"), true);
});

test("private vendor listing is paginated and returns only authenticated vendor products", async () => {
  const products = createFakeProductModel([{ _id: "product-a", vendor: "vendor-a", name: "A" }, { _id: "product-b", vendor: "vendor-b", name: "B" }]);
  const result = await new VendorProductService(products, createFakeInventoryModel(), async () => ({})).listOwned("vendor-a");
  assert.deepEqual(result.products.map((product) => product._id), ["product-a"]);
  assert.equal(result.pagination.totalItems, 1);
});
