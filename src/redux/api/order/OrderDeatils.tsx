"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useGiteSingleOrderQuery, useUpdateOrderMutation } from "./orderManagementApi";
import { ImFilePdf } from "react-icons/im";
import Link from "next/link";
import Loading from "@/components/Loding/Loding";

const OrderDetails = ({ id }: { id: string }) => {
  const [isBestLoading, setIsBestLoading] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingChargeInput, setShippingChargeInput] = useState("");
  const { data, isError, isLoading, refetch } = useGiteSingleOrderQuery(id);
  console.log("order details data", data);
  const [searchQuery, setSearchQuery] = useState("");
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

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
    if (!shippingChargeInput || isNaN(Number(shippingChargeInput)) || Number(shippingChargeInput) < 0) {
      alert("Please enter a valid shipping charge amount.");
      return;
    }

    try {
      await updateOrder({
        id,
        shippingCharge: Number(shippingChargeInput),
      }).unwrap();
      alert("Shipping charge updated successfully!");
      await refetch(); // Refetch order details to update UI
      setIsShippingModalOpen(false);
      setShippingChargeInput("");
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.error || "Failed to update shipping charge";
      alert(`Error: ${errorMessage}`);
      console.error("Update shipping charge error:", err);
    }
  };

  // Filter products based on search query
  const filteredProducts = data?.data?.products?.filter((item: any) =>
    item?.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="p-6 text-center text-gray-700">Loading order details...</div>;
  }

  if (isError) {
    return <div className="p-6 text-center text-red-600">Error loading order details. Please try again.</div>;
  }

  return (
    <div>
      {isBestLoading && <Loading />}
      <div className="p-6 bg-white">
        {/* Header with Order Summary */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Details</h1>

          {/* Order Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Invoice Number</span>
              <span className="font-medium">{data?.data?.invoiceNumber || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">PO Number</span>
              <span className="font-medium">{data?.data?.PONumber || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Order Date</span>
              <span className="font-medium">{data?.data?.date || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Due Date</span>
              <span className="font-medium">{data?.data?.paymentDueDate || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Shipping Date</span>
              <span className="font-medium">{data?.data?.shippingDate || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Order Amount</span>
              <span className="font-medium">${data?.data?.orderAmount?.toFixed(2) || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Shipping Charge</span>
              <span className="font-medium">${data?.data?.shippingCharge?.toFixed(2) || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Discount Given</span>
              <span className="font-medium">${data?.data?.discountGiven?.toFixed(2) || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Open Balance</span>
              <span className="font-medium">${data?.data?.openBalance?.toFixed(2) || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Profit Amount</span>
              <span className="font-medium">${data?.data?.profitAmount?.toFixed(2) || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Profit Percentage</span>
              <span className="font-medium">{data?.data?.profitPercentage?.toFixed(2) || "N/A"}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Payment Received</span>
              <span className="font-medium">${data?.data?.paymentAmountReceived?.toFixed(2) || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Order Status</span>
              <Badge
                variant={data?.data?.orderStatus === "completed" ? "secondary" : data?.data?.orderStatus === "cancelled" ? "destructive" : "default"}
                className={data?.data?.orderStatus === "completed" ? "bg-green-100 text-green-800" : ""}
              >
                {data?.data?.orderStatus || "N/A"}
              </Badge>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Payment Status</span>
              <Badge
                variant={data?.data?.paymentStatus === "paid" ? "secondary" : data?.data?.paymentStatus === "notPaid" ? "destructive" : "default"}
                className={data?.data?.paymentStatus === "paid" ? "bg-green-100 text-green-800" : ""}
              >
                {data?.data?.paymentStatus || "N/A"}
              </Badge>
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="font-medium">{data?.data?.PONumber || "N/A"}</h2>
            <div className="flex items-center gap-2 ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                className="bg-gray-200 text-black border-gray-300 border hover:bg-white"
                onClick={() => setIsShippingModalOpen(true)}
              >
                🚚 Add Shipping Charge
              </Button>
              <Link href={`/dashboard/order-management/${data.data._id}/${data.data.storeId._id}`}>
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
                  <DropdownMenuItem onClick={() => handleDownloadInvoice(data.data._id)}>
                    Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadDeliverySlip(data.data._id)}>
                    Delivery Slip
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadShipToAddress(data.data._id)}>
                    Ship to Address
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Shipping Charge Modal */}
          {isShippingModalOpen && (
            <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Shipping Charge</h3>
                <div className="mb-4">
                  <label htmlFor="shippingCharge" className="block text-sm font-medium text-gray-700 mb-1">
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
        </div>

        {/* Data Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Product Name</TableHead>
                <TableHead className="font-semibold">Item Number</TableHead>
                <TableHead className="font-semibold">Batch Number</TableHead>
                <TableHead className="font-semibold">Category Name</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Discount</TableHead>
                <TableHead className="font-semibold">Net Price</TableHead>
                <TableHead className="font-semibold">Profit</TableHead>
                <TableHead className="font-semibold">Scan Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((item: any, index: number) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {item?.productId?.name}
                  </TableCell>
                  <TableCell className="text-blue-600 cursor-pointer">
                    {item?.productId?.itemNumber}
                  </TableCell>
                  <TableCell>{item?.productId?.barcodeString || "-"}</TableCell>
                  <TableCell>{item?.productId?.categoryId?.name}</TableCell>
                  <TableCell>{item?.quantity}</TableCell>
                  <TableCell>
                    ${item?.productId?.purchasePrice?.toFixed(2) || "N/A"}
                  </TableCell>
                  <TableCell>${item?.discount?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    ${item?.productId?.salesPrice?.toFixed(2) || "N/A"}
                  </TableCell>
                  <TableCell>${item?.productId?.competitorPrice?.toFixed(2) || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {item?.scanStatus || "pending"}
                    </Badge>
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