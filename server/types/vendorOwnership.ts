export type VendorRole = "vendor";

export type ResourceId = string | { toString(): string };

export interface AuthenticatedVendorContext {
  _id: ResourceId;
  role: VendorRole;
  active: true;
}

export interface VendorRequestContext {
  seller?: AuthenticatedVendorContext;
}

export interface VendorProductCreateInput {
  name: string;
  subtitle: string;
  brand: string;
  descriptoion: string;
  category: string;
  price: number;
  stock: number;
  productIsNew: boolean;
  images: string[];
}

export type VendorProductUpdateInput = Partial<
  Omit<VendorProductCreateInput, "images">
>;

export interface VendorProductRecord extends VendorProductCreateInput {
  _id: ResourceId;
  vendor: ResourceId;
}

export interface VendorProductRepository {
  create(input: VendorProductCreateInput & { vendor: ResourceId }): Promise<unknown>;
  find(filter: { vendor: ResourceId }): {
    sort(sort: { createdAt: -1 }): Promise<unknown[]>;
  };
  findOneAndUpdate(
    filter: { _id: ResourceId; vendor: ResourceId },
    update: { $set: VendorProductUpdateInput },
    options: { new: true; runValidators: true }
  ): Promise<unknown | null>;
  findOneAndDelete(filter: {
    _id: ResourceId;
    vendor: ResourceId;
  }): Promise<unknown | null>;
}
