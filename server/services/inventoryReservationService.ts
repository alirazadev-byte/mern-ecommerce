import type { ClientSession } from "mongoose";
import Inventory = require("../models/Inventory");
import ErrorHandler = require("../utils/Errorhandler");
import { INVENTORY_STATUSES } from "../domain/catalog";

export interface ReservationLine { productId: string; vendorId: string; quantity: number; }

export async function reserveInventory(lines: ReservationLine[], session: ClientSession): Promise<void> {
  for (const line of lines) {
    const inventory = await Inventory.findOneAndUpdate(
      { product: line.productId, vendor: line.vendorId, quantity: { $gte: line.quantity } },
      { $inc: { quantity: -line.quantity } },
      { new: true, session, runValidators: true }
    );
    if (!inventory) throw new ErrorHandler(`Insufficient inventory for product ${line.productId}`, 409);
    if (inventory.quantity === 0 && inventory.status !== INVENTORY_STATUSES.UNAVAILABLE) {
      inventory.status = INVENTORY_STATUSES.UNAVAILABLE;
      await inventory.save({ session });
    }
  }
}

export async function restoreInventory(lines: ReservationLine[], session: ClientSession): Promise<void> {
  for (const line of lines) {
    await Inventory.updateOne(
      { product: line.productId, vendor: line.vendorId },
      { $inc: { quantity: line.quantity }, $set: { status: INVENTORY_STATUSES.AVAILABLE } },
      { session }
    );
  }
}
