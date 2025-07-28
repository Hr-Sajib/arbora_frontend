import { GetProductResponse, Product } from "@/types";
import baseApi from "../baseApi";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductsByCategory: builder.query<GetProductResponse, string>({
      query: (categoryId) => `/product/by-category/${categoryId}`,
      providesTags: (result, error, categoryId) => [
        { type: "Products", id: categoryId },
      ],
    }),
    getProducts: builder.query<{ success: boolean; message: string; data: Product[] }, void>({
         query: () => "/product",
       }),
    
  }),
});

export const { useGetProductsByCategoryQuery, useGetProductsQuery } = productsApi;
