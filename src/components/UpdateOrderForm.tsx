"use client";

import { useState, useEffect } from "react";
import { useGetCustomersQuery } from "@/redux/api/customers/customersApi";
import { useGetCategoriesQuery } from "@/redux/api/category/categoryApi";
import { useGetProductsByCategoryQuery } from "@/redux/api/product/productApi";
import { useUpdateOrderMutation } from "@/redux/api/order/orderManagementApi";

import {
  Calendar,
  MapPin,
  Search,
  Plus,
  Minus,
  User,
  Package,
  ShoppingCart,
  Calculator,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Updated interfaces to match simplified payload structure
interface UpdateOrderPayload {
  id: string;
  date: string;
  storeId: string;
  paymentDueDate: string;
  orderAmount: number;
  shippingCharge?: number;
  products: Array<{
    productId: string;
    quantity: number;
    discount: number;
  }>;
  orderStatus: "verified" | "completed" | "cancelled"; // Added orderStatus
}

interface Product {
  _id: string;
  name: string;
  itemNumber: string;
  salesPrice: number;
  quantity: number;
  weight: number;
  weightUnit: string;
  categoryId: {
    _id: string;
    name: string;
  };
}

interface OrderItem {
  product: ProductDetails;
  quantity: number;
  bookedQty: number;
  discount: number;
  total: number;
}

interface ProductDetails {
  id: string;
  name: string;
  itemCode: string;
  category: string;
  price: number;
  availableQty: number;
  unit: string;
}

interface Client {
  _id: string;
  storeName: string;
  shippingAddress: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Order {
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
    shippingCharge?: string;
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
  orderStatus: string; // Existing orderStatus from API
  paymentAmountReceived: number;
  discountGiven: number;
  openBalance: number;
  profitAmount: number;
  profitPercentage: number;
  paymentStatus: string;
  products: Array<{
    productId: {
      _id: string;
      name: string;
      salesPrice: number;
      itemNumber: string;
      categoryId: {
        _id: string;
        name: string;
      };
      quantity: number;
      weightUnit: string;
    };
    quantity: number;
    discount: number;
    _id: string;
  }>;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface UpdateOrderPageProps {
  order: Order;
  onUpdateSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

const UpdateOrderPage: React.FC<UpdateOrderPageProps> = ({
  order,
  onUpdateSuccess,
  onCancel,
  isModal = false,
}) => {
  console.log("order for update", order);

  // Simplified state management - only required fields
  const [selectedClient, setSelectedClient] = useState<string>(
    order?.storeId?._id ?? ""
  );
  const [orderDate, setOrderDate] = useState<string>(
    order?.date ? new Date(order.date).toISOString().split("T")[0] : ""
  );
  const [paymentDueDate, setPaymentDueDate] = useState<string>(
    order?.paymentDueDate
      ? new Date(order.paymentDueDate).toISOString().split("T")[0]
      : ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOrderInitialized, setIsOrderInitialized] = useState(false);
  const [orderStatus, setOrderStatus] = useState<
    "verified" | "completed" | "cancelled"
  >(
    (order?.orderStatus as "verified" | "completed" | "cancelled") || "verified"
  ); // Default to "verified" if not set
  const router = useRouter();

  // API hooks
  const { data: customers } = useGetCustomersQuery();
  const clients = customers?.data ?? [];

  const { data: categoryData, isLoading: categoryLoading } =
    useGetCategoriesQuery();
  const categories = categoryData?.data ?? [];

  const { data: productResponse, isLoading: productLoading } =
    useGetProductsByCategoryQuery(selectedCategoryId, {
      skip: !selectedCategoryId,
    });
  const products = productResponse?.data ?? [];

  const [updateOrder, { isLoading: isOrderSubmitting }] =
    useUpdateOrderMutation();

  // Initialize order items from existing order - ENHANCED VERSION
  useEffect(() => {
    if (order?.products?.length && !isOrderInitialized) {
      console.log("Initializing order items with data:", order.products);

      const initialOrderItems = order.products
        .map((orderProduct) => {
          const productData = orderProduct.productId;

          if (productData && productData._id) {
            const productDetails: ProductDetails = {
              id: productData._id,
              name: productData.name || `Product ${productData._id}`,
              itemCode: productData.itemNumber || `SKU-${productData._id}`,
              category: productData.categoryId?.name || "Unknown",
              price: Number(productData.salesPrice) || 0,
              availableQty: Number(productData.quantity) || 0,
              unit: productData.weightUnit || "pcs",
            };

            const quantity = Number(orderProduct.quantity) || 0;
            const discount = Number(orderProduct.discount) || 0;
            const total = productDetails.price * quantity - discount;

            return {
              product: productDetails,
              quantity,
              bookedQty: 0,
              discount,
              total,
            };
          }
          return null;
        })
        .filter((item): item is OrderItem => item !== null);

      console.log("Processed order items:", initialOrderItems);

      if (initialOrderItems.length > 0) {
        setOrderItems(initialOrderItems);
      }
      setIsOrderInitialized(true);
    }
  }, [order?.products, isOrderInitialized]);

  // Set default category
  useEffect(() => {
    if (categories?.length && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]?._id ?? "");
      setSelectedCategoryName(categories[0]?.name ?? "");
    }
  }, [categories, selectedCategoryId]);

  // Product management functions
  const addToOrder = (product: Product) => {
    const item: ProductDetails = {
      id: product._id,
      name: product.name,
      itemCode: product.itemNumber,
      price: product.salesPrice,
      availableQty: product.quantity,
      unit: product.weightUnit,
      category: product.categoryId?.name || "",
    };

    const exists = orderItems.find((i) => i.product.id === item.id);
    if (exists) {
      updateQuantity(item.id, exists.quantity + 1);
    } else {
      setOrderItems([
        ...orderItems,
        {
          product: item,
          quantity: 1,
          bookedQty: 0,
          discount: 0,
          total: item.price,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromOrder(productId);
      return;
    }
    setOrderItems((items) =>
      items.map((item) => {
        if (item.product.id === productId) {
          const total = item.product.price * qty - item.discount;
          return { ...item, quantity: qty, total };
        }
        return item;
      })
    );
  };

  const updateDiscount = (productId: string, discount: number) => {
    setOrderItems((items) =>
      items.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              discount,
              total: item.product.price * item.quantity - discount,
            }
          : item
      )
    );
  };

  const updatePrice = (productId: string, price: number) => {
    setOrderItems((items) =>
      items.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              product: { ...item.product, price: price },
              total: price * item.quantity - item.discount,
            }
          : item
      )
    );
  };

  const removeFromOrder = (productId: string) => {
    setOrderItems((items) =>
      items.filter((item) => item.product.id !== productId)
    );
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product: Product) =>
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.itemNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const calculateTotals = () => {
    const totalAmount = orderItems.reduce((acc, item) => acc + item.total, 0);
    const totalQuantity = orderItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    return {
      totalAmount,
      totalQuantity,
    };
  };

  const { totalAmount, totalQuantity } = calculateTotals();

  // Updated payload construction to match simplified structure
  const constructOrderPayload = (): UpdateOrderPayload => ({
    id: order._id,
    date: orderDate,
    storeId: selectedClient,
    paymentDueDate,
    orderAmount: Math.round(totalAmount),
    products: orderItems.map((item) => ({
      productId: item.product.id,
      quantity: Math.round(item.quantity),
      discount: Math.round(item.discount),
    })),
    orderStatus, // Added orderStatus to payload
  });

  // Handle order update
  const handleUpdateOrder = async () => {
    if (!selectedClient || orderItems.length === 0) {
      toast.error("Please select a client and add items");
      return;
    }

    try {
      const payload = constructOrderPayload();
      console.log("Updating order with payload:", payload);

      const result = await updateOrder(payload).unwrap();
      console.log("Update successful:", result);

      toast.success("Order updated successfully!");

      if (isModal && onUpdateSuccess) {
        console.log("Modal should close now");
        onUpdateSuccess();
      } else if (!isModal) {
        router.push("/dashboard/order-management");
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      }
    } catch (err: any) {
      console.error("Update order error:", err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        err?.error ||
        "Failed to update order";
      toast.error(`Order update failed: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (!isModal) {
      router.back();
    }
  };

  return (
    <Card className="w-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Update Order #{order?.invoiceNumber || "N/A"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Simplified form - only required fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" /> Select Client
            </Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client._id} value={client._id}>
                    <div>
                      <span className="font-medium">{client.storeName}</span>
                      <div className="text-xs text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {client.shippingAddress}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              Current: {order?.storeId?.storeName || "N/A"}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Order Date
            </Label>
            <Input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Payment Due Date
            </Label>
            <Input
              type="date"
              value={paymentDueDate}
              onChange={(e) => setPaymentDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Order Status
            </Label>
            <Select
              value={orderStatus}
              onValueChange={(value) =>
                setOrderStatus(value as "verified" | "completed" | "cancelled")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              Current: {order?.orderStatus || "N/A"}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories, Products, and Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>
                  <Package className="w-5 h-5 mr-2 inline-block" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px] pr-2">
                  {categoryLoading ? (
                    <p>Loading...</p>
                  ) : (
                    categories.map((cat: Category) => (
                      <Button
                        key={cat._id}
                        variant={
                          cat._id === selectedCategoryId ? "default" : "ghost"
                        }
                        className="w-full mb-2"
                        onClick={() => {
                          setSelectedCategoryId(cat._id);
                          setSelectedCategoryName(cat.name);
                        }}
                      >
                        {cat.name}
                      </Button>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-2 space-y-2">
            <Card className="h-[600px] overflow-y-auto">
              <CardHeader>
                <CardTitle>{selectedCategoryName || "Products"}</CardTitle>
              </CardHeader>
              <CardContent>
                {productLoading ? (
                  <p>Loading products...</p>
                ) : filteredProducts.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  filteredProducts.map((product: Product) => {
                    const orderItem = orderItems.find(
                      (item) => item.product.id === product._id
                    );
                    return (
                      <div
                        key={product._id}
                        className="border p-2 rounded mb-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{product.name}</div>

                            <div className="text-xs my-2">
                              <span>Available Quantity {product.quantity}</span>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            ${orderItem?.product.price || product.salesPrice}
                          </div>
                        </div>
                        <div className="mt-2">
                          {orderItem ? (
                            <div className="bg-blue-100 border border-blue-400 rounded p-3">
                              <div className="flex items-center gap-2 justify-between">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() =>
                                      updateQuantity(
                                        product._id,
                                        orderItem.quantity - 1
                                      )
                                    }
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="font-medium w-6 text-center">
                                    {orderItem.quantity}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() =>
                                      updateQuantity(
                                        product._id,
                                        orderItem.quantity + 1
                                      )
                                    }
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeFromOrder(product._id)}
                                >
                                  Remove
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-x-4 my-2 text-xs items-end">
                                <label className="flex items-center gap-1">
                                  Price:
                                  <Input
                                    type="number"
                                    value={orderItem.product.price}
                                    onChange={(e) =>
                                      updatePrice(
                                        product._id,
                                        Number(e.target.value)
                                      )
                                    }
                                    className="w-16 ml-1 h-6 text-xs"
                                    min="0"
                                  />
                                </label>
                                <label className="flex items-center gap-1">
                                  Discount:
                                  <Input
                                    type="number"
                                    value={orderItem.discount}
                                    onChange={(e) =>
                                      updateDiscount(
                                        product._id,
                                        Number(e.target.value)
                                      )
                                    }
                                    className="w-14 ml-1 h-6 text-xs"
                                    min="0"
                                  />
                                </label>
                                <span>
                                  Total: ${orderItem.total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToOrder(product)}
                              className="bg-green-600 hover:bg-green-700 mt-1"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>
                  <Calculator className="w-5 h-5 mr-2 inline-block" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <ScrollArea className="h-96">
                  {orderItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center pt-10">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                      No items added
                    </p>
                  ) : (
                    orderItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 border-b"
                      >
                        <div className="flex-1">
                          <span className="font-medium block">
                            {item.product.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            Qty: {item.quantity} | Discount: ${item.discount}
                          </span>
                        </div>
                        <span className="font-semibold ml-2">
                          ${item.total.toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
              <div className="border-t px-4 py-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Qty:</span>
                  <span className="font-semibold">{totalQuantity}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Order Amount:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Original Order Amount: ${order?.orderAmount?.toFixed(2)} | Current
            Amount: ${totalAmount.toFixed(2)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {order.orderStatus == "completed" ? (
              <div className="bg-red-100 flex items-center px-2 rounded-md">Cant update completed orders 🚫</div>
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={
                  !selectedClient ||
                  orderItems.length === 0 ||
                  isOrderSubmitting
                }
                onClick={handleUpdateOrder}
              >
                {isOrderSubmitting ? "Updating..." : "Update Order"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdateOrderPage;
