export const PRODUCT_STATUSES = {
  ACTIVE: "active",
  DRAFT: "draft",
  ARCHIVED: "archived",
} as const;

export type ProductStatus =
  (typeof PRODUCT_STATUSES)[keyof typeof PRODUCT_STATUSES];

export const INVENTORY_STATUSES = {
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
} as const;

export type InventoryStatus =
  (typeof INVENTORY_STATUSES)[keyof typeof INVENTORY_STATUSES];

export interface CatalogQuery {
  page: number;
  perPage: number;
  category?: string;
  vendorId?: string;
  search?: string;
  sort: "newest" | "price_asc" | "price_desc" | "rating";
}

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}
