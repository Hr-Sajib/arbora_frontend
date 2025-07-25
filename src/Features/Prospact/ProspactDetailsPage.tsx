"use client";
 import  Cookies from "js-cookie"
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image"; // Image is imported but not used. Consider removing if not needed.
import {
  useConvertProspectMutation,
  useDeleteProspectMutation,
  useGetProspectsQuery,
  useSendEmailMutation,
  useUpdateProspectMutation,
} from "@/redux/api/auth/prospact/prospactApi";
import { useGetSalesUsersQuery } from "@/redux/api/auth/admin/adminApi";
import { Prospect } from "@/types"; // Make sure your Prospect type matches your API response
import Loading from "@/redux/Shared/Loading";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/app/(dashboardLayout)/dashboard/page";

// It's generally better to handle token in baseApi.ts
// or use an interceptor if you use it in many places.
// For this component, it's fine as long as you have 'use client'.
 const getTokenFromCookie = () => {
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
  const token = tokenCookie ? tokenCookie.split('=')[1] : '';
  if (!token) {
    // In a real app, you might redirect to login or show a more graceful error
    console.warn("No token found in cookies. Please log in.");
    // alert("No token found in cookies. Please log in."); // Avoid alert in production components
  }
  return token;
};


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

  // Uncomment this if you intend to use the convert mutation
  const [convertProspect] = useConvertProspectMutation();
