import axios from "axios";
import type { CatalogProduct, CatalogResponse } from "../types/catalog";

const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL || "http://localhost:9000").replace(/\/$/, "");

export async function getCatalog(page: number, perPage: number): Promise<CatalogResponse> {
  const response = await axios.get<CatalogResponse>(`${apiBaseUrl}/api/v1/catalog`, { params: { page, perPage } });
  return response.data;
}

export async function getCatalogProduct(productId: string): Promise<CatalogProduct> {
  const response = await axios.get<CatalogProduct>(`${apiBaseUrl}/api/v1/find/${encodeURIComponent(productId)}`);
  return response.data;
}
