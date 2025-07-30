import baseApi from "../baseApi";

interface Order {
  id: number;
  productId: number;
  quantity: number;
  status: string;
}

export interface ProductSegment {
  combination: string[];
  frequency: number;
}

interface ProductSegmentResponse {
  success: boolean;
  message: string;
  data: ProductSegment[];
}

interface UpdateOrderPayload {
  id: string; // MongoDB _id as string
  date?: string;
  invoiceNumber?: string;
  shippingCharge?: number;
  PONumber?: string;
  storeId?: string;
  paymentDueDate?: string;
  paymentAmountReceived?: number;
  paymentStatus?: string;
  salesPerson?: string;
  products?: Array<{
    productId: string;
    quantity: number;
    discount: number;
  }>;
}

const orderManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: () => "/order",
      providesTags: ["Orders"], // Already present, kept for clarity
    }),
    addOrder: builder.mutation<any, any>({
      query: (order) => ({
        url: "/order",
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["Orders"], // Already present, kept for clarity
    }),
    giteSingleOrder: builder.query({
      query: (id) => `/order/${id}`,
      providesTags: (result, error, id) => [{ type: "Orders", id }], // Add specific tag for single order
    }),
    updateOrder: builder.mutation<any, UpdateOrderPayload>({
      query: ({ id, ...patch }) => ({
        url: `/order/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Orders",
        { type: "Orders", id }, // Invalidate both list and specific order
      ],
    }),
    deleteOrder: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/order/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"], // Already present, kept for clarity
    }),
    getProductSegments: builder.query<ProductSegmentResponse, void>({
      query: () => "/order/getProductSegmentation",
      providesTags: ["ProductSegments"],
    }),
    getPaymentHistory: builder.query({
      query: (id) => `/payment/${id}/customersPayments`,
    }),
    insertPayment: builder.mutation<any, any>({
      query: (order) => ({
        url: "/payment",
        method: "POST",
        body: order,
      })
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useAddOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetProductSegmentsQuery,
  useGiteSingleOrderQuery,
  useGetPaymentHistoryQuery,
  useInsertPaymentMutation,
} = orderManagementApi;

export default orderManagementApi;