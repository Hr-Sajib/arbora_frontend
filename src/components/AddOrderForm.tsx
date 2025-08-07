"use client";

import { useState, useEffect } from "react";
import { useGetCustomersQuery } from "@/redux/api/customers/customersApi";
import { useGetCategoriesQuery } from "@/redux/api/category/categoryApi";
import { useGetProductsQuery } from "@/redux/api/product/productApi";
import { useAddOrderMutation } from "@/redux/api/order/orderManagementApi";

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
import Link from "next/link";
import { useDispatch } from "react-redux";
import inventoryApi from "@/redux/api/auth/inventory/inventoryApi";

// Updated interfaces to include payment due date
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
  price: number;
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

interface OrderProduct {
  productId: string;
  quantity: number;
  discount: number;
}

interface OrderPayload {
  date: string;
  shippingDate: string; // Added shippingDate to payload
  storeId: string;
  paymentDueDate: string;
  orderAmount: number;
  products: OrderProduct[];
}

interface AddOrderPageProps {
  setAddOrderOpen: (open: boolean) => void;
  onAddSuccess: () => void;
}


const AddOrderPage: React.FC<AddOrderPageProps> = ({ setAddOrderOpen, onAddSuccess }) => {  

  const { data: productsData, refetch: refetchProducts } = useGetProductsQuery(); // Add refetch

  const [selectedClient, setSelectedClient] = useState<string>("");
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [shippingDate, setShippingDate] = useState<string>( // New state for shipping date
    new Date().toISOString().split("T")[0]
  );
  const [paymentDueDate, setPaymentDueDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const { data: customers } = useGetCustomersQuery();
  const clients = customers?.data ?? [];

  const { data: categoryData, isLoading: categoryLoading } =
    useGetCategoriesQuery();
  const categories = categoryData?.data ?? [];

  const { data: productResponse, isLoading: productLoading } =
    useGetProductsQuery();
  const products = productResponse?.data ?? [];

  const [addOrder, { isLoading: isOrderSubmitting }] = useAddOrderMutation();

  useEffect(() => {
    if (categories.length && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]._id);
      setSelectedCategoryName(categories[0].name);
    }
  }, [categories, selectedCategoryId]);

  const addToOrder = (product: Product) => {
    const item: ProductDetails = {
      id: product._id,
      name: product.name,
      itemCode: product.itemNumber,
      price: product.salesPrice,
      availableQty: product.quantity,
      unit: product.weightUnit,
      category: product.categoryId.name,
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
          price: item.price,
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

  // ✅ Updated: filter across all categories on search, otherwise filter by selected category
  const filteredProducts =
    searchTerm.trim() !== ""
      ? products.filter(
          (product: Product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.itemNumber.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : selectedCategoryId
      ? products.filter(
          (product) => product.categoryId._id === selectedCategoryId
        )
      : products;

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

  const constructOrderPayload = (): OrderPayload => ({
    date: orderDate,
    shippingDate: shippingDate, // Added shippingDate to payload
    storeId: selectedClient,
    paymentDueDate,
    orderAmount: Math.round(totalAmount),
    products: orderItems.map((item) => ({
      productId: item.product.id,
      quantity: Math.round(item.quantity),
      price: item.product.price,
      discount: (item.discount),
    })),
  });

  const dispatch = useDispatch(); // Add dispatch

  const handlePlaceOrder = async () => {
    if (!selectedClient || orderItems.length === 0) {
      alert("Please select a client and add items");
      return;
    }

    const payload = constructOrderPayload();
  console.log("payload: ",payload)

    try {
      await addOrder(payload).unwrap();
      setOrderItems([]);
      setSearchTerm("");
      setSelectedClient("");
      setOrderDate(new Date().toISOString().split("T")[0]);
      setShippingDate(new Date().toISOString().split("T")[0]);
      setPaymentDueDate("");
      alert("Order placed successfully!");
      refetchProducts(); // Keep for local consistency
      // Invalidate both Products and Inventory tags globally
      dispatch(inventoryApi.util.invalidateTags(["Products", "Inventory"]));
      onAddSuccess();
    } catch (err: any) {
      console.error("Order creation error:", err);
      alert(
        "Order failed: " + (err?.data?.message || err?.error || "Unknown error")
      );
    }
  };

  return (
    <Card className="w-full flex flex-col">
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Updated form to include payment due date - now 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" /> Select Client{" "}
              <span className="text-red-700">*</span>
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
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Order Date{" "}
              <span className="text-red-700">*</span>
            </Label>
            <Input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Delivery Date{" "}
              <span className="text-red-700">*</span>
            </Label>
            <Input
              type="date"
              name="shippingDate"
              value={shippingDate} // Updated to use shippingDate state
              onChange={(e) => setShippingDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Payment Due Date{" "}
              <span className="text-red-700">*</span>
            </Label>
            <Input
              type="date"
              value={paymentDueDate}
              onChange={(e) => setPaymentDueDate(e.target.value)}
              placeholder="Select payment due date"
            />
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products by name or SKU..."
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
                    const productCategory = categories.find(
                      (cat) => cat._id === product.categoryId._id
                    )?.name;
                    return (
                      <div
                        key={product._id}
                        className="border p-2 rounded mb-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="mb-2">{product.name}</div>
                            <div className="text-xs  font-medium">
                              Category -{" "}
                              <span>
                                {productCategory}
                              </span> <span>| Available Quantity {product.quantity}</span>
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
                    orderItems.map((item) => (
                      <div
                        key={item.product.id}
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
                  <span className="font-medium">{totalQuantity}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Order Amount:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            onClick={() => setAddOrderOpen(false)}
            variant="outline"
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            disabled={
              !selectedClient || orderItems.length === 0 || isOrderSubmitting
            }
            onClick={handlePlaceOrder}
          >
            {isOrderSubmitting ? "Placing..." : "Place Order"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddOrderPage;