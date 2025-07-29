import baseApi from "../../baseApi";

// Product inside a container
export interface ContainerProduct {
  _id: string;
  category: string;
  itemNumber: string;
  quantity: number;
  perCaseCost: number;
  perCaseShippingCost?: string;
  purchasePrice: number;
  salesPrice: number;
  packetSize: string;
}

// Full container object
export interface Container {
  _id: string;
  containerNumber: string;
  containerName: string;
  isDeleted: boolean;
  containerStatus: "onTheWay" | "delivered" | "pending" | string;
  deliveryDate: string;
  shippingCost: number;
  containerProducts: ContainerProduct[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Wrapper around API response for a single container
export interface ContainerResponse {
  success: boolean;
  message: string;
  data: Container;
}

// Wrapper around API response for multiple containers
export interface ContainerApiResponse {
  success: boolean;
  message: string;
  data: Container[];
}

// API integration
const containerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET all containers (returns object with "data" as array)
    getContainers: builder.query<ContainerApiResponse, void>({
      query: () => "/container",
      providesTags: ["Containers"],
    }),

    // ✅ GET a single container by ID
    getContainer: builder.query<ContainerResponse, string>({
      query: (id) => `/container/${id}`,
      providesTags: ["Containers"],
    }),

    // ✅ POST create container
    addContainer: builder.mutation<Container, Partial<Omit<Container, "_id" | "createdAt" | "updatedAt" | "__v">>>({
      query: (container) => ({
        url: "/container",
        method: "POST",
        body: container,
      }),
      invalidatesTags: ["Containers", "Products", "Inventory"], // Invalidate Products and Inventory
    }),

    // ✅ PATCH update container
    updateContainer: builder.mutation<Container, { id: string; data: Partial<Container> }>({
      query: ({ id, data }) => ({
        url: `/container/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Containers", "Products", "Inventory"], // Invalidate Products and Inventory
    }),

    // ✅ DELETE container
    deleteContainer: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/container/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Containers"],
    }),

    // ✅ POST import container from Excel
    importContainerExcel: builder.mutation<ContainerApiResponse, FormData>({
      query: (formData) => ({
        url: "/container/xl",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Containers", "Products", "Inventory"], // Invalidate Products and Inventory
    }),
  }),
});

export const {
  useGetContainersQuery,
  useGetContainerQuery,
  useAddContainerMutation,
  useUpdateContainerMutation,
  useDeleteContainerMutation,
  useImportContainerExcelMutation,
} = containerApi;

export default containerApi;
