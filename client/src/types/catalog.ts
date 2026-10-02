export interface CatalogProduct {
  _id: string;
  vendor?: string;
  slug?: string;
  name: string;
  subtitle: string;
  brand: string;
  descriptoion: string;
  category: string;
  price: number;
  images: string[];
  ratings: number;
  reviewCount?: number;
  stock: number;
  productIsNew: boolean;
}

export interface CatalogPagination {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CatalogResponse {
  products: CatalogProduct[];
  pagination: CatalogPagination;
}