const [sendEmail]=useSendEmailMutation()


 // Filter customers based on search (storePersonName)
  // const filteredData = customers.filter((customer) =>
  //   customer.storeName.toLowerCase().includes(search.toLowerCase()) || customer.storePersonName.toLowerCase().includes(search.toLowerCase())
  // );

  // Fetch all salespeople
  const {
    data: salesUsersResponse,
    isLoading: isSalesUsersLoading,
    error: salesUsersError,
  } = useGetSalesUsersQuery(undefined);

  // Fetch prospects with RTK Query
  const { data: prospectsResponse, error, isLoading, refetch } = useGetProspectsQuery(undefined, {
    refetchOnMountOrArgChange: true, // Ensures data is fresh on mount or arg change
  });

  // Update and delete prospect mutations
  const [updateProspect, { isLoading: isUpdating }] = useUpdateProspectMutation();
  const [deleteProspect, { isLoading: isDeleting }] = useDeleteProspectMutation();

  // Handle loading and error states for main data
  if (isLoading) return <div className="min-h-screen p-4 text-center"><Loading/></div>;
  if (error) return <div className="min-h-screen p-4 text-center">Error loading prospects</div>;

  const prospects = prospectsResponse?.data || []; // Ensure prospects is always an array

  console.log("qoateddata", prospects); // Typo here: "qoateddata" should be "quotedData"

  // Filter prospects based on search term
  console.log("search tearm",searchTerm)
  const filteredProspects = prospects.filter(
    (prospect) =>
      prospect.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.storePersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (prospect.assignedSalesPerson?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('filter data', filteredProspects)
  // Pagination logic
  const totalPages = Math.ceil(filteredProspects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProspects = filteredProspects.slice(startIndex, endIndex);

  // Function to handle prospect conversion
  const handleConvertProspect = async (id: string) => {
    console.log("convert api", id);
    try {
     const convert= await convertProspect(id).unwrap(); // Use unwrap() to get the actual data or throw error
      console.log(convert)
      toast.success("Prospect converted successfully!");
      refetch(); // Refetch prospects to update the list
    } catch (err) {
      toast.error("Failed to convert prospect");
      console.error("Convert error:", err);
      // You might want to display a more specific error message based on 'err'
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
    setNewSalespersonId(prospect.assignedSalesPerson._id);
    setIsUpdateModalOpen(true);
  };

  // Correct and unique definition of handleUpdateProspect
  const handleUpdateProspect = async () => {
    if (!selectedProspect || !selectedProspect._id || !newSalespersonId) {
      toast.error("Invalid prospect or salesperson ID."); // Use toast for user feedback
      return;
    }

    const payload = { _id: selectedProspect._id, assignedSalesPerson: newSalespersonId };

    try {
      await updateProspect(payload).unwrap();
      await refetch(); // Wait for refetch to complete
      closeUpdateModal();
      toast.success("Prospect Salesperson updated successfully!");
    } catch (err: any) { // Type 'err' as 'any' or more specific type if known
      console.error("Failed to update prospect:", err);
      const errorMessage = err?.data?.message || err?.message || "Unknown error occurred.";
      toast.error(`Error updating prospect: ${errorMessage}`);
    }
  };

  const handleDeleteProspect = async (prospectId: string) => {
    if (!window.confirm(`Are you sure you want to delete prospect with ID: ${prospectId}?`)) {
      return;
    }

    try {
      await deleteProspect(prospectId).unwrap();
      await refetch(); // Wait for refetch to complete
      toast.success("Prospect deleted successfully!");
    } catch (err: any) { // Type 'err' as 'any' or more specific type if known
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
  console.log('pagination prospact', paginatedProspects)
const actualCustomers =filteredProspects.filter(customer => customer.status !== "converted");

const handileClickSendEMail=async(id:string)=>{

  try {
   const email= await sendEmail(id)
   console.log( "send email",email)
    toast.success("Email success fully send ")
  } catch (error) {
    console.log(error)
  }
}

  const pathname = usePathname();
  const role = Cookies.get("role")?.toLowerCase();
  const isAdmin = role === "admin";
  const token = Cookies.get("token");

  let isRole=""
  console.log("is admin role check",role)
  // Decode token to get email dynamically
  let email = "admin@gmail.com"; // Default value
  let username = "Daval"; // Default username
  if (token) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      email = decodedToken.email;
      // Derive username from email (e.g., first part before @)
      username = email.split("@")[0] || "User";
      isRole=decodedToken.role
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
                placeholder="Search prospect, salesperson"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              
              {
                isRole==="admin"&& <button
                className="bg-red-600 text-white px-4 py-2 cursor-pointer rounded-lg hover:bg-red-700 transition duration-200"
                onClick={() => router.push("/dashboard/add-prospact")}
              >
                + Add Prospect
              </button>
              
              }
             
            </div>
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
                  <td className="p-3 text-gray-800">{prospect.assignedSalesPerson?.email || "N/A" }</td>
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
                                  `Product ID: ${item.productObjId?._id || "N/A"}, Item #: ${item.itemNumber}, Item Name: ${item.itemName}, Price: $${item.price}`
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
                    <button onClick={()=>handileClickSendEMail(prospect._id)} className="bg-blue-500 text-white px-2 py-1 ml-1 rounded-lg hover:bg-blue-600 transition duration-200" >Sent Quote</button>
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
                    {/* Convert button - uncommented and linked to handleConvertProspect */}
                    <button onClick={() => handleConvertProspect(prospect._id)} className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition duration-200">Convert</button>
                  </td>
                  <td className="p-3 flex space-x-6 items-center">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 ml-1 rounded-lg hover:bg-blue-600 transition duration-200"
                      onClick={() => openUpdateModal(prospect)}
                      disabled={isUpdating}
                    >
                      Assign Salesperson
                    </button>
                    
                    <button
                      className=" text-black px-2 py-1 rounded-lg cursor-pointer  transition duration-200"
                      onClick={() => handleUpdateRedirect(prospect._id)}
                    >
                      ✎
                    </button>
                    <button
                      className=" text-white px-2 cursor-pointer py-1 rounded-lg  transition duration-200"
                      onClick={() => handleDeleteProspect(prospect._id)}
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

        {/* <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
          <span>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProspects.length)} of{" "}
            {filteredProspects.length}
          </span>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition duration-200"
            >
              ◄
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                } transition duration-200`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition duration-200"
            >
              ►
            </button>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                // If you uncommented this part and want to use itemsPerPage for actual pagination size
                // setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when items per page changes
              }}
              className="p-1 border border-gray-300 rounded"
            >
              <option value={5}>5 ▼</option>
              <option value={10}>10 ▼</option>
              <option value={25}>25 ▼</option>
            </select>
          </div>
        </div> */}

        {/* Modal for Quote Status / Competitor Statement / Notes */}
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

        {/* Modal for Update Salesperson - Rendered ONLY ONCE */}
        {isUpdateModalOpen && selectedProspect && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
              <h3 className="text-xl font-bold mb-4">Update Salesperson</h3>
              <div className="space-y-4">
                <p>Current Salesperson ID: {selectedProspect.assignedSalesPerson._id}</p>
                <div className="flex space-x-4">
                  <label htmlFor="newSalesperson" className="block text-sm font-medium text-gray-700">New Salesperson:</label>
                  <select
                    id="newSalesperson" // Added ID for accessibility
                    value={newSalespersonId}
                    onChange={(e) => setNewSalespersonId(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSalesUsersLoading || isUpdating}
                  >
                    {salesUsersError ? (
                      <option disabled>Error loading salespeople</option>
                    ) : isSalesUsersLoading ? (
                      <option disabled>Loading...</option>
                    ) : (
                      // Add a default "Select Salesperson" option
                      <>
                        <option value="">Select a Salesperson</option>
                        {(salesUsersResponse?.data || [])
                          .filter((user) => user.role === "salesUser")
                          .map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.email} ({user._id})
                            </option>
                          ))}
                      </>
                    )}
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