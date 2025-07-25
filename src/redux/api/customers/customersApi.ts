



import { Customer } from "@/types";
import baseApi from "../baseApi";

const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<{ success: boolean; message: string; data: Customer[] }, void>({
      query: () => "/customer",
      providesTags: ["Customers"],
    }),
    getCustomer: builder.query<{ success: boolean; message: string; data: Customer }, string>({
      query: (id) => `/customer/${id}`,
      providesTags: ["Customers"],
    }),
    addCustomer: builder.mutation<Customer, Partial<Customer>>({
      query: (customer) => ({
        url: "/customer",
        method: "POST",
        body: customer,
      }),
      invalidatesTags: ["Customers"],
    }),
    updateCustomer: builder.mutation<Customer, { id: string; data: Partial<Customer> }>({
      query: ({ id, data }) => ({
        url: `/customer/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Customers"],
    }),
    deleteCustomer: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/customer/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),
      sendEmailForNotPaidOrders: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/customer/${id}/send-email-for-not-paid-orders`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useSendEmailForNotPaidOrdersMutation
} = customersApi;
export default customersApi;
