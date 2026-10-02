import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import { env } from "../config/env";
import { ROLES } from "../domain/roles";

interface IShop {
  name: string;
  email: string;
  password: string;
  active: boolean;
  isAdmin: boolean;
  firstLogin: boolean;
  avatar?: string;
  phonenumber?: string;
  address: string;
  role: "vendor";
  generateJWT(): string;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

type ShopModel = Model<IShop>;

const shopSchema = new Schema<IShop, ShopModel>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    active: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    firstLogin: { type: Boolean, default: true },
    avatar: { type: String },
    phonenumber: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    role: { type: String, enum: [ROLES.VENDOR], default: ROLES.VENDOR, required: true },
  },
  { timestamps: true }
);

shopSchema.methods.generateJWT = function generateJWT(this: HydratedDocument<IShop>) {
  return jwt.sign({ id: this._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpires as jwt.SignOptions["expiresIn"],
  });
};

shopSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

shopSchema.methods.comparePassword = async function comparePassword(
  this: HydratedDocument<IShop>,
  enteredPassword: string
) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Shop = (mongoose.models.Shop as ShopModel | undefined) ?? mongoose.model<IShop, ShopModel>("Shop", shopSchema);
export = Shop;
