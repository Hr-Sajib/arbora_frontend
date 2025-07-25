"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useGiteSingleOrderQuery } from "@/redux/api/order/orderManagementApi";
// import { useGetOrderByIdQuery } from "@/redux/api/order/orderManagementApi";

// Enhanced interfaces based on your response (same as before)
interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProductDetails {
  _id: string;
  name: string;
  isDeleted: boolean;
  competitorPrice: number;
  packetSize: string;
  weight: number;
  weightUnit: string;
  categoryId: Category;
  incomingQuantity: number;
  reorderPointOfQuantity: number;
  salesPrice: number;
  purchasePrice: number;
  barcodeString: string;
  itemNumber: string;
  quantity: number;
  warehouseLocation: string;
  packageDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface OrderProduct {
  productId: ProductDetails;
  quantity: number;
  discount: number;
  _id: string;
}

interface Store {
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
}

interface OrderDetails {
  _id: string;
  date: string;
  invoiceNumber: string;
  PONumber: string;
  storeId: Store;
  paymentDueDate: string;
  orderAmount: number;
  orderStatus: string;
  isDeleted: boolean;
  paymentAmountReceived: number;
  discountGiven: number;
  openBalance: number;
  profitAmount: number;
  profitPercentage: number;
  paymentStatus: string;
  products: OrderProduct[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface OrderDetailsResponse {
  success: boolean;
  message: string;
  data: OrderDetails;
}

const OrderDetailsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const {
    data: response,
    isLoading,
    error,
  } = useGiteSingleOrderQuery(orderId, {
    skip: !orderId,
  });

  if (isLoading || !orderId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !response?.success) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading order details. Please try again.
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const order = response.data;

  const getStatusBadge = (status: string) => {
    const statusColors = {
      verified: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      shipped: "bg-blue-100 text-blue-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors = {
      paid: "bg-green-100 text-green-800",
      notPaid: "bg-red-100 text-red-800",
      partiallyPaid: "bg-yellow-100 text-yellow-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Orders
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-1">Order #{order.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <div
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                order.orderStatus
              )}`}
            >
              {order.orderStatus.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Order Information
            </h3>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Order Date</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(order.date)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">PO Number</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {order.PONumber}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Payment Due Date</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(order.paymentDueDate)}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Financial Summary
            </h3>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Order Amount</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatCurrency(order.orderAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Discount Given</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatCurrency(order.discountGiven)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Amount Received</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatCurrency(order.paymentAmountReceived)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Open Balance</dt>
                <dd className="text-sm font-medium text-red-600">
                  {formatCurrency(order.openBalance)}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Profit Analysis
            </h3>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Profit Amount</dt>
                <dd className="text-sm font-medium text-green-600">
                  {formatCurrency(order.profitAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Profit Percentage</dt>
                <dd className="text-sm font-medium text-green-600">
                  {order.profitPercentage.toFixed(2)}%
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Payment Status</dt>
                <dd
                  className={`text-sm font-medium px-2 py-1 rounded ${getPaymentStatusBadge(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Store Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Store Details
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Store Name</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {order.storeId.storeName}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Contact Person</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {order.storeId.storePersonName}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Phone</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {order.storeId.storePhone}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Email</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {order.storeId.storePersonEmail}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Addresses
            </h3>
            <div className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-700">
                  Billing Address
                </dt>
                <dd className="text-sm text-gray-600">
                  {order.storeId.billingAddress}
                  <br />
                  {order.storeId.billingCity}, {order.storeId.billingState}{" "}
                  {order.storeId.billingZipcode}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-700">
                  Shipping Address
                </dt>
                <dd className="text-sm text-gray-600">
                  {order.storeId.shippingAddress}
                  <br />
                  {order.storeId.shippingCity}, {order.storeId.shippingState}{" "}
                  {order.storeId.shippingZipcode}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.products.map((product:any) => {
                const subtotal =
                  product.quantity * product.productId.salesPrice;
                const discountAmount = subtotal * (product.discount / 100);
                const total = subtotal - discountAmount;

                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.productId.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{product.productId.itemNumber} |{" "}
                          {product.productId.barcodeString}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.productId.categoryId.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.productId.salesPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.discount}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Order Timeline
        </h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Order Created</p>
              <p className="text-sm text-gray-600">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Last Updated</p>
              <p className="text-sm text-gray-600">
                {formatDate(order.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push(`/orders/${orderId}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Order
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Print Order
          </button>
          <button
            onClick={() => router.push("/orders")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Orders List
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
