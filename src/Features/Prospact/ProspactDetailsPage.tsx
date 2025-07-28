"use client";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useConvertProspectMutation,
  useDeleteProspectMutation,
  useGetProspectsQuery,
  useSendEmailMutation,
  useUpdateProspectMutation,
} from "@/redux/api/auth/prospact/prospactApi";
import { useGetSalesUsersQuery } from "@/redux/api/auth/admin/adminApi";
import { Prospect } from "@/types";
import Loading from "@/redux/Shared/Loading";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/app/(dashboardLayout)/dashboard/page";
import Link from "next/link";

export default function ProspectDetails() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [modalContent, setModalContent] = useState<{ title: string; data: string } | null>(null);
  const [newSalespersonId, setNewSalespersonId] = useState("");

  const itemsPerPage = 10;
  const router = useRouter();

  const [convertProspect] = useConvertProspectMutation();
  const [sendEmail] = useSendEmailMutation();

  const {
    data: salesUsersResponse,
    isLoading: isSalesUsersLoading,
    error: salesUsersError,
  } = useGetSalesUsersQuery(undefined);

  const { data: prospectsResponse, error, isLoading, refetch } = useGetProspectsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [updateProspect, { isLoading: isUpdating }] = useUpdateProspectMutation();
  const [deleteProspect, { isLoading: isDeleting }] = useDeleteProspectMutation();
  const [isConverting, setIsConverting] = useState(false);
  if (isLoading) return <div className="min-h-screen p-4 text-center"><Loading /></div>;
  if (error) return <div className="min-h-screen p-4 text-center">Error loading prospects</div>;

  const prospects = prospectsResponse?.data || [];

  // Filter prospects based only on storeName (Client column)
  const filteredProspects = prospects.filter((prospect) =>
    prospect.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProspects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProspects = filteredProspects.slice(startIndex, endIndex);

  const actualCustomers = filteredProspects.filter((customer) => customer.status !== "converted");

  const handleConvertProspect = async (id: string) => {
    try {
      const convert = await convertProspect(id).unwrap();
      toast.success("Prospect converted successfully!");
      refetch();
    } catch (err) {
      toast.error("Failed to convert prospect");
      console.error("Convert error:", err);
    }
  };

  const openModal = (prospect: Prospect, title: string, data: string) => {
    setSelectedProspect(prospect);
    setModalContent({ title, data });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProspect(null);
    setModalContent(null);
  };

  const openUpdateModal = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setNewSalespersonId(prospect.assignedSalesPerson?._id || "");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateProspect = async () => {
    if (!selectedProspect || !selectedProspect._id || !newSalespersonId) {
      toast.error("Invalid prospect or salesperson ID.");
      return;
    }

    const payload = { _id: selectedProspect._id, assignedSalesPerson: newSalespersonId };

    try {
      await updateProspect(payload).unwrap();
      await refetch();
      closeUpdateModal();
      toast.success("Prospect Salesperson updated successfully!");
    } catch (err: any) {
      console.error("Failed to update prospect:", err);
      const errorMessage = err?.data?.message || err?.message || "Unknown error occurred.";
      toast.error(`Error updating prospect: ${errorMessage}`);
    }
  };

  const handleDeleteProspect = async (storeName: string, prospectId: string) => {
    if (!window.confirm(`Are you sure you want to delete prospect with Store Name: ${storeName}?`)) {
      return;
    }

    try {
      await deleteProspect(prospectId).unwrap();
      await refetch();
      toast.success("Prospect deleted successfully!");
    } catch (err: any) {
      console.error("Failed to delete prospect:", err);
      const errorMessage = err?.data?.message || err?.message || "Unknown error occurred.";
      toast.error(`Error deleting prospect: ${errorMessage}`);
    }
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedProspect(null);
    setNewSalespersonId("");
  };

  const handleUpdateRedirect = (prospectId: string) => {
    router.push(`/dashboard/update-prospact/${prospectId}`);
  };

  const handleClickSendEmail = async (id: string) => {
    try {
      const email = await sendEmail(id);
      console.log("send email", email);
      toast.success("Email successfully sent");
    } catch (error) {
      console.log(error);
    }
  };

  const pathname = usePathname();
  const role = Cookies.get("role")?.toLowerCase();
  const isAdmin = role === "admin";
  const token = Cookies.get("token");

  let isRole = "";
  console.log("is admin role check", role);

  let email = "admin@gmail.com";
  let username = "Daval";
  if (token) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      email = decodedToken.email;
      username = email.split("@")[0] || "User";
      isRole = decodedToken.role;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Prospect Details
        </h2>
        <div>
          <div className="flex justify-between my-8 sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Client"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {isRole === "admin" && (
              <button
                className="bg-red-600 text-white px-4 py-2 cursor-pointer rounded-lg hover:bg-red-700 transition duration-200"
                onClick={() => router.push("/dashboard/add-prospact")}
              >
                + Add Prospect
              </button>
            )}
          </div>
        </div>

        <div className="bg-white overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border-b p-3 text-left font-semibold text-gray-700">Client</th>
                <th className="border-b p-3 text-left font-semibold text-gray-700">Sales Person</th>
                <th className="border-b p-3 text-left font-semibold text-gray-700">Next Follow-Up</th>
                <th className="border-b p-3 text-left font-semibold text-gray-700">Quote Status</th>
                <th className="border-b p-3 text-left font-semibold text-gray-700">Quote Sent to Client</th>
                <th className="border-b p-3 text-left font-semibold text-gray-700">Competitor Statement</th>
                <th className="border-b p-3 text-left font-semibold text-gray-700">Notes</th>
                <th className="border-b p-3 text-left font-semibold text-gray-700">Convert Customer</th>
                <th className="border-b p-3 text-left font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {actualCustomers.map((prospect) => (
                <tr key={prospect._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-gray-800">{prospect.storeName}</td>
                  <td className="p-3 text-gray-800">{prospect.assignedSalesPerson?.email || "N/A"}</td>
                  <td className="p-3 text-gray-800">
                    {prospect.followUpActivities.length > 0
                      ? prospect.followUpActivities[0].activityDate
                      : "N/A"}
                  </td>
                  <td className="p-3 text-gray-800">
                    {prospect.quotedList.length > 0 ? (
                      <span
                        className="text-blue-500 cursor-pointer hover:underline"
                        onClick={() =>
                          openModal(
                            prospect,
                            "Quote Status",
                            prospect.quotedList
                              .map(
                                (item) =>
                                  `\n\nProduct: ${item.itemNumber}\nItem Name: ${item.itemName}\nAt Price: $${item.price}`
                              )
                              .join("\n")
                          )
                        }
                      >
                        📄
                      </span>
                    ) : (
                      "Pending"
                    )}
                  </td>
                  <td className="p-3 text-gray-800">
                    <button
                      onClick={() => handleClickSendEmail(prospect._id)}
                      className="bg-blue-500 text-white px-2 py-1 ml-1 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                      Sent Quote
                    </button>
                  </td>
                  <td className="p-3 text-gray-800">
                    {prospect.competitorStatement ? (
                      <span
                        className="text-blue-500 cursor-pointer hover:underline"
                        onClick={() =>
                          openModal(prospect, "Competitor File", prospect.competitorStatement)
                        }
                      >
                        📄
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="p-3 text-gray-800">
                    {prospect.note ? (
                      <span
                        className="text-blue-500 cursor-pointer hover:underline"
                        onClick={() => openModal(prospect, "Notes", prospect.note)}
                      >
                        📄
                      </span>
                    ) : (
                      "No notes"
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleConvertProspect(prospect._id)}
                      className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition duration-200"
                      disabled={isConverting}
                    >
                      {isConverting ? "Converting..." : "Convert"}
                    </button>
                  </td>
                  <td className="p-3 flex space-x-6 items-center">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 ml-1 rounded-lg hover:bg-blue-600 transition duration-200"
                      onClick={() => openUpdateModal(prospect)}
                      disabled={isUpdating}
                    >
                      Assign Salesperson
                    </button>
                    <Link href={`/dashboard/update-prospact/${prospect._id}`} className="flex items-center gap-2 w-full">
                      <button
                        className="text-black border px-2 py-1 rounded-lg cursor-pointer transition duration-200"
                      >
                        ✎
                      </button>
                    </Link>
                    <button
                      className="border text-white px-2 py-1 rounded-lg cursor-pointer transition duration-200"
                      onClick={() => handleDeleteProspect(prospect.storeName, prospect._id)}
                      disabled={isDeleting}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && modalContent && selectedProspect && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">{modalContent.title}</h3>
              <div className="space-y-4">
                <pre className="whitespace-pre-wrap">{modalContent.data}</pre>
              </div>
              <button
                className="mt-6 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {isUpdateModalOpen && selectedProspect && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
              <h3 className="text-xl font-bold mb-4">Update Salesperson</h3>
              <div className="space-y-4 flex items-center">
                <div className="flex space-x-4">
                  <label htmlFor="newSalesperson" className="block text-sm font-medium text-gray-700">
                    New Salesperson:
                  </label>
                  <select
                    id="newSalesperson"
                    value={newSalespersonId}
                    onChange={(e) => setNewSalespersonId(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSalesUsersLoading || isUpdating}
                  >
                    <>
                      <option value="">Select a Salesperson</option>
                      {(salesUsersResponse?.data || [])
                        .filter((user) => user.role === "salesUser")
                        .map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.email}
                          </option>
                        ))}
                    </>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                  onClick={closeUpdateModal}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  onClick={handleUpdateProspect}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}