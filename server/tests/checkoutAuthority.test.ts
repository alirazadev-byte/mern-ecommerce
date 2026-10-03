import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("legacy payment route trusting req.body.amount is removed", () => {
  const root = path.resolve(__dirname, "..");
  assert.equal(fs.existsSync(path.join(root, "Routes", "Payment.js")), false);
  const checkoutSource = fs.readFileSync(path.join(root, "services", "checkoutService.ts"), "utf8");
  assert.match(checkoutSource, /legacyPriceToMinor\(product\.price\)/);
  assert.doesNotMatch(checkoutSource, /req\.body\.amount/);
});

test("checkout reserves inventory with a conditional atomic decrement", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "..", "services", "inventoryReservationService.ts"), "utf8");
  assert.match(source, /quantity:\s*\{\s*\$gte:\s*line\.quantity\s*\}/);
  assert.match(source, /\$inc:\s*\{\s*quantity:\s*-line\.quantity\s*\}/);
});
