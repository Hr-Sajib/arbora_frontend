
"use client";
import AddOrderPage from "@/components/AddOrderForm";
import { OrderFilterForm } from "@/components/OrderFilterForm";
import { ReusableModal } from "@/components/ReusableModal";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UpdateOrderPage from "@/components/UpdateOrderForm";
import {
  useDeleteOrderMutation,
  useGetOrdersQuery,
} from "@/redux/api/order/orderManagementApi";
import { FilterFormValues } from "@/types";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { ImFilePdf } from "react-icons/im";
import Loading from "@/components/Loding/Loding";

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
    creditApplication: string;
    ownerLegalFrontImage: string;
    ownerLegalBackImage: string;
    voidedCheckImage: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  shippingCharge?: string;
  paymentDueDate: string;
  totalPayable: number;
  orderAmount: number;
  orderStatus: string;
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

import { useSearchParams } from "next/navigation";

export default function OrderManagement(): React.ReactElement {
  const {
    data: { data: orders = [] } = {},
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetOrdersQuery(undefined);



  const [isBestLoading, setIsBestLoading] = useState(false);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const action = searchParams.get("action");

  // Add effect to handle automatic modal opening
  useEffect(() => {
    if (action === "update" && orderId && orders.length > 0) {
      const order = orders.find((o: Order) => o._id === orderId);
      if (order) {
        setSelectedOrder(order);
        setUpdateOrderOpen(true);
      }
    }
  }, [action, orderId, orders]);


  const handleDownload = async () => {
    setIsBestLoading(true);
    const token = Cookies?.get("token");
    console.log(token);
    if (!token) {
      console.error("Authentication token not found. Please log in.");
      return; // Stop execution if no token
    }
    try {
      // Fetch the PDF as a binary response (arrayBuffer)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/order/allOrdersPdf`,
        {
          headers: {
            Authorization: `${token}`, // Add the Bearer token
            "Content-Type": "application/json", // Good practice, though PDF download might not strictly need it
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      // Read the binary data as an ArrayBuffer
      const data = await response.arrayBuffer();

      // Create a Blob from the ArrayBuffer (this represents a PDF)
      const blob = new Blob([data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(blob);

      window.open(fileURL, "_blank");
      // Create a temporary link to trigger the download
      // const link = document.createElement("a");
      // link.href = URL.createObjectURL(blob);
      // link.download = "order_delivery-slip";

      // Clean up the URL object
      // URL.revokeObjectURL(link.href);
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 10);

      setIsBestLoading(false);
    } catch (err) {
      console.log(err);
      setIsBestLoading(false);
    }
  };

  // States
  const [isVisible, setIsVisible] = useState(true);
  const [addOrderOpen, setAddOrderOpen] = useState(false);
  const [updateOrderOpen, setUpdateOrderOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter and Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterFormValues | null>(
    null
  );
  const [showActiveFilters, setShowActiveFilters] = useState(false);

  // Delete mutation
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  // Filtered and searched orders using useMemo for performance
  const filteredOrders = useMemo(() => {
    let result = orders || [];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (order: Order) =>
          order?.invoiceNumber?.toLowerCase().includes(searchLower) ||
          order?.PONumber?.toLowerCase().includes(searchLower) ||
          order?.storeId?.storeName?.toLowerCase().includes(searchLower) ||
          order?.storeId?.storePersonName
            ?.toLowerCase()
            .includes(searchLower) ||
          order?.storeId?.storePhone?.includes(searchTerm) ||
          order?.storeId?.storePersonEmail
            ?.toLowerCase()
            .includes(searchLower) ||
          order?.orderStatus?.toLowerCase().includes(searchLower) ||
          order?.paymentStatus?.toLowerCase().includes(searchLower)
      );
    }

    // Apply advanced filters
    if (activeFilters) {
      result = result.filter((order: Order) => {
        // Date range filter
        if (activeFilters.startDate || activeFilters.endDate) {
          const orderDate = new Date(order.date);
          if (
            activeFilters.startDate &&
            orderDate < new Date(activeFilters.startDate)
          ) {
            return false;
          }
          if (
            activeFilters.endDate &&
            orderDate > new Date(activeFilters.endDate)
          ) {
            return false;
          }
        }

        // Payment due date filter
        if (
          activeFilters.paymentDueStartDate ||
          activeFilters.paymentDueEndDate
        ) {
          if (order.paymentDueDate) {
            const dueDate = new Date(order.paymentDueDate);
            if (
              activeFilters.paymentDueStartDate &&
              dueDate < new Date(activeFilters.paymentDueStartDate)
            ) {
              return false;
            }
            if (
              activeFilters.paymentDueEndDate &&
              dueDate > new Date(activeFilters.paymentDueEndDate)
            ) {
              return false;
            }
          }
        }

        // Order status filter
        if (activeFilters.orderStatus && activeFilters.orderStatus.length > 0) {
          if (!activeFilters.orderStatus.includes(order.orderStatus)) {
            return false;
          }
        }

        // Payment status filter
        if (
          activeFilters.paymentStatus &&
          activeFilters.paymentStatus.length > 0
        ) {
          if (!activeFilters.paymentStatus.includes(order.paymentStatus)) {
            return false;
          }
        }

        // Store/Customer filter
        if (activeFilters.storeIds && activeFilters.storeIds.length > 0) {
          if (!activeFilters.storeIds.includes(order.storeId?._id)) {
            return false;
          }
        }

        // Order amount range filter
        if (
          activeFilters.minOrderAmount !== undefined ||
          activeFilters.maxOrderAmount !== undefined
        ) {
          if (
            activeFilters.minOrderAmount !== undefined &&
            order.orderAmount < activeFilters.minOrderAmount
          ) {
            return false;
          }
          if (
            activeFilters.maxOrderAmount !== undefined &&
            order.orderAmount > activeFilters.maxOrderAmount
          ) {
            return false;
          }
        }

        // Open balance filter
        if (activeFilters.hasOpenBalance !== undefined) {
          if (activeFilters.hasOpenBalance && order.openBalance <= 0) {
            return false;
          }
          if (!activeFilters.hasOpenBalance && order.openBalance > 0) {
            return false;
          }
        }

        return true;
      });
    }

    return result;
  }, [orders, searchTerm, activeFilters]);

  // Calculate filtered statistics for cards
  const filteredStats = useMemo(() => {
    const totalOrderAmount = filteredOrders.reduce(
      (sum: Number, order: any) => sum + order.orderAmount,
      0
    );
    const totalOpenAmount = filteredOrders.reduce(
      (sum: any, order: any) => sum + Math.max(0, order.openBalance),
      0
    );
    const totalOrders = filteredOrders.length;

    return {
      totalOrderAmount,
      totalOpenAmount,
      totalOrders,
    };
  }, [filteredOrders]);

  // Delete handler functions
  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      await deleteOrder(orderToDelete._id).unwrap();
      alert(
        `Order #${orderToDelete.invoiceNumber} has been deleted successfully!`
      );
      setDeleteConfirmOpen(false);
      setOrderToDelete(null);
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.error || "Failed to delete order";
      alert(`Error deleting order: ${errorMessage}`);
      console.error("Delete order error:", err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setOrderToDelete(null);
  };

  // Filter handler functions
  const handleFilterSubmit = (values: FilterFormValues) => {
    setActiveFilters(values);
    setFilterOpen(false);
    setShowActiveFilters(true);
  };

  const handleFilterClear = () => {
    setActiveFilters(null);
    setShowActiveFilters(false);
    setSearchTerm("");
  };

  const handleRemoveFilter = () => {
    setActiveFilters(null);
    setShowActiveFilters(false);
  };

  // Search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Dynamic card data based on filtered results
  const cardData = [
    {
      title: "Total Open Order Amount",
      value: filteredStats.totalOpenAmount,
      currency: "USD",
      date: "21-07-2025",
      growth: 10.4,
      bg: "#114F5E",
    },
    {
      title: "Total Order Amount",
      value: filteredStats.totalOrderAmount,
      currency: "USD",
      date: "21-07-2025",
      growth: 10.4,
      bg: "#219EBC",
    },
    {
      title: "Orders",
      value: filteredStats.totalOrders,
      date: "21-07-2025",
      growth: 5.4,
      bg: "#1F6F97",
    },
  ];

  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }

  if (isError) {
    console.log(error);
    return <div>Error loading orders</div>;
  }

  return (
    <div>
      {/* Section 1: Orders Overview */}
      {isVisible && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cardData.map((card, idx) => (
            <div
              style={{ backgroundColor: card.bg }}
              key={idx}
              className="text-white p-4 rounded-lg"
            >
              <h3 className="text-base md:text-lg">{card.title}</h3>
              <p className="text-3xl md:text-4xl font-bold my-2.5">
                {typeof card.value === "number" && card.currency
                  ? `$${card.value.toLocaleString()}`
                  : card.value.toLocaleString()}
              </p>
              <p className="text-sm flex items-center gap-2">
                {filteredOrders.length !== orders?.length && (
                  <span className="text-yellow-300">Filtered • </span>
                )}
                till {card.date}{" "}
                <span className="text-green-400 flex items-center gap-2">
                  <svg
                    width="19"
                    height="18"
                    viewBox="0 0 19 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.92334 0C2.47562 0 2.92334 0.447715 2.92334 1V16H17.9233C18.4756 16 18.9233 16.4477 18.9233 17C18.9233 17.5523 18.4756 18 17.9233 18H1.92334C1.37106 18 0.92334 17.5523 0.92334 17V1C0.92334 0.447715 1.37106 0 1.92334 0Z"
                      fill="#21C45D"
                    />
                    <path
                      d="M17.7554 5.55468C18.0617 5.09516 17.9376 4.47429 17.478 4.16793C17.0185 3.86158 16.3976 3.98576 16.0913 4.44528L12.6776 9.56573L9.52332 7.19998C9.06406 6.85553 8.40972 6.96762 8.09127 7.44528L4.09127 13.4453C3.78492 13.9048 3.9091 14.5257 4.36862 14.832C4.82815 15.1384 5.44902 15.0142 5.75537 14.5547L9.169 9.43424L12.3233 11.8C12.7826 12.1444 13.4369 12.0324 13.7554 11.5547L17.7554 5.55468Z"
                      fill="#21C45D"
                    />
                  </svg>
                  {card.growth}%
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
      {isBestLoading && <Loading />}
      {/* Active Filters Display */}
      {showActiveFilters && activeFilters && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800">
                Active Filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeFilters.startDate && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    From:{" "}
                    {new Date(activeFilters.startDate).toLocaleDateString()}
                  </span>
                )}
                {activeFilters.endDate && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    To: {new Date(activeFilters.endDate).toLocaleDateString()}
                  </span>
                )}
                {Array.isArray(activeFilters.orderStatus) &&
                  activeFilters.orderStatus.length > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      Status: {activeFilters.orderStatus.join(", ")}
                    </span>
                  )}
                {Array.isArray(activeFilters.paymentStatus) &&
                  activeFilters.paymentStatus.length > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      Payment: {activeFilters.paymentStatus.join(", ")}
                    </span>
                  )}
                {(typeof activeFilters.minOrderAmount === "number" ||
                  typeof activeFilters.maxOrderAmount === "number") && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    Amount: ${activeFilters.minOrderAmount ?? 0} - $
                    {activeFilters.maxOrderAmount ?? "∞"}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveFilter}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
      {/* Section 2: Search & Filter options */}
      <div className="flex items-center justify-between space-x-4 mt-6 mb-10">
        <div className="relative max-w-xs">
          <Input
            type="text"
            placeholder="Search by store name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pr-8"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsVisible(!isVisible)}
            className="bg-[#21C45D]"
          >
            Hide Boards
          </Button>
          <ReusableModal
            open={filterOpen}
            onOpenChange={setFilterOpen}
            trigger={
              <Button
                className={`${
                  activeFilters
                    ? "bg-[#FF7012] hover:bg-[#FF7012]/90"
                    : "bg-[#FF9012]"
                } relative`}
              >
                Filter
                {activeFilters && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white text-[#FF7012] rounded-full text-xs font-bold">
                    •
                  </span>
                )}
              </Button>
            }
            title="Order Filters"
          >
            <OrderFilterForm
              onSubmit={handleFilterSubmit}
              onClear={handleFilterClear}
              initialValues={activeFilters}
            />
          </ReusableModal>
          <ReusableModal
            open={addOrderOpen}
            onOpenChange={setAddOrderOpen}
            trigger={<Button className="bg-[#EF4343]">+ Add Order</Button>}
            title="Add New Order"
          >
            <AddOrderPage
              setAddOrderOpen={setAddOrderOpen}
              onAddSuccess={() => setAddOrderOpen(false)}
            />
          </ReusableModal>
          <Button onClick={handleDownload} className="bg-[#D9D9D9]" size="icon">
            <ImFilePdf className="w-5 h-5 text-black" />
          </Button>
        </div>
      </div>
      {/* Results Summary */}
      {(searchTerm || activeFilters) && (
        <div className="mb-4 p-2 bg-gray-50 rounded border text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders?.length || 0} orders
          {searchTerm && ` matching "${searchTerm}"`}
          {activeFilters && " with applied filters"}
        </div>
      )}
      {/* Section 3: Order Table */}
      <div className="border w-[85vw] border-gray-200 rounded-lg">
        <Table className="overflow-x-auto overflow-y-auto max-h-[500px] block">
          <TableHeader className="sticky top-0 bg-gray-50 z-10">
            <TableRow>
              <TableHead className="min-w-[120px]">Order Date</TableHead>
              <TableHead className="min-w-[120px]">Invoice</TableHead>
              <TableHead className="min-w-[120px]">PO No.</TableHead>
              <TableHead className="min-w-[150px]">Store Name</TableHead>
              <TableHead className="min-w-[120px]">Payment Due</TableHead>
              <TableHead className="min-w-[120px]">Order Amount</TableHead>
              <TableHead className="min-w-[130px]">Shipping Charge</TableHead>
              <TableHead className="min-w-[130px] font-bold">Total Payable</TableHead>
              <TableHead className="min-w-[120px]">Order Status</TableHead>
              <TableHead className="min-w-[140px]">Payment Received</TableHead>
              <TableHead className="min-w-[100px]">Discount</TableHead>
              <TableHead className="min-w-[120px]">Open Balance</TableHead>
              <TableHead className="min-w-[100px]">Profit</TableHead>
              <TableHead className="min-w-[100px]">Profit %</TableHead>
              <TableHead className="min-w-[130px]">Payment Status</TableHead>
              <TableHead className="min-w-[150px] sticky right-0 bg-gray-50">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={32}
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm || activeFilters
                    ? "No orders found matching your criteria"
                    : "No orders available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order: Order, idx: number) => (
                <TableRow key={order._id || idx} className="hover:bg-gray-50">
                  <TableCell className="text-sm">
                    {new Date(order.date).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                   <TableCell className="text-sm font-medium">
                    {order.invoiceNumber || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm cursor-pointer text-blue-600 font-medium hover:underline">
                    <Link href={`/dashboard/order-management/${order._id}`}>
                      {order.PONumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {order.storeId?.storeName || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.paymentDueDate
                      ? new Date(order.paymentDueDate).toLocaleDateString(
                          "en-US",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    ${order.orderAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="px-2 py-1 rounded-full text-xs capitalize font-medium">
                      ${order.shippingCharge}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="px-2 py-1 rounded-full text-xs capitalize font-medium">
                      ${order.totalPayable}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs uppercase font-medium">
                      {order.orderStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    ${order.paymentAmountReceived.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm">
                    ${order.discountGiven.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    <span
                      className={
                        order.openBalance < 0
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      ${order.openBalance.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-green-600">
                    ${order.profitAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {order.profitPercentage.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs capitalize font-medium ${
                        order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm sticky right-0 bg-white">
                    <div className="flex items-center space-x-2">
                      {/* View Button */}
                      <Link href={`/dashboard/order-management/${order._id}`}>
                        <button className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M10.0002 4.66669C15.1085 4.66669 17.5258 8.09166 18.3768 9.69284C18.6477 10.2027 18.6477 10.7974 18.3768 11.3072C17.5258 12.9084 15.1085 16.3334 10.0002 16.3334C4.89188 16.3334 2.4746 12.9084 1.62363 11.3072C1.35267 10.7974 1.35267 10.2027 1.62363 9.69284C2.4746 8.09166 4.89188 4.66669 10.0002 4.66669Z"
                              fill="#667085"
                            />
                          </svg>
                        </button>
                      </Link>
                      {/* Update Button */}
                      <button
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"
                        onClick={() => {
                          setSelectedOrder(order);
                          setUpdateOrderOpen(true);
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 20 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M17.3047 7.3201C18.281 6.34379 18.281 4.76087 17.3047 3.78456L16.7155 3.19531C15.7391 2.219 14.1562 2.219 13.1799 3.19531L3.69097 12.6843C3.34624 13.029 3.10982 13.467 3.01082 13.9444L2.34111 17.1737C2.21932 17.7609 2.73906 18.2807 3.32629 18.1589L6.55565 17.4892C7.03302 17.3902 7.47103 17.1538 7.81577 16.809L17.3047 7.3201Z"
                            fill="#667085"
                          />
                        </svg>
                      </button>
                      {/* Delete Button */}
                      <ReusableModal
                        open={deleteConfirmOpen}
                        onOpenChange={setDeleteConfirmOpen}
                        trigger={
                          <button
                            className="cursor-pointer hover:bg-red-100 p-2 rounded-full transition-colors"
                            onClick={() => handleDeleteClick(order)}
                            disabled={isDeleting}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 16 17"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M6.33317 6.62502C6.79341 6.62502 7.1665 6.99812 7.1665 7.45835V12.4584C7.1665 12.9186 6.79341 13.2917 6.33317 13.2917C5.87293 13.2917 5.49984 12.9186 5.49984 12.4584V7.45835C5.49984 6.99812 5.87293 6.62502 6.33317 6.62502Z"
                                fill={isDeleting ? "#ccc" : "#ef4444"}
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12.9998 3.50002V2.66669C12.9998 1.28598 11.8806 0.166687 10.4998 0.166687H5.49984C4.11913 0.166687 2.99984 1.28598 2.99984 2.66669V3.50002H1.74984C1.2896 3.50002 0.916504 3.87312 0.916504 4.33335C0.916504 4.79359 1.2896 5.16669 1.74984 5.16669H2.1665V14.3334C2.1665 15.7141 3.28579 16.8334 4.6665 16.8334H11.3332C12.7139 16.8334 13.8332 15.7141 13.8332 14.3334V5.16669H14.2498C14.7101 5.16669 15.0832 4.79359 15.0832 4.33335C15.0832 3.87312 14.7101 3.50002 14.2498 3.50002H12.9998Z"
                                fill={isDeleting ? "#ccc" : "#ef4444"}
                              />
                            </svg>
                          </button>
                        }
                        title="Confirm Delete"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-red-600"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                            </div>
                          </div>
                          <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Delete Order
                            </h3>
                            <p className="text-gray-600">
                              Are you sure you want to delete order{" "}
                              <span className="font-semibold">
                                #{orderToDelete?.invoiceNumber}
                              </span>
                              ?
                              {orderToDelete?.storeId?.storeName && (
                                <>
                                  {" "}
                                  from{" "}
                                  <span className="font-semibold">
                                    {orderToDelete.storeId.storeName}
                                  </span>
                                </>
                              )}
                            </p>
                            <p className="text-sm text-red-600 mt-2">
                              This action cannot be undone.
                            </p>
                          </div>
                          <div className="flex gap-3 justify-center">
                            <Button
                              variant="outline"
                              onClick={handleDeleteCancel}
                              disabled={isDeleting}
                              className="min-w-[100px]"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleDeleteConfirm}
                              disabled={isDeleting}
                              className="bg-red-600 hover:bg-red-700 min-w-[100px]"
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </ReusableModal>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination or Load More */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing {filteredOrders.length} of {orders?.length || 0} orders
          {(searchTerm || activeFilters) && (
            <span className="text-blue-600 ml-1">(filtered)</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <span className="text-sm">Page 1 of 1</span>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
      {/* Update Order Modal */}
      {selectedOrder && (
        <ReusableModal
          open={updateOrderOpen}
          onOpenChange={setUpdateOrderOpen}
          title="Update Order"
          trigger={<span style={{ display: "none" }} />}
        >
          <UpdateOrderPage
            order={selectedOrder}
            onUpdateSuccess={() => {
              setUpdateOrderOpen(false);
              setSelectedOrder(null);
            }}
            onCancel={() => {
              setUpdateOrderOpen(false);
              setSelectedOrder(null);
            }}
          />
        </ReusableModal>
      )}
    </div>
  );
}