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

// Updated payload interface to match your component needs
interface UpdateOrderPayload {
  id: string; // MongoDB _id as string
  date?: string;
  invoiceNumber?: string;
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
      
      providesTags: ["Orders"],
    }),
    addOrder: builder.mutation<any, any>({
      query: (order) => ({
        url: "/order",
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["Orders"],
    }),
    giteSingleOrder: builder.query({
      query: (id) => `/order/${id}`,
    }),
    // updateOrder: builder.mutation<Order, Partial<Order> & { id: number }>({
    //   query: ({ id, ...patch }) => ({
    //     url: `/order/${id}`,
    //     method: "PUT",
        
    updateOrder: builder.mutation<any, UpdateOrderPayload>({
      query: ({ id, ...patch }) => ({
        url: `/order/${id}`, // Changed to singular to match your backend
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["Orders"],
    }),
    deleteOrder: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/order/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
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
      }),
      invalidatesTags: ["Orders"],
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
  useInsertPaymentMutation
} = orderManagementApi;

export default orderManagementApi;
