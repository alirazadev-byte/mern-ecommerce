import fs from "fs";
import mongoose from "mongoose";
import { databaseEnv } from "../config/databaseEnv";
import { connectDatabase } from "../confing/dbconfing";
import Product = require("../models/ProductModel");
import Shop = require("../models/Shop");
import Inventory = require("../models/Inventory");
import { createInventory } from "../services/inventoryService";

type OwnershipMapping = Record<string, string>;

function argValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const mappingPath = argValue("--mapping");
  const mapping: OwnershipMapping = mappingPath ? JSON.parse(fs.readFileSync(mappingPath, "utf8")) : {};
  await connectDatabase(databaseEnv.databaseUrl);

  const [unowned, ownedWithoutInventory] = await Promise.all([
    Product.find({ vendor: { $exists: false } }).select("_id name stock").lean(),
    Product.aggregate([
      { $match: { vendor: { $exists: true } } },
      { $lookup: { from: "inventories", localField: "_id", foreignField: "product", as: "inventory" } },
      { $match: { inventory: { $size: 0 } } },
      { $project: { _id: 1, vendor: 1, name: 1, stock: 1 } },
    ]),
  ]);

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", unownedProducts: unowned.length, ownedProductsWithoutInventory: ownedWithoutInventory.length, suppliedOwnershipMappings: Object.keys(mapping).length }, null, 2));

  if (!apply) {
    console.log("No data changed. Provide --mapping <json-file> and --apply to assign explicit legacy ownership; owned products can then receive Inventory records from their legacy stock value.");
    return;
  }

  for (const [productId, vendorId] of Object.entries(mapping)) {
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(vendorId)) throw new Error(`Invalid mapping ${productId} -> ${vendorId}`);
    const vendor = await Shop.exists({ _id: vendorId, role: "vendor" });
    if (!vendor) throw new Error(`Vendor ${vendorId} does not exist`);
    const result = await Product.updateOne({ _id: productId, vendor: { $exists: false } }, { $set: { vendor: vendorId } });
    if (result.matchedCount !== 1) throw new Error(`Product ${productId} is missing or already owned; ownership was not changed`);
  }

  const productsToMigrate = await Product.find({ vendor: { $exists: true } }).select("_id vendor name stock");
  let inventoriesCreated = 0;
  for (const product of productsToMigrate) {
    const exists = await Inventory.exists({ product: product._id });
    if (exists || !product.vendor) continue;
    const quantity = typeof product.stock === "number" && product.stock >= 0 ? product.stock : 0;
    await createInventory(product._id, product.vendor, product.name, quantity);
    inventoriesCreated += 1;
  }

  console.log(JSON.stringify({ ownershipAssignmentsApplied: Object.keys(mapping).length, inventoriesCreated }, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
