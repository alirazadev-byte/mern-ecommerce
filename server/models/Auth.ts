import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import { env } from "../config/env";
import { ROLES, type Role } from "../domain/roles";

interface IUserAddress {
  country: string;
  city: string;
  address1: string;
  address2?: string;
  zipCode: string;
  addressType?: string;
}

interface IUser {
  name: string;
  email: string;
  password: string;
  active: boolean;
  isAdmin: boolean;
  firstLogin: boolean;
  avatar?: string;
  phonenumber?: string;
  addresses: IUserAddress[];
  role: Extract<Role, "customer" | "admin">;
  generateJWT(): string;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

type UserModel = Model<IUser>;

const addressSchema = new Schema<IUserAddress>(
  {
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address1: { type: String, required: true, trim: true },
    address2: { type: String, trim: true },
    zipCode: { type: String, required: true, trim: true },
    addressType: { type: String, trim: true },
  },
  { _id: false }
);

const authSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    active: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    firstLogin: { type: Boolean, default: true },
    avatar: { type: String },
    phonenumber: { type: String, trim: true },
    addresses: { type: [addressSchema], default: [] },
    role: {
      type: String,
      enum: [ROLES.CUSTOMER, ROLES.ADMIN],
      default: ROLES.CUSTOMER,
      required: true,
    },
  },
  { timestamps: true }
);

authSchema.methods.generateJWT = function generateJWT(this: HydratedDocument<IUser>) {
  return jwt.sign({ id: this._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpires as jwt.SignOptions["expiresIn"],
  });
};

authSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

authSchema.methods.comparePassword = async function comparePassword(
  this: HydratedDocument<IUser>,
  enteredPassword: string
) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Auth = (mongoose.models.user as UserModel | undefined) ?? mongoose.model<IUser, UserModel>("user", authSchema);
export = Auth;
