import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("public catalog uses database pagination instead of Array.slice", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "services/catalogService.ts"), "utf8");
  assert.match(source, /\.skip\(/);
  assert.match(source, /\.limit\(/);
  assert.match(source, /countDocuments/);
  assert.doesNotMatch(source, /products\.slice\(/);
});

test("inventory has uniqueness and vendor access indexes", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "models/Inventory.ts"), "utf8");
  assert.match(source, /inventory_product_unique/);
  assert.match(source, /inventory_sku_unique/);
  assert.match(source, /vendor_inventory_recent/);
});
