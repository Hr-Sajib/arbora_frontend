export interface Order {
  _id: string;
  date: string;
  invoiceNumber: string;
  PONumber: string;
  storeId: {
    _id: string;
    storeName: string;
    storePhone: string;
    storePersonEmail: string;
    salesTaxId: string;
    acceptedDeliveryDays: string[];
    bankACHAccountInfo: string;
    storePersonName: string;
    storePersonPhone: string;
    billingAddress: string;
    billingState: string;
    billingZipcode: string;
    billingCity: string;
    shippingAddress: string;
    shippingState: string;
    shippingZipcode: string;
    shippingCity: string;
    shippingCharge: string;
    creditApplication: string;
    ownerLegalFrontImage: string;
    ownerLegalBackImage: string;
    voidedCheckImage: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  paymentDueDate: string;
  orderAmount: number;
  orderStatus: string;
  paymentAmountReceived: number;
  discountGiven: number;
  openBalance: number;
  profitAmount: number;
  profitPercentage: number;
  paymentStatus: string;
  products: Array<{
    productId: string | null;
    quantity: number;
    discount: number;
    _id: string;
  }>;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}



export interface ReusableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode; // required
  title: string;
  children: React.ReactNode;
}



export interface AddOrderFormValues {
  date: string;
  invoiceNumber: string;
  PONumber: string;
  storeName: string;
  paymentDueDate: string;
  orderAmount: string;
  orderStatus: string;
  paymentAmountReceived: string;
  discountGiven: string;
  openBalance: string;
  profitAmount: string;
  profitPercentage: string;
  paymentStatus: string;
}

export interface AddOrderFormProps {
  onSubmit: (values: AddOrderFormValues) => void;
  onCancel?: () => void;
}



// "@/types/index.ts" or similar

interface CustomerOrder {
  _id: string;
  invoiceNumber: string;
  PONumber: string;
  date: string;
  paymentDueDate: string;
  orderAmount: number;
  orderStatus: string;
  paymentAmountReceived: number;
  discountGiven: number;
  openBalance: number;
  profitAmount: number;
  profitPercentage: number;
  paymentStatus: string;
  storeId: string;
}

export interface Customer {
  _id: string;
  storeName: string;
  storePhone: string;
  storePersonEmail: string;
  salesTaxId: string;
  acceptedDeliveryDays: string[];
  bankACHAccountInfo: string;
  storePersonName: string;
  storePersonPhone: string;
  billingAddress: string;
  billingState: string;
  billingZipcode: string;
  billingCity: string;
  shippingAddress: string;
  shippingState: string;
  note: string;
  shippingZipcode: string;
  shippingCity: string;
  creditApplication?: string;
  ownerLegalFrontImage?: string;
  ownerLegalBackImage?: string;
  voidedCheckImage?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional fields from fakeData, assuming they might exist
  openBalance?: number;
  totalOrders?: number;
  totalOrderAmount?: number;
  isCustomerSourceProspect?: boolean;
  customerOrders?: CustomerOrder[];
}

// TypeScript type for API response
export interface GetCustomersResponse {
  success: boolean;
  message: string;
  data: Customer[];
}

// add container type
export interface ContainerProduct {
  _id: string;
  category: string;
  itemNumber: string;
  quantity: number;
  perCaseCost: number;
  packetSize: string;
  purchasePrice: number;
  salesPrice: number;
  
}

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

export interface ContainerApiResponse {
  success: boolean;
  message: string;
  data: Container[];
}

export interface InventoryProduct {
  _id: string;
  name: string;
  category: string;
  packetSize: string;
  perCaseCost: number;
  purchasePrice: number;
  salesPrice: number;
}

export interface InventoryApiResponse {
  success: boolean;
  message: string;
  data: InventoryProduct[];
}

export interface Category {
  _id: string;
  name: string;
}

export interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: Category[];
}

// Dimensions for package size
export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

// Nested category information
export interface CategoryId {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Main product type for products by category
export interface Product {
  packageDimensions: PackageDimensions;
  _id: string;
  name: string;
  isDeleted: boolean;
  competitorPrice: number;
  packetSize: string;
  weight: number;
  weightUnit: string;
  categoryId: CategoryId;
  reorderPointOfQuantity: number;
  salesPrice: number;
  purchasePrice: number;
  barcodeString: string;
  itemNumber: string;
  quantity: number;
  warehouseLocation: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  incomingQuantity: number;
}
export interface GetProductResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export interface Prospect {
  _id: string;
  storeName: string;
  storePhone: string;
  storePersonEmail: string;
  storePersonName: string;
  storePersonPhone: string;
  salesTaxId: string;
  shippingAddress: string;
  shippingState: string;
  shippingZipcode: string;
  miscellaneousDocImage: string;
  leadSource: string;
  note: string;
  status: string;
  assignedSalesPerson: {
    _id: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  
  quotedList: {
    productObjId?: {
      _id: string;
      name: string;
      isDeleted: boolean;
      competitorPrice: number;
      packetSize: string;
      weight: number;
      weightUnit: string;
      categoryId: string;
      reorderPointOfQuantity: number;
      salesPrice: number;
      purchasePrice: number;
      barcodeString: string;
      itemNumber: string;
      quantity: number;
      warehouseLocation: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
      incomingQuantity: number;
      packageDimensions: {
        length: number;
        width: number;
        height: number;
        unit: string;
      };
    };
    itemNumber: string;
    itemName: string;
    price: number;
    // packetSize: string;
  }[];
  competitorStatement: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProspectsResponse {
  success: boolean;
  message: string;
  data: Prospect[];
}

// types.ts or within the component file

// QuotedListItem type (includes packetSize from the sample data)
export interface QuotedListItem {
  productObjId: string; // 24-char ObjectId (e.g., "686eea6ac3e14203529ced6c")
  itemNumber: string;
  itemName: string;
  
  price: number;
  // Optional, 24-char ObjectId if required by API
  packetSize?: string; // New field from sample data, optional if not always present
}

// FollowUpActivity type (includes call as a valid activityMedium)
export interface FollowUpActivity {
  activity: string;
  activityDate: string; // ISO date string (e.g., "2025-07-10")
  activityMedium:string; // Updated to include "call"
  // Optional, 24-char ObjectId if required by API
}

// AddProspectRequest type (full form data structure)
export interface AddProspectRequest {
  storeName: string;
  storePhone: string;
  storePersonEmail: string;
  storePersonName: string;
  storePersonPhone: string;
  salesTaxId: string;
  shippingAddress: string;
  shippingState: string;
  shippingZipcode: string;
  shippingCity: string;
  miscellaneousDocImage?: string;
  leadSource: string;
  note?: string;
  status: "new" | "contacted" | "qualified" | "rejected" | "converted";
  competitorStatement?: string;
  quotedList: QuotedListItem[];
  followUpActivities: FollowUpActivity[]; // ✅ Update this line
  assignedSalesPerson: string;
  isDeleted?: boolean;
}

// @/types/index.ts (or wherever your types are defined)
export interface FilterFormValues {
  startDate?: string;
  endDate?: string;
  paymentDueStartDate?: string;
  paymentDueEndDate?: string;
  orderStatus?: string[];
  paymentStatus?: string[];
  storeIds?: string[];
  minOrderAmount?: number;
  maxOrderAmount?: number;
  hasOpenBalance?: boolean;
}

export interface OrderFilterFormProps {
  onSubmit: (values: FilterFormValues) => void;
  onClear?: () => void;
  initialValues?: FilterFormValues | null;
}
