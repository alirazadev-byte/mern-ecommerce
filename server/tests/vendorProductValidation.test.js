const test = require("node:test");
const assert = require("node:assert/strict");
const {
  assertNoClientOwnershipFields,
  requireVendorId,
  updateProductInput,
} = require("../validation/vendorProductValidation");

for (const field of ["vendor", "vendorId", "sellerId", "shopId", "ownerId", "userId"]) {
  test(`client cannot supply server-owned identity field: ${field}`, () => {
    assert.throws(
      () => assertNoClientOwnershipFields({ [field]: "vendor-b" }),
      /server controlled/
    );
  });
}

test("authenticated active vendor context supplies vendor identity", () => {
  const vendorId = requireVendorId({
    seller: { _id: "vendor-a", role: "vendor", active: true },
  });

  assert.equal(vendorId, "vendor-a");
});

test("unauthenticated request cannot obtain vendor identity", () => {
  assert.throws(() => requireVendorId({}), /Active vendor authentication required/);
});

test("customer context cannot perform vendor operation", () => {
  assert.throws(
    () => requireVendorId({ seller: { _id: "user-a", role: "customer", active: true } }),
    /Active vendor authentication required/
  );
});

test("inactive vendor cannot perform vendor operation", () => {
  assert.throws(
    () => requireVendorId({ seller: { _id: "vendor-a", role: "vendor", active: false } }),
    /Active vendor authentication required/
  );
});

test("vendor cannot change product owner through update payload", () => {
  assert.throws(
    () => updateProductInput({ name: "Changed", vendorId: "vendor-b" }),
    /server controlled/
  );
});
