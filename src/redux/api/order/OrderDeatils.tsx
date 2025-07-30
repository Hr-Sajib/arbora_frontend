"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Edit,
  Eye,
  FileText,
  Download,
  MoreHorizontal,
  DollarSign,
} from "lucide-react";
import { ImFilePdf } from "react-icons/im";
import Link from "next/link";
import Loading from "@/components/Loding/Loding";
import { useGiteSingleOrderQuery, useUpdateOrderMutation } from "./orderManagementApi";
import { useGetProductsQuery } from "../product/productApi";

const OrderDetails = ({ id }: { id: string }) => {
  const [isBestLoading, setIsBestLoading] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [shippingChargeInput, setShippingChargeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [discount, setDiscount] = useState("0");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: orderData, isError: orderError, isLoading: orderLoading, refetch: refetchOrder } = useGiteSingleOrderQuery(id);
  const { data: productsData, isLoading: productsLoading, isError: productsError } = useGetProductsQuery();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

  // Force refetch on mount
  useEffect(() => {
    refetchOrder();
  }, [id, refetchOrder]);

  const handleDownloadInvoice = async (id: string) => {
    setIsBestLoading(true);
    try {
      const token = Cookies?.get("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/order/orderInvoice/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const data = await response.arrayBuffer();
      const blob = new Blob([data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 10);
      setIsBestLoading(false);
    } catch (err) {
      console.log(err);
      setIsBestLoading(false);
    }
  };

  const handleDownloadDeliverySlip = async (id: string) => {
    setIsBestLoading(true);
    try {
      const token = Cookies?.get("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/order/deliverySheet/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const data = await response.arrayBuffer();
      const blob = new Blob([data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 10);
      setIsBestLoading(false);
    } catch (err) {
      console.log(err);
      setIsBestLoading(false);
    }
  };

  const handleDownloadShipToAddress = async (id: string) => {
    setIsBestLoading(true);
    try {
      const token = Cookies?.get("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/order/${id}/ship-to-address-pdf`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const data = await response.arrayBuffer();
      const blob = new Blob([data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 10);
      setIsBestLoading(false);
    } catch (err) {
      console.log(err);
      setIsBestLoading(false);
    }
  };

  const handleAddShippingCharge = async () => {
    if (
      !shippingChargeInput ||
      isNaN(Number(shippingChargeInput)) ||
      Number(shippingChargeInput) < 0
    ) {
      alert("Please enter a valid shipping charge amount.");
      return;
    }

    try {
      await updateOrder({
        id,
        shippingCharge: Number(shippingChargeInput),
      }).unwrap();
      alert("Shipping charge updated successfully!");
      await refetchOrder();
      setIsShippingModalOpen(false);
      setShippingChargeInput("");
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.error || "Failed to update shipping charge";
      alert(`Error: ${errorMessage}`);
      console.error("Update shipping charge error:", err);
    }
  };

  const handleAddProduct = async () => {
    if (
      !selectedProduct ||
      !quantity ||
      isNaN(Number(quantity)) ||
      Number(quantity) <= 0 ||
      isNaN(Number(discount)) ||
      Number(discount) < 0
    ) {
      alert(
        "Please select a product, enter a valid quantity (> 0), and a valid discount (>= 0)."
      );
      return;
    }

    const newProduct = {
      productId: selectedProduct._id,
      quantity: Number(quantity),
      discount: Number(discount),
    };

    try {
      const updatedProducts = [...(orderData?.data?.products || []), newProduct];
      await updateOrder({
        id,
        products: updatedProducts,
      }).unwrap();
      alert("Product added successfully!");
      await refetchOrder();
      setIsAddProductModalOpen(false);
      setSelectedProduct(null);
      setQuantity("");
      setDiscount("");
      setProductSearch("");
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.error || "Failed to add product";
      alert(`Error: ${errorMessage}`);
      console.error("Add product error:", err);
    }
  };

  // Filter products based on search query in the main table
  const filteredProducts =
    orderData?.data?.products?.filter((item: any) =>
      item?.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Filter available products based on search in the modal
  const filteredAvailableProducts =
    productsData?.data?.filter((product: any) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase())
    ) || [];

  // Handle product selection from dropdown and close it
  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setTimeout(() => setIsDropdownOpen(false), 0);
  };

  useEffect(() => {
    if (productSearch && !selectedProduct) {
      setIsDropdownOpen(true);
    } else if (!productSearch) {
      setIsDropdownOpen(false);
    }
  }, [productSearch, selectedProduct]);

  if (orderLoading || productsLoading) {
    return (
      <div className="p-6 text-center text-gray-700">
        Loading order details...
      </div>
    );
  }

  if (orderError || productsError) {
    return (
      <div className="p-6 text-center text-red-600">
        Error loading data. Please try again.
      </div>
    );
  }

  return (
    <div>
      {isBestLoading && <Loading />}
      <div className="p-6 bg-white">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order Details
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Invoice Number</span>
              <span className="font-semibold text-orange-600">
                {orderData?.data?.invoiceNumber || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Store Name</span>
              <span className="font-semibold text-orange-600">
                {orderData?.data?.storeId?.storeName || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">PO Number</span>
              <span className="font-medium">{orderData?.data?.PONumber || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Order Date</span>
              <span className="font-medium">{orderData?.data?.date || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Due Date</span>
              <span className="font-medium">
                {orderData?.data?.paymentDueDate || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Shipping Date</span>
              <span className="font-medium">
                {orderData?.data?.shippingDate || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Order Amount</span>
              <span className="font-medium">
                ${orderData?.data?.orderAmount?.toFixed(2) || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Shipping Charge</span>
              <span className="font-medium">
                ${orderData?.data?.shippingCharge?.toFixed(2) || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Discount Given</span>
              <span className="font-medium">
                ${orderData?.data?.discountGiven?.toFixed(2) || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Total Payable</span>
              <span className="font-bold">
                ${orderData?.data?.totalPayable?.toFixed(2) || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Open Balance</span>
              <span className="font-medium">
                ${orderData?.data?.openBalance?.toFixed(2) || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Profit Amount</span>
              <span className="font-medium">
                ${orderData?.data?.profitAmount?.toFixed(2) || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Profit Percentage</span>
              <span className="font-medium">
                {orderData?.data?.profitPercentage?.toFixed(2) || "N/A"}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Payment Received</span>
              <span className="font-medium">
                ${orderData?.data?.paymentAmountReceived?.toFixed(2) || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Order Status</span>
              <Badge
                variant={
                  orderData?.data?.orderStatus === "completed"
                    ? "secondary"
                    : orderData?.data?.orderStatus === "cancelled"
                    ? "destructive"
                    : "default"
                }
                className={
                  orderData?.data?.orderStatus === "completed"
                    ? "bg-green-100 text-green-800"
                    : ""
                }
              >
                {orderData?.data?.orderStatus || "N/A"}
              </Badge>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Payment Status</span>
              <Badge
                variant={
                  orderData?.data?.paymentStatus === "paid"
                    ? "secondary"
                    : orderData?.data?.paymentStatus === "notPaid"
                    ? "destructive"
                    : "default"
                }
                className={
                  orderData?.data?.paymentStatus === "paid"
                    ? "bg-green-100 text-green-800"
                    : ""
                }
              >
                {orderData?.data?.paymentStatus || "N/A"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="font-medium">{orderData?.data?.PONumber || "N/A"}</h2>
            <div className="flex items-center gap-2 ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search product in this order..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-68"
                />
              </div>
              <Button
                onClick={() => setIsAddProductModalOpen(true)}
                className="bg-gray-200 text-black border-gray-300 border hover:bg-white"
              >
                + Add Additional Product
              </Button>
              <Button
                className="bg-gray-200 text-black border-gray-300 border hover:bg-white"
                onClick={() => setIsShippingModalOpen(true)}
              >
                🚚 Add Shipping Charge
              </Button>
              <Link
                href={`/dashboard/order-management/${orderData?.data?._id}/${orderData?.data?.storeId?._id}`}
              >
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <DollarSign className="h-4 w-4" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <ImFilePdf className="w-5 h-5 text-black" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDownloadInvoice(orderData?.data?._id)}
                  >
                    Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadDeliverySlip(orderData?.data?._id)}
                  >
                    Delivery Slip
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadShipToAddress(orderData?.data?._id)}
                  >
                    Ship to Address
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isShippingModalOpen && (
            <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add Shipping Charge
                </h3>
                <div className="mb-4">
                  <label
                    htmlFor="shippingCharge"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Shipping Charge ($)
                  </label>
                  <Input
                    id="shippingCharge"
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingChargeInput}
                    onChange={(e) => setShippingChargeInput(e.target.value)}
                    placeholder="Enter shipping charge"
                    className="w-full"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsShippingModalOpen(false);
                      setShippingChargeInput("");
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddShippingCharge}
                    disabled={isUpdating || !shippingChargeInput}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? "Adding..." : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isAddProductModalOpen && (
            <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add Additional Product
                </h3>
                <div className="mb-4 relative">
                  <label
                    htmlFor="productSearch"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Search Product
                  </label>
                  <Input
                    id="productSearch"
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    placeholder="Search by product name..."
                    className="w-full mb-2"
                  />
                  {isDropdownOpen && productSearch && filteredAvailableProducts.length > 0 && (
                    <div className="absolute z-10 w-full max-h-40 overflow-y-auto bg-white border rounded-md shadow-lg mt-1">
                      {filteredAvailableProducts.map((product: any) => (
                        <div
                          key={product._id}
                          onClick={() => handleProductSelect(product)}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {product.name} (Item: {product.itemNumber}, Price: ${product.salesPrice})
                        </div>
                      ))}
                    </div>
                  )}
                  {isDropdownOpen && productSearch && filteredAvailableProducts.length === 0 && (
                    <div className="p-2 text-gray-500">No products found</div>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quantity
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    className="w-full"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="discount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discount ($)
                  </label>
                  <Input
                    id="discount"
                    type="number"
                    defaultValue="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="Enter discount"
                    className="w-full"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddProductModalOpen(false);
                      setSelectedProduct(null);
                      setQuantity("");
                      setDiscount("");
                      setProductSearch("");
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddProduct}
                    disabled={isUpdating || !selectedProduct || !quantity || !discount}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? "Adding..." : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Product Name</TableHead>
                <TableHead className="font-semibold">Item Number</TableHead>
                <TableHead className="font-semibold">Category Name</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Pur. Price</TableHead>
                <TableHead className="font-semibold">Discount</TableHead>
                <TableHead className="font-semibold">Sales Price</TableHead>
                <TableHead className="font-semibold">Profit</TableHead>
                <TableHead className="font-semibold">Profit %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((item: any, index: number) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {item?.productId?.name}
                  </TableCell>
                  <Link href="/dashboard/inventory">
                    <TableCell className="text-blue-600 cursor-pointer">
                      {item?.productId?.itemNumber}
                    </TableCell>
                  </Link>
                  <TableCell>{item?.productId?.categoryId?.name}</TableCell>
                  <TableCell>{item?.quantity}</TableCell>
                  <TableCell>
                    ${item?.productId?.purchasePrice?.toFixed(2) || "N/A"}
                  </TableCell>
                  <TableCell>${item?.discount?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    ${item?.productId?.salesPrice?.toFixed(2) || "N/A"}
                  </TableCell>
                  <TableCell>
                    $
                    {(
                      (item?.productId?.salesPrice * item.quantity -
                      item?.productId?.purchasePrice * item.quantity) - item?.discount
                    )?.toFixed(2) || "N/A"}
                  </TableCell>
                  <TableCell>
                    {(
                      (((item?.productId?.salesPrice * item.quantity -
                        item?.productId?.purchasePrice * item.quantity)-item?.discount) /
                        (item?.productId?.purchasePrice * item.quantity)) *
                      100
                    )?.toFixed(2) || "N/A"}
                    %
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
// "use client";
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import Cookies from "js-cookie";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import {
//   Search,
//   Edit,
//   Eye,
//   FileText,
//   Download,
//   MoreHorizontal,
//   DollarSign,
// } from "lucide-react";
// import { ImFilePdf } from "react-icons/im";
// import Link from "next/link";
// import Loading from "@/components/Loding/Loding";
// import { useGiteSingleOrderQuery, useUpdateOrderMutation } from "./orderManagementApi";
// import { useGetProductsQuery } from "../product/productApi";

// const OrderDetails = ({ id }: { id: string }) => {
//   const [isBestLoading, setIsBestLoading] = useState(false);
//   const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
//   const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
//   const [shippingChargeInput, setShippingChargeInput] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [productSearch, setProductSearch] = useState("");
//   const [selectedProduct, setSelectedProduct] = useState<any>(null);
//   const [quantity, setQuantity] = useState("");
//   const [discount, setDiscount] = useState("0");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controls dropdown visibility
//   const { data: orderData, isError: orderError, isLoading: orderLoading, refetch: refetchOrder } = useGiteSingleOrderQuery(id);
//   console.log("order details data", orderData);
//   const { data: productsData, isLoading: productsLoading, isError: productsError } = useGetProductsQuery();
//   const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

//   const handleDownloadInvoice = async (id: string) => {
//     setIsBestLoading(true);
//     try {
//       const token = Cookies?.get("token");
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_URL}/order/orderInvoice/${id}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch PDF");
//       }

//       const data = await response.arrayBuffer();
//       const blob = new Blob([data], { type: "application/pdf" });
//       const fileURL = URL.createObjectURL(blob);
//       window.open(fileURL, "_blank");
//       setTimeout(() => {
//         URL.revokeObjectURL(fileURL);
//       }, 10);
//       setIsBestLoading(false);
//     } catch (err) {
//       console.log(err);
//       setIsBestLoading(false);
//     }
//   };

//   const handleDownloadDeliverySlip = async (id: string) => {
//     setIsBestLoading(true);
//     try {
//       const token = Cookies?.get("token");
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_URL}/order/deliverySheet/${id}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch PDF");
//       }

//       const data = await response.arrayBuffer();
//       const blob = new Blob([data], { type: "application/pdf" });
//       const fileURL = URL.createObjectURL(blob);
//       window.open(fileURL, "_blank");
//       setTimeout(() => {
//         URL.revokeObjectURL(fileURL);
//       }, 10);
//       setIsBestLoading(false);
//     } catch (err) {
//       console.log(err);
//       setIsBestLoading(false);
//     }
//   };

//   const handleDownloadShipToAddress = async (id: string) => {
//     setIsBestLoading(true);
//     try {
//       const token = Cookies?.get("token");
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_URL}/order/${id}/ship-to-address-pdf`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch PDF");
//       }

//       const data = await response.arrayBuffer();
//       const blob = new Blob([data], { type: "application/pdf" });
//       const fileURL = URL.createObjectURL(blob);
//       window.open(fileURL, "_blank");
//       setTimeout(() => {
//         URL.revokeObjectURL(fileURL);
//       }, 10);
//       setIsBestLoading(false);
//     } catch (err) {
//       console.log(err);
//       setIsBestLoading(false);
//     }
//   };

//   const handleAddShippingCharge = async () => {
//     if (
//       !shippingChargeInput ||
//       isNaN(Number(shippingChargeInput)) ||
//       Number(shippingChargeInput) < 0
//     ) {
//       alert("Please enter a valid shipping charge amount.");
//       return;
//     }

//     try {
//       await updateOrder({
//         id,
//         shippingCharge: Number(shippingChargeInput),
//       }).unwrap();
//       alert("Shipping charge updated successfully!");
//       await refetchOrder();
//       setIsShippingModalOpen(false);
//       setShippingChargeInput("");
//     } catch (err: any) {
//       const errorMessage =
//         err?.data?.message || err?.error || "Failed to update shipping charge";
//       alert(`Error: ${errorMessage}`);
//       console.error("Update shipping charge error:", err);
//     }
//   };

//   const handleAddProduct = async () => {
//     if (!selectedProduct || !quantity || isNaN(Number(quantity)) || Number(quantity) <= 0 || isNaN(Number(discount)) || Number(discount) < 0) {
//       alert("Please select a product, enter a valid quantity (> 0), and a valid discount (>= 0).");
//       return;
//     }

//     const newProduct = {
//       productId: selectedProduct._id,
//       quantity: Number(quantity),
//       discount: Number(discount),
//     };

//     try {
//       const updatedProducts = [...(orderData?.data?.products || []), newProduct];
//       await updateOrder({
//         id,
//         products: updatedProducts,
//       }).unwrap();
//       alert("Product added successfully!");
//       await refetchOrder();
//       setIsAddProductModalOpen(false);
//       setSelectedProduct(null);
//       setQuantity("");
//       setDiscount("");
//       setProductSearch("");
//     } catch (err: any) {
//       const errorMessage = err?.data?.message || err?.error || "Failed to add product";
//       alert(`Error: ${errorMessage}`);
//       console.error("Add product error:", err);
//     }
//   };

//   // Filter products based on search query in the main table
//   const filteredProducts =
//     orderData?.data?.products?.filter((item: any) =>
//       item?.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
//     ) || [];


//   console.log("FP_________",filteredProducts)

//   // Filter available products based on search in the modal
//   const filteredAvailableProducts = productsData?.data?.filter((product: any) =>
//     product.name.toLowerCase().includes(productSearch.toLowerCase())
//   ) || [];

//   // Handle product selection from dropdown and close it
//   const handleProductSelect = (product: any) => {
//     setSelectedProduct(product);
//     setProductSearch(product.name); // Keep the selected product name in the search bar
//     // Use setTimeout to ensure the state update triggers a re-render before closing
//     setTimeout(() => setIsDropdownOpen(false), 0);
//   };

//   // Open dropdown when typing in productSearch
//   useEffect(() => {
//     if (productSearch && !selectedProduct) {
//       setIsDropdownOpen(true);
//     } else if (!productSearch) {
//       setIsDropdownOpen(false);
//     }
//   }, [productSearch, selectedProduct]);

//   if (orderLoading || productsLoading) {
//     return (
//       <div className="p-6 text-center text-gray-700">
//         Loading order details...
//       </div>
//     );
//   }

//   if (orderError || productsError) {
//     return (
//       <div className="p-6 text-center text-red-600">
//         Error loading data. Please try again.
//       </div>
//     );
//   }

//   return (
//     <div>
//       {isBestLoading && <Loading />}
//       <div className="p-6 bg-white">
//         {/* Header with Order Summary */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900 mb-4">
//             Order Details
//           </h1>

//           {/* Order Summary Section */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Invoice Number</span>
//               <span className="font-semibold text-orange-600">
//                 {orderData?.data?.invoiceNumber || "N/A"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Store Name</span>
//               <span className="font-semibold text-orange-600">
//                 {orderData?.data?.storeId?.storeName || "N/A"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">PO Number</span>
//               <span className="font-medium">{orderData?.data?.PONumber || "N/A"}</span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Order Date</span>
//               <span className="font-medium">{orderData?.data?.date || "N/A"}</span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Due Date</span>
//               <span className="font-medium">
//                 {orderData?.data?.paymentDueDate || "N/A"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Shipping Date</span>
//               <span className="font-medium">
//                 {orderData?.data?.shippingDate || "N/A"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Order Amount</span>
//               <span className="font-medium">
//                 ${orderData?.data?.orderAmount?.toFixed(2) || "N/A"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Shipping Charge</span>
//               <span className="font-medium">
//                 ${orderData?.data?.shippingCharge?.toFixed(2) || "N/A"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Discount Given</span>
//               <span className="font-medium">
//                 ${orderData?.data?.discountGiven?.toFixed(2) || "N/A"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Total Payable</span>
//               <span className="font-bold">
//                 ${orderData?.data?.totalPayable?.toFixed(2) || "N/A"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Open Balance</span>
//               <span className="font-medium">
//                 ${orderData?.data?.openBalance?.toFixed(2) || "N/A"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Profit Amount</span>
//               <span className="font-medium">
//                 ${orderData?.data?.profitAmount?.toFixed(2) || "N/A"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Profit Percentage</span>
//               <span className="font-medium">
//                 {orderData?.data?.profitPercentage?.toFixed(2) || "N/A"}%
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Payment Received</span>
//               <span className="font-medium">
//                 ${orderData?.data?.paymentAmountReceived?.toFixed(2) || "N/A"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Order Status</span>
//               <Badge
//                 variant={
//                   orderData?.data?.orderStatus === "completed"
//                     ? "secondary"
//                     : orderData?.data?.orderStatus === "cancelled"
//                     ? "destructive"
//                     : "default"
//                 }
//                 className={
//                   orderData?.data?.orderStatus === "completed"
//                     ? "bg-green-100 text-green-800"
//                     : ""
//                 }
//               >
//                 {orderData?.data?.orderStatus || "N/A"}
//               </Badge>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-600">Payment Status</span>
//               <Badge
//                 variant={
//                   orderData?.data?.paymentStatus === "paid"
//                     ? "secondary"
//                     : orderData?.data?.paymentStatus === "notPaid"
//                     ? "destructive"
//                     : "default"
//                 }
//                 className={
//                   orderData?.data?.paymentStatus === "paid"
//                     ? "bg-green-100 text-green-800"
//                     : ""
//                 }
//               >
//                 {orderData?.data?.paymentStatus || "N/A"}
//               </Badge>
//             </div>
//           </div>

//           {/* Filter Section */}
//           <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
//             <h2 className="font-medium">{orderData?.data?.PONumber || "N/A"}</h2>
//             <div className="flex items-center gap-2 ml-auto">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <Input
//                   placeholder="Search product in this order..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10 w-68"
//                 />
//               </div>
//               <Button
//                 onClick={() => setIsAddProductModalOpen(true)}
//                 className="bg-gray-200 text-black border-gray-300 border hover:bg-white"
//               >
//                 + Add Additional Product
//               </Button>
//               <Button
//                 className="bg-gray-200 text-black border-gray-300 border hover:bg-white"
//                 onClick={() => setIsShippingModalOpen(true)}
//               >
//                 🚚 Add Shipping Charge
//               </Button>
//               <Link
//                 href={`/dashboard/order-management/${orderData?.data?._id}/${orderData?.data?.storeId?._id}`}
//               >
//                 <Button size="sm" className="bg-green-600 hover:bg-green-700">
//                   <DollarSign className="h-4 w-4" />
//                 </Button>
//               </Link>
//               <DropdownMenu>
//                 <DropdownMenuTrigger>
//                   <ImFilePdf className="w-5 h-5 text-black" />
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem
//                     onClick={() => handleDownloadInvoice(orderData?.data?._id)}
//                   >
//                     Invoice
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     onClick={() => handleDownloadDeliverySlip(orderData?.data?._id)}
//                   >
//                     Delivery Slip
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     onClick={() => handleDownloadShipToAddress(orderData?.data?._id)}
//                   >
//                     Ship to Address
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>

//           {/* Shipping Charge Modal */}
//           {isShippingModalOpen && (
//             <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   Add Shipping Charge
//                 </h3>
//                 <div className="mb-4">
//                   <label
//                     htmlFor="shippingCharge"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Shipping Charge ($)
//                   </label>
//                   <Input
//                     id="shippingCharge"
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={shippingChargeInput}
//                     onChange={(e) => setShippingChargeInput(e.target.value)}
//                     placeholder="Enter shipping charge"
//                     className="w-full"
//                   />
//                 </div>
//                 <div className="flex gap-3 justify-end">
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setIsShippingModalOpen(false);
//                       setShippingChargeInput("");
//                     }}
//                     disabled={isUpdating}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleAddShippingCharge}
//                     disabled={isUpdating || !shippingChargeInput}
//                     className="bg-green-600 hover:bg-green-700"
//                   >
//                     {isUpdating ? "Adding..." : "Add"}
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Add Product Modal */}
//           {isAddProductModalOpen && (
//             <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   Add Additional Product
//                 </h3>
//                 <div className="mb-4 relative">
//                   <label
//                     htmlFor="productSearch"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Search Product
//                   </label>
//                   <Input
//                     id="productSearch"
//                     type="text"
//                     value={productSearch}
//                     onChange={(e) => {
//                       setProductSearch(e.target.value);
//                       setIsDropdownOpen(true); // Open dropdown on input change
//                     }}
//                     placeholder="Search by product name..."
//                     className="w-full mb-2"
//                   />
//                   {isDropdownOpen && productSearch && filteredAvailableProducts.length > 0 && (
//                     <div className="absolute z-10 w-full max-h-40 overflow-y-auto bg-white border rounded-md shadow-lg mt-1">
//                       {filteredAvailableProducts.map((product: any) => (
//                         <div
//                           key={product._id}
//                           onClick={() => handleProductSelect(product)}
//                           className="p-2 hover:bg-gray-100 cursor-pointer"
//                         >
//                           {product.name} (Item: {product.itemNumber}, Price: ${product.salesPrice})
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                   {isDropdownOpen && productSearch && filteredAvailableProducts.length === 0 && (
//                     <div className="p-2 text-gray-500">No products found</div>
//                   )}
//                 </div>
//                 <div className="mb-4">
//                   <label
//                     htmlFor="quantity"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Quantity
//                   </label>
//                   <Input
//                     id="quantity"
//                     type="number"
//                     min="1"
//                     value={quantity}
//                     onChange={(e) => setQuantity(e.target.value)}
//                     placeholder="Enter quantity"
//                     className="w-full"
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <label
//                     htmlFor="discount"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Discount ($)
//                   </label>
//                   <Input
//                     id="discount"
//                     type="number"
//                     defaultValue="0"
//                     step="0.01"
//                     value={discount}
//                     onChange={(e) => setDiscount(e.target.value)}
//                     placeholder="Enter discount"
//                     className="w-full"
//                   />
//                 </div>
//                 <div className="flex gap-3 justify-end">
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setIsAddProductModalOpen(false);
//                       setSelectedProduct(null);
//                       setQuantity("");
//                       setDiscount("");
//                       setProductSearch("");
//                     }}
//                     disabled={isUpdating}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleAddProduct}
//                     disabled={isUpdating || !selectedProduct || !quantity || !discount}
//                     className="bg-green-600 hover:bg-green-700"
//                   >
//                     {isUpdating ? "Adding..." : "Add"}
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Data Table */}
//         <div className="border rounded-lg">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-gray-50">
//                 <TableHead className="font-semibold">Product Name</TableHead>
//                 <TableHead className="font-semibold">Item Number</TableHead>
//                 <TableHead className="font-semibold">Category Name</TableHead>
//                 <TableHead className="font-semibold">Quantity</TableHead>
//                 <TableHead className="font-semibold">Pur. Price</TableHead>
//                 <TableHead className="font-semibold">Discount</TableHead>
//                 <TableHead className="font-semibold">Sales Price</TableHead>
//                 <TableHead className="font-semibold">Profit</TableHead>
//                 <TableHead className="font-semibold">Profit %</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredProducts.map((item: any, index: number) => (

//                 <TableRow key={index} className="hover:bg-gray-50">
//                   <TableCell className="font-medium">
//                     {item?.productId?.name}
//                   </TableCell>
//                   <Link href="/dashboard/inventory">
//                   <TableCell className="text-blue-600 cursor-pointer">
                    
//                     {item?.productId?.itemNumber}
//                   </TableCell>
//                   </Link>
//                   <TableCell>{item?.productId?.categoryId?.name}</TableCell>
//                   <TableCell>{item?.quantity}</TableCell>
//                   <TableCell>
//                     ${item?.productId?.purchasePrice?.toFixed(2) || "N/A"}
//                   </TableCell>
//                   <TableCell>${item?.discount?.toFixed(2) || "0.00"}</TableCell>
//                   <TableCell>
//                     ${item?.productId?.salesPrice?.toFixed(2) || "N/A"}
//                   </TableCell>
//                   <TableCell>
//                     $
//                     {(
//                       (item?.productId?.salesPrice*item.quantity - item?.productId?.purchasePrice*item.quantity)
//                     )?.toFixed(2) || "N/A"}
//                   </TableCell>
//                   <TableCell>
//                     {(
//                       (item?.productId?.salesPrice*item.quantity - item?.productId?.purchasePrice*item.quantity)/(item?.productId?.purchasePrice*item?.quantity)*100
//                     )?.toFixed(2) || "N/A"}%
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderDetails;