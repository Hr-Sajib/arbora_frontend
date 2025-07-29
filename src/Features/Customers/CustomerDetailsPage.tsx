"use client";

import { useGetCustomerQuery, useSendEmailForNotPaidOrdersMutation } from "@/redux/api/customers/customersApi";
import { useParams } from "next/navigation";
import Loading from "@/redux/Shared/Loading"; // Adjust path as needed
import Link from "next/link";
import { toast } from "react-toastify";
import { useState } from "react";
import { format } from "date-fns";

const CustomerDetailsPage: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useGetCustomerQuery(id);

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [sendEmail] = useSendEmailForNotPaidOrdersMutation();

  if (isLoading) {
    return <Loading title="Loading Customer Details..." message="Customer details fetched successfully" />;
  }

  if (isError || !data?.data) {
    return <div className="p-4 text-red-500 text-center">Error loading customer details or customer not found</div>;
  }

  const customer = data.data;
  console.log("customer", customer);

  const handleSendEmail = async () => {
    setIsSending(true);
    setSendError(null);
    setIsSuccess(false);

    try {
      const response = await sendEmail(id).unwrap();
      if (response.success) {
        toast.success("Email sent successfully!");
        setIsSuccess(true);
      } else {
        throw new Error(response.message || "Failed to send email");
      }
    } catch (error: any) {
      console.error("Error sending email:", error);
      const errorMessage = error?.data?.message || "Failed to send email. Please try again.";
      toast.error(errorMessage);
      setSendError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2">
          Customer Details - <span className="text-green-700">{customer.storeName}</span>
        </h1>

        {/* Main Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mb-8">
          {/* Basic Info */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Basic Info</h2>
            <div className="space-y-2">
              <p className="text-gray-600"><span className="font-medium text-gray-800">Name:</span> {customer.storePersonName}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Phone:</span> {customer.storePersonPhone}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Email:</span> {customer.storePersonEmail}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Store Phone:</span> {customer.storePhone}</p>
            </div>
          </div>

          {/* Billing Info */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Billing Info</h2>
            <div className="space-y-2">
              <p className="text-gray-600"><span className="font-medium text-gray-800">Address:</span> {customer.billingAddress || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">City:</span> {customer.billingCity || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">State:</span> {customer.billingState || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Zipcode:</span> {customer.billingZipcode || "N/A"}</p>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Shipping Info</h2>
            <div className="space-y-2">
              <p className="text-gray-600"><span className="font-medium text-gray-800">Address:</span> {customer.shippingAddress || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">City:</span> {customer.shippingCity || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">State:</span> {customer.shippingState || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Zipcode:</span> {customer.shippingZipcode || "N/A"}</p>
            </div>
          </div>

          {/* Financial Info */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Financial Info</h2>
            <div className="space-y-2">
              <p className="text-gray-600"><span className="font-medium text-gray-800">Open Balance:</span> ${customer.openBalance?.toFixed(2) || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Total Orders:</span> {customer.totalOrders || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Total Amount:</span> ${customer.totalOrderAmount?.toFixed(2) || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Tax ID:</span> {customer.salesTaxId}</p>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Documents</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium text-gray-800">Credit App:</span>
                {typeof customer?.creditApplication === "string" && customer.creditApplication.length > 5 ? (
                  <a href={customer.creditApplication} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-1">
                    View
                  </a>
                ) : (
                  <span className="text-gray-500 ml-1">Not Set</span>
                )}
              </p>
              <p className="text-gray-600">
                <span className="font-medium text-gray-800">Legal Front:</span>
                {typeof customer?.ownerLegalFrontImage === "string" && customer.ownerLegalFrontImage.length > 5 ? (
                  <a href={customer.ownerLegalFrontImage} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-1">
                    View
                  </a>
                ) : (
                  <span className="text-gray-500 ml-1">Not Set</span>
                )}
              </p>
              <p className="text-gray-600">
                <span className="font-medium text-gray-800">Legal Back:</span>
                {typeof customer?.ownerLegalBackImage === "string" && customer.ownerLegalBackImage.length > 5 ? (
                  <a href={customer.ownerLegalBackImage} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-1">
                    View
                  </a>
                ) : (
                  <span className="text-gray-500 ml-1">Not Set</span>
                )}
              </p>
              <p className="text-gray-600">
                <span className="font-medium text-gray-800">Voided Check:</span>
                {typeof customer?.voidedCheckImage === "string" && customer.voidedCheckImage.length > 5 ? (
                  <a href={customer.voidedCheckImage} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-1">
                    View
                  </a>
                ) : (
                  <span className="text-gray-500 ml-1">Not Set</span>
                )}
              </p>
            </div>
          </div>

          {/* Delivery & Bank Info */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Additional Info</h2>
            <div className="space-y-2">
              <p className="text-gray-600"><span className="font-medium text-gray-800">Delivery Days:</span> {customer.acceptedDeliveryDays.join(", ") || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Bank Info:</span> {customer.bankACHAccountInfo || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">Note :</span> {customer.note || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Emailing Section */}
        <div>
          {customer.openBalance ? (
            <div className="flex items-center justify-between border p-3 rounded-2xl bg-white border-red-200 gap-5">
              <p className="text-xl font-bold">
                This customer has <span className="text-xl text-red-700 font-bold">{customer.openBalance}</span> open balance remaining
              </p>
              <button
                onClick={handleSendEmail}
                className="bg-green-700 px-3 py-1 text-lg font-bold text-white rounded-md hover:bg-green-700 transition duration-300"
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send Email?"}
              </button>
            </div>
          ) : null}
          {sendError && <p className="text-red-500 mt-2">{sendError}</p>}
          {isSuccess && <p className="text-green-600 mt-2">Email sent successfully!</p>}
        </div>

        {/* Orders Table */}
        <div className="bg-white p-4 rounded-lg shadow-md mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Order History</h2>
          {customer.customerOrders?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[800px]">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 whitespace-nowrap">PO #</th>
                    <th className="p-3 whitespace-nowrap">Date</th>
                    <th className="p-3 whitespace-nowrap">Due Date</th>
                    <th className="p-3 whitespace-nowrap">Order Amount</th>
                    <th className="p-3 whitespace-nowrap">Shipping</th>
                    <th className="p-3 whitespace-nowrap">Total Payable</th>
                    <th className="p-3 whitespace-nowrap">Paid</th>
                    <th className="p-3 whitespace-nowrap">Open Balance</th>
                    <th className="p-3 whitespace-nowrap">Profit</th>
                    <th className="p-3 whitespace-nowrap">Profit %</th>
                    <th className="p-3 whitespace-nowrap">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.customerOrders.map((order) => (
                    <tr key={order._id} className="border-t hover:bg-gray-50">
                      <td className="p-3 whitespace-nowrap text-gray-700">
                        <Link href={`/dashboard/order-management/${order._id}/${order?.storeId}`} className="text-blue-600 hover:underline">
                          {order.PONumber}
                        </Link>
                      </td>
                      <td className="p-3 whitespace-nowrap text-gray-700">{format(new Date(order.date), "yyyy-MM-dd")}</td>
                      <td className="p-3 whitespace-nowrap text-gray-700">{order.paymentDueDate ? format(new Date(order.paymentDueDate), "yyyy-MM-dd") : "N/A"}</td>
                      <td className="p-3 whitespace-nowrap text-gray-700">${order.orderAmount.toFixed(2)}</td>
                      <td className="p-3 whitespace-nowrap text-gray-700">${order.shippingCharge.toFixed(2)}</td>
                      <td className="p-3 whitespace-nowrap text-gray-700 font-semibold">${order?.totalPayable.toFixed(2)}</td>
                      <td className="p-3 whitespace-nowrap text-gray-700 ">${order.paymentAmountReceived.toFixed(2)}</td>
                      <td className="p-3 whitespace-nowrap text-gray-700">${order.openBalance.toFixed(2)}</td>
                      <td className="p-3 whitespace-nowrap text-gray-700">${order.profitAmount.toFixed(2)}</td>
                      <td className="p-3 whitespace-nowrap text-gray-700">{order.profitPercentage.toFixed(2)}%</td>
                      <td className="p-3 whitespace-nowrap text-gray-700">{order.paymentStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No orders available</p>
          )}
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 flex items-center gap-2 mx-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;