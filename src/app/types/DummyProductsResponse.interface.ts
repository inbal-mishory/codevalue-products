import { DummyProducts } from "./dummyProducts.interface";

export interface DummyProductsResponse {
  limit: number;
  products: DummyProducts;
  skip: number;
  total: number;
}
