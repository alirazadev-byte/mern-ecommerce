const test = require("node:test");
const assert = require("node:assert/strict");
const { VendorProductService } = require("../services/vendorProductService");

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
      const result = [...records.values()].filter(
        (record) => String(record.vendor) === String(filter.vendor)
      );
      return {
        async sort() {
          return result.map((record) => ({ ...record }));
        },
      };
    },
    async findOneAndUpdate(filter, update) {
      const current = records.get(filter._id);
      if (!current || String(current.vendor) !== String(filter.vendor)) {
        return null;
      }
      const next = { ...current, ...update.$set };
      records.set(filter._id, next);
      return { ...next };
    },
    async findOneAndDelete(filter) {
      const current = records.get(filter._id);
      if (!current || String(current.vendor) !== String(filter.vendor)) {
        return null;
      }
      records.delete(filter._id);
      return { ...current };
    },
  };
}

test("vendor-created product ownership is derived from authenticated vendor", async () => {
  const model = createFakeProductModel();
  const service = new VendorProductService(model);

  const product = await service.create("vendor-a", { name: "Product A" });

  assert.equal(product.vendor, "vendor-a");
  assert.equal(model.records.get(product._id).vendor, "vendor-a");
});

test("vendor can update its own product", async () => {
  const model = createFakeProductModel([
    { _id: "product-a", vendor: "vendor-a", name: "Before" },
  ]);
  const service = new VendorProductService(model);

  const product = await service.updateOwned("vendor-a", "product-a", { name: "After" });

  assert.equal(product.name, "After");
  assert.equal(model.records.get("product-a").name, "After");
});

test("vendor cannot update another vendor product and data remains unchanged", async () => {
  const model = createFakeProductModel([
    { _id: "product-a", vendor: "vendor-a", name: "Original" },
  ]);
  const service = new VendorProductService(model);

  const product = await service.updateOwned("vendor-b", "product-a", { name: "Tampered" });

  assert.equal(product, null);
  assert.equal(model.records.get("product-a").name, "Original");
});

test("vendor cannot delete another vendor product and data remains present", async () => {
  const model = createFakeProductModel([
    { _id: "product-a", vendor: "vendor-a", name: "Original" },
  ]);
  const service = new VendorProductService(model);

  const product = await service.deleteOwned("vendor-b", "product-a");

  assert.equal(product, null);
  assert.equal(model.records.has("product-a"), true);
});

test("private vendor listing returns only the authenticated vendor products", async () => {
  const model = createFakeProductModel([
    { _id: "product-a", vendor: "vendor-a", name: "A" },
    { _id: "product-b", vendor: "vendor-b", name: "B" },
  ]);
  const service = new VendorProductService(model);

  const products = await service.listOwned("vendor-a");

  assert.deepEqual(products.map((product) => product._id), ["product-a"]);
});
