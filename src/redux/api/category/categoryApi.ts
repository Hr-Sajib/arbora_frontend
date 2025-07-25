import baseApi from "../baseApi";

// ---- Category Interface ----
export interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  data: object;
}

export interface GetCategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}

// ---- Category API ----
const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<GetCategoryResponse, void>({
      query: () => "/category",
      providesTags: ["Categories"],
    }),
    addCategory: builder.mutation<Category, Partial<Category>>({
      query: (category) => ({
        url: "/category",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation<
      Category,
      Partial<Category> & { _id: string }
    >({
      query: ({ _id, ...patch }) => ({
        url: `/category/${_id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;

export default categoryApi;
