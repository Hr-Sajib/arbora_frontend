


import baseApi from "../../baseApi";




// Full Inventory Type (as received from backend)
export interface payload {
  _id: string;
  name: string;
  description?: string;
  itemNumber: string;
  barcodeString: string;
  categoryId?: { _id: string; name: string }; // Full object from DB
  packetSize: string;
  weight: number;
  weightUnit: string;
  incomingQuantity: number;
  profitPercentage: number;
  packageDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  quantity: number;
  reorderPointOfQuantity: number;
  warehouseLocation: string;
  purchasePrice: number;
  salesPrice: number;
  competitorPrice: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export type PacketSizeResponse = {
  success: boolean;
  message: string;
  data: string[];
};

// ✅ New payload type for update mutation
export type UpdateInventoryPayload = {
  _id: string;
  name: string;
  description?: string;
  packetSize: string;
  weight: number;
  weightUnit: string;
  categoryId: string; // ✅ only string ID
  reorderPointOfQuantity: number;
  quantity: number;
  warehouseLocation: string;
  purchasePrice: number;
  salesPrice: number;
  competitorPrice: number;
  barcodeString: string;
  packageDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
};

export interface CreateInventoryPayload {
  name: string;
  itemNumber: string;
  quantity: number;
  reorderPointOfQuantity: number;
  weight: number;
  weightUnit: string;
  purchasePrice: number;
  salesPrice: number;
  competitorPrice: number;
  barcodeString: string;
  warehouseLocation: string;
  packetSize: string;
  categoryId: string; // ✅ just string here
  packageDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  isDeleted: boolean;
}


interface InventoryResponse {
  success: boolean;
  message: string;
  data: payload[];
}

const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<InventoryResponse, void>({
      query: () => "/product",
      providesTags: ["Inventory"],
    }),

    addInventory: builder.mutation<payload, CreateInventoryPayload>({
      query: (inventory) => ({
        url: "/product",
        method: "POST",
        body: inventory,
      }),
      invalidatesTags: ["Inventory"],
    }),

    // ✅ Updated mutation uses the new UpdateInventoryPayload
    updateInventory: builder.mutation<payload, UpdateInventoryPayload>({
      query: ({ _id, ...patch }) => ({
        url: `/product/${_id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["Inventory"],
    }),

    deleteInventory: builder.mutation<{ success: boolean }, string>({
      query: (_id) => ({
        url: `/product/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Inventory"],
    }),

    // get all pack size 
    getPackSize: builder.query<PacketSizeResponse, void>({
      query: () => "/product/packet-sizes",
      providesTags: ["Inventory"],
    }),

  }),
});

export const {
  useGetInventoryQuery,
  useAddInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useGetPackSizeQuery
} = inventoryApi;

export default inventoryApi;

