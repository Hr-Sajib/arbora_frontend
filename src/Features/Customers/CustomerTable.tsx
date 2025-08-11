



"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, PlusCircle, Eye, Edit, Trash2, CloudCog } from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useGetCustomersQuery, useDeleteCustomerMutation } from "@/redux/api/customers/customersApi";
import Loading from "@/redux/Shared/Loading"; // Adjust path as needed
import { toast } from "react-hot-toast"; // Assuming you use react-hot-toast for notifications

export default function CustomerTable() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null); // Replace with Customer type
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const itemsPerPage = 20; // Fixed to 20 items per page
  const { data: response, isLoading, error } = useGetCustomersQuery();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const router = useRouter();

  // Extract customers array from response.data, default to empty array
  const customers = response?.data || [];

  console.log("customer data ", response)

  // Filter customers based on search (storePersonName)
  const filteredData = customers.filter((customer) =>
    customer.storeName.toLowerCase().includes(search.toLowerCase()) || customer.storePersonName.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return <Loading title="Loading Customer data...." message="All Customer data fetched successfully" />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {JSON.stringify(error)}</div>;
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteCustomer(id).unwrap();
      toast.success("Customer deleted successfully");
      setDeleteId(null); // Close dialog
    } catch (err) {
      toast.error("Failed to delete customer");
      console.error("Delete error:", err);
    }
  };

  // Navigate to details page
  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/customer-details/${id}`);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search customer..."
          className="max-w-sm text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          
          <Button
            className="bg-red-600 text-white cursor-pointer hover:bg-red-700 gap-2"
            onClick={() => router.push("/dashboard/add-customer")}
          >
            <PlusCircle className="h-4 w-4" /> Add Customer
          </Button>
         
        </div>
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {[
                "Store Name",
                "Auth Person Name",
                "Store Phone Number",
                "Person Phone Number",
                "Store Email",
                "Open Balance",
                "No of Order",
                "Order Amount",
                "Customer Source",
                "Action",
              ].map((heading, i) => (
                <th key={i} className="p-2 whitespace-nowrap font-medium">
                  <div className="flex items-center gap-1">
                    {heading}
                    {heading !== "Action" && <ArrowUpDown className="w-3 h-3 text-gray-500" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row._id} className="border-t hover:bg-gray-50">
                <td className="p-2 whitespace-nowrap  cursor-pointer  text-blue-500 underline" onClick={() => handleViewDetails(row._id)}>
                  {row.storeName}
                </td>
                <td className="p-2 whitespace-nowrap text-gray-700">{row.storePersonName}</td>
                <td className="p-2 whitespace-nowrap text-gray-700">
                  {row.storePhone}
                </td>
                <td className="p-2 whitespace-nowrap text-gray-700">
                  {row.storePersonPhone}
                </td>
                <td className="p-2 whitespace-nowrap text-gray-700">{row.storePersonEmail}</td>
                <td className="p-2 whitespace-nowrap text-gray-700">{row.openBalance || 0}</td>
                <td className="p-2 whitespace-nowrap text-gray-700">{row.totalOrders || 0}</td>
                <td className="p-2 whitespace-nowrap text-gray-700">${row.totalOrderAmount || 0}</td>
                <td className="p-2 whitespace-nowrap text-gray-700">
                  {row.isCustomerSourceProspect === true ? "Convert" : "Direct"}
                </td>
                <td className="p-2 whitespace-nowrap flex gap-2">
                  <Eye
                    className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => setSelectedCustomer(row)}
                  />
                  <Edit
                    className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => router.push(`/dashboard/edit-customer/${row._id}`)}
                  />
                  <Trash2
                    className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => setDeleteId(row._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Confirm Delete
            </h3>
            <p className="mb-4 text-gray-600">Are you sure you want to delete this customer?</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => handleDeleteConfirm(deleteId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-700 mb-4">Customer Details</h2>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="mb-2"><span className="font-semibold text-gray-700">Store Name:</span> <span className="text-gray-600">{selectedCustomer.storeName}</span></p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Store Phone:</span> <span className="text-gray-600">{selectedCustomer.storePhone}</span></p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Auth Person Name:</span> <span className="text-gray-600">{selectedCustomer.storePersonName}</span></p>
                <p className="mb-2"><span className="font-semibold text-gray-700"> Person Phone Number:</span> <span className="text-gray-600">{selectedCustomer.storePersonPhone}</span></p>
              </div>
              <div>
                <p className="mb-2"><span className="font-semibold text-gray-700">Billing Address:</span> <span className="text-gray-600">{selectedCustomer.billingAddress || "N/A"}</span></p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Billing City:</span> <span className="text-gray-600">{selectedCustomer.billingCity || "N/A"}</span></p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Billing State:</span> <span className="text-gray-600">{selectedCustomer.billingState || "N/A"}</span></p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Billing Zipcode:</span> <span className="text-gray-600">{selectedCustomer.billingZipcode || "N/A"}</span></p>
              </div>
              <div>
                <p className="mb-2"><span className="font-semibold text-gray-700">Shipping Address:</span> <span className="text-gray-600">{selectedCustomer.shippingAddress || "N/A"}</span></p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Shipping City:</span> <span className="text-gray-600">{selectedCustomer.shippingCity || "N/A"}</span></p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Shipping State:</span> <span className="text-gray-600">{selectedCustomer.shippingState || "N/A"}</span></p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Shipping Zipcode:</span> <span className="text-gray-600">{selectedCustomer.shippingZipcode || "N/A"}</span></p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Note :</span> <span className="text-gray-600">{selectedCustomer.note || "N/A"}</span></p>
              </div>
              <div>
                <p className="mb-2"><span className="font-semibold text-gray-700">Credit Application:</span>
                  {selectedCustomer.creditApplication ? (
                    <a href={selectedCustomer.creditApplication} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
                      View PDF
                    </a>
                  ) : <span className="text-gray-600">N/A</span>}
                </p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Owner Legal Front:</span>
                  {selectedCustomer.ownerLegalFrontImage ? (
                    <a href={selectedCustomer.ownerLegalFrontImage} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
                      View Image
                    </a>
                  ) : <span className="text-gray-600">N/A</span>}
                </p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Owner Legal Back:</span>
                  {selectedCustomer.ownerLegalBackImage ? (
                    <a href={selectedCustomer.ownerLegalBackImage} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
                      View Image
                    </a>
                  ) : <span className="text-gray-600">N/A</span>}
                </p>
                <p className="mb-2"><span className="font-semibold text-gray-700">Voided Check:</span>
                  {selectedCustomer.voidedCheckImage ? (
                    <a href={selectedCustomer.voidedCheckImage} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
                      View Image
                    </a>
                  ) : <span className="text-gray-600">N/A</span>}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
        <p>
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
          {filteredData.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            className="px-2 py-1 border rounded bg-gray-100 text-gray-700"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            «
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-2 py-1 border rounded ${page === currentPage ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="px-2 py-1 border rounded bg-gray-100 text-gray-700"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            »
          </button>
          
        </div>
      </div>
    </div>
  );
}
