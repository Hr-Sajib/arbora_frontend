



// "use client";

// import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
// import { AddProspectRequest, useAddProspectMutation } from "@/redux/api/auth/prospact/prospactApi";
// import { FollowUpActivity, QuotedListItem } from "@/types";
// import { useGetSalesUsersQuery } from "@/redux/api/auth/admin/adminApi";
// import { useGetInventoryQuery } from "@/redux/api/auth/inventory/inventoryApi";

// // Define enums
// const STATUS_OPTIONS = ["new", "contacted", "qualified", "rejected", "converted"] as const;
// type Status = typeof STATUS_OPTIONS[number];

// const ACTIVITY_MEDIUM_OPTIONS = ["call", "email", "meeting", "whatsapp"] as const;
// type ActivityMedium = typeof ACTIVITY_MEDIUM_OPTIONS[number];

// interface Product {
//   _id: string;
//   itemNumber: string;
//   name: string;
//   packetSize: string;
//   salesPrice: number;
// }

// interface FormData {
//   _id?: string;
//   storeName: string;
//   storePhone: string;
//   storePersonEmail: string;
//   storePersonName: string;
//   storePersonPhone: string;
//   salesTaxId: string;
//   shippingAddress: string;
//   shippingState: string;
//   shippingZipcode: string;
//   shippingCity: string;
//   miscellaneousDocImage: string;
//   leadSource: string;
//   note: string;
//   status: Status;
//   assignedSalesPerson: string;
//   followUpActivities: FollowUpActivity[];
//   quotedList: QuotedListItem[];
//   competitorStatement: string;
// }

// export default function AddProspact(): React.ReactElement {
//   const [isAdmin, setIsAdmin] = useState(true);
//   const [formData, setFormData] = useState<FormData>({
//     _id: "",
//     storeName: "",
//     storePhone: "",
//     storePersonEmail: "",
//     storePersonName: "",
//     storePersonPhone: "",
//     salesTaxId: "",
//     shippingAddress: "",
//     shippingState: "",
//     shippingZipcode: "",
//     shippingCity: "",
//     miscellaneousDocImage: "",
//     leadSource: "",
//     note: "",
//     status: "contacted",
//     assignedSalesPerson: "",
//     followUpActivities: [],
//     quotedList: [],
//     competitorStatement: "",
//   });

//   console.log("formdata ", formData)
//   const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
//   const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
//   const [newQuote, setNewQuote] = useState<QuotedListItem>({
//     productObjId: "",
//     itemNumber: "",
//     itemName: "",
//     price: 0,
//     packetSize: "",
//   });
//   const [newFollowUp, setNewFollowUp] = useState<FollowUpActivity>({
//     activity: "",
//     activityDate: "",
//     activityMedium: "call",
//   });
//   const { data: inventoryData, isLoading: isInventoryLoading, isError: isInventoryError } = useGetInventoryQuery();
//   const { data: salesUsersResponse, error: salesError, isLoading: isUsersLoading } = useGetSalesUsersQuery();
//   const [addProspect, { isLoading: isSaving }] = useAddProspectMutation();
//   const router = useRouter();

//   useEffect(() => {
//     if (isInventoryError) {
//       console.error("Error fetching inventory:", isInventoryError);
//       toast.error("Failed to load inventory.");
//     }
//   }, [isInventoryError]);

//   useEffect(() => {
//     if (salesError) {
//       console.error("Error fetching sales users:", salesError);
//       toast.error("Failed to load sales users.");
//     }
//   }, [salesError]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // input chagne for price on quote 

//   const handleQuotePriceChange = (index: number, newPrice: string) => {
//   const updatedQuotedList = [...formData.quotedList];
//   updatedQuotedList[index] = {
//     ...updatedQuotedList[index],
//     price: parseFloat(newPrice) || 0, // Ensure price is converted to a number, default to 0 if invalid
//   };
//   setFormData((prev) => ({
//     ...prev,
//     quotedList: updatedQuotedList,
//   }));
// };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const formDataUpload = new FormData();
//     formDataUpload.append("image", file);
//     formDataUpload.append("key", process.env.NEXT_PUBLIC_IMGBB_API_KEY || "YOUR_IMGBB_API_KEY");

//     fetch("https://api.imgbb.com/1/upload", {
//       method: "POST",
//       body: formDataUpload,
//     })
//       .then((response) => response.json())
//       .then((result) => {
//         if (result.success) {
//           setFormData((prev) => ({ ...prev, miscellaneousDocImage: result.data.url }));
//         }
//       })
//       .catch(() => {});
//   };

//   const handleQuoteInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
//     const { name, value } = e.target;
//     if (name === "productObjId" && inventoryData?.data) {
//       const selectedProduct = inventoryData.data.find((p: Product) => p._id === value);
//       if (selectedProduct) {
//         setNewQuote({
//           productObjId: selectedProduct._id,
//           itemNumber: selectedProduct.itemNumber,
//           itemName: selectedProduct.name,
//           price: selectedProduct.salesPrice,
//           packetSize: selectedProduct.packetSize || "",
//         });
//       }
//     }
//   };

//   const handleFollowUpInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setNewFollowUp((prev) => ({ ...prev, [name]: value }));
//   };

//   const addQuote = () => {
//     if (!newQuote.productObjId || !newQuote.itemNumber || !newQuote.itemName ||  !newQuote.price) {
//       toast.error("All required quote fields must be filled.");
//       return;
//     }
//     setFormData((prev) => ({
//       ...prev,
//       quotedList: [...prev.quotedList, { ...newQuote, packetSize: newQuote.packetSize || "" }],
//     }));
//     setNewQuote({ productObjId: "", itemNumber: "", itemName: "",  price: 0, packetSize: "" });
//     setIsQuoteModalOpen(false);
//   };

//   const addFollowUp = () => {
//     if (!newFollowUp.activity || !newFollowUp.activityDate || !newFollowUp.activityMedium) {
//       toast.error("All required follow-up fields must be filled.");
//       return;
//     }
//     setFormData((prev) => ({
//       ...prev,
//       followUpActivities: [...prev.followUpActivities, { ...newFollowUp }],
//     }));
//     setNewFollowUp({ activity: "", activityDate: "", activityMedium: "call" });
//     setIsFollowUpModalOpen(false);
//   };

//   const handleDeleteQuote = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       quotedList: prev.quotedList.filter((_, i) => i !== index),
//     }));
//   };

//   const handleDeleteFollowUp = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       followUpActivities: prev.followUpActivities.filter((_, i) => i !== index),
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const payload = {
     
//       storeName: formData.storeName,
//       storePhone: formData.storePhone,
//       storePersonEmail: formData.storePersonEmail,
//       storePersonName: formData.storePersonName,
//       storePersonPhone: formData.storePersonPhone,
//       salesTaxId: formData.salesTaxId || undefined,
//       shippingAddress: formData.shippingAddress,
//       shippingState: formData.shippingState,
//       shippingZipcode: formData.shippingZipcode,
//       shippingCity: formData.shippingCity,
//       miscellaneousDocImage: formData.miscellaneousDocImage || undefined,
//       leadSource: formData.leadSource,
//       note: formData.note || undefined,
//       status: formData.status,
//       assignedSalesPerson: formData.assignedSalesPerson || undefined,
//       followUpActivities: formData.followUpActivities,
//       quotedList: formData.quotedList,
//       competitorStatement: formData.competitorStatement,
//     };

//     console.log("check local data", payload);
//     try {
//      const addData= await addProspect(payload as any).unwrap();
     
//      console.log("adddata", addData)
//       toast.success("Prospect Added successfully");
//       router.push("/dashboard/prospact");
//     } catch (err) {
//       console.error("Failed to add prospect:", err);
//       toast.error("An unexpected error occurred.");
//     }
//   };

//   const handleCancel = () => router.push("/dashboard/prospact");

//   return (
//     <div className="p-4 bg-white rounded-lg shadow-md min-h-screen">
//       <h1 className="text-2xl font-bold mb-6">Add Prospect Details</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         <div className="space-y-2">
//           <Label htmlFor="status">Status</Label>
//           <select
//             id="status"
//             name="status"
//             value={formData.status}
//             onChange={handleInputChange}
//             className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {STATUS_OPTIONS.map((option) => (
//               <option key={option} value={option}>
//                 {option}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Store Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <Label htmlFor="storeName">Store Name</Label>
//             <Input
//               id="storeName"
//               name="storeName"
//               value={formData.storeName}
//               onChange={handleInputChange}
//               placeholder="Enter store name"
//               className="w-full"
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="storePhone">Store Phone Number</Label>
//             <Input
//               id="storePhone"
//               name="storePhone"
//               type="tel"
//               value={formData.storePhone}
//               onChange={handleInputChange}
//               placeholder="Enter store phone number"
//               className="w-full"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <Label htmlFor="storePersonName">Customer Full Name</Label>
//             <Input
//               id="storePersonName"
//               name="storePersonName"
//               value={formData.storePersonName}
//               onChange={handleInputChange}
//               placeholder="Enter customer full name"
//               className="w-full"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="storePersonPhone">Cell Phone Number</Label>
//             <Input
//               id="storePersonPhone"
//               name="storePersonPhone"
//               type="tel"
//               value={formData.storePersonPhone}
//               onChange={handleInputChange}
//               placeholder="Enter cell phone number"
//               className="w-full"
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="storePersonEmail">Email Address</Label>
//           <Input
//             id="storePersonEmail"
//             name="storePersonEmail"
//             type="email"
//             value={formData.storePersonEmail}
//             onChange={handleInputChange}
//             placeholder="Enter email address"
//             className="w-full"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="salesTaxId">Sales Tax ID</Label>
//           <Input
//             id="salesTaxId"
//             name="salesTaxId"
//             value={formData.salesTaxId}
//             onChange={handleInputChange}
//             placeholder="Enter sales tax ID"
//             className="w-full"
//           />
//         </div>

//         {/* Shipping Information */}
//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="shippingAddress">Shipping Address</Label>
//             <textarea
//               id="shippingAddress"
//               name="shippingAddress"
//               value={formData.shippingAddress}
//               onChange={handleInputChange}
//               placeholder="Enter shipping address"
//               rows={3}
//               className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
//             />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="shippingCity">Shipping City</Label>
//               <Input
//                 id="shippingCity"
//                 name="shippingCity"
//                 value={formData.shippingCity}
//                 onChange={handleInputChange}
//                 placeholder="Enter shipping city"
//                 className="w-full"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="shippingState">Shipping State</Label>
//               <Input
//                 id="shippingState"
//                 name="shippingState"
//                 value={formData.shippingState}
//                 onChange={handleInputChange}
//                 placeholder="Enter shipping state"
//                 className="w-full"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="shippingZipcode">Shipping Zipcode</Label>
//               <Input
//                 id="shippingZipcode"
//                 name="shippingZipcode"
//                 value={formData.shippingZipcode}
//                 onChange={handleInputChange}
//                 placeholder="Enter shipping zipcode"
//                 className="w-full"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Additional Fields */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <Label htmlFor="miscellaneousDocImage">Miscellaneous Doc Image</Label>
//             <label
//               htmlFor="miscellaneousDocImage"
//               className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2 w-full"
//             >
//               {formData.miscellaneousDocImage ? (
//                 <img
//                   src={formData.miscellaneousDocImage}
//                   alt="Doc Preview"
//                   className="w-32 h-32 object-cover rounded"
//                 />
//               ) : (
//                 <>
//                   <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
//                     <svg
//                       className="w-4 h-4 text-gray-400"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//                       />
//                     </svg>
//                   </div>
//                   <span className="text-sm text-gray-500">Click to upload</span>
//                 </>
//               )}
//               <input
//                 type="file"
//                 id="miscellaneousDocImage"
//                 name="miscellaneousDocImage"
//                 accept="image/*"
//                 onChange={handleFileUpload}
//                 className="hidden"
//               />
//             </label>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="leadSource">Lead Source</Label>
//             <Input
//               id="leadSource"
//               name="leadSource"
//               value={formData.leadSource}
//               onChange={handleInputChange}
//               placeholder="Enter lead source"
//               className="w-full"
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="note">Note</Label>
//           <textarea
//             id="note"
//             name="note"
//             value={formData.note}
//             onChange={handleInputChange}
//             placeholder="Enter note"
//             rows={3}
//             className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="competitorStatement">Competitor Statement</Label>
//           <textarea
//             id="competitorStatement"
//             name="competitorStatement"
//             value={formData.competitorStatement}
//             onChange={handleInputChange}
//             placeholder="Enter competitor statement"
//             rows={3}
//             className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="assignedSalesPerson">Assigned Sales Person ID</Label>
//           <select
//             id="assignedSalesPerson"
//             name="assignedSalesPerson"
//             value={formData.assignedSalesPerson}
//             onChange={handleInputChange}
//             className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
//             disabled={isUsersLoading}
//           >
//             <option value="">Select Sales Person</option>
//             {salesUsersResponse?.data
//               ?.filter((user) => user.role === "salesUser")
//               .map((user) => (
//                 <option key={user._id} value={user._id}>
//                   {user.email} ({user._id})
//                 </option>
//               ))}
//           </select>
//         </div>

//         <div className="flex space-x-4">
//           <Button type="button" onClick={() => setIsQuoteModalOpen(true)} className="bg-blue-600 text-white">
//             Quote Info
//           </Button>
//           <Button type="button" onClick={() => setIsFollowUpModalOpen(true)} className="bg-green-600 text-white">
//             Follow Up
//           </Button>
//         </div>

//         {/* Quoted List Table */}
//         {/* {formData.quotedList.length > 0 && (
//           <div className="overflow-x-auto">
//             <Label>Quoted Items</Label>
//             <table className="w-full text-sm text-left text-gray-500 mt-2">
//               <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-2">Product ID</th>
//                   <th className="px-4 py-2">Item #</th>
//                   <th className="px-4 py-2">Item Name</th>
//                   <th className="px-4 py-2">Price ($)</th>
//                   <th className="px-4 py-2">Packet Size</th>
//                   <th className="px-4 py-2">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {formData.quotedList.map((item, index) => (
//                   <tr key={index} className="bg-white border-b">
//                     <td className="px-4 py-2">{item.productObjId}</td>
//                     <td className="px-4 py-2">{item.itemNumber}</td>
//                     <td className="px-4 py-2">{item.itemName}</td>
//                     <td className="px-4 py-2">${item.price}</td>
//                     <td className="px-4 py-2">{item.packetSize || "N/A"}</td>
//                     <td className="px-4 py-2">
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => handleDeleteQuote(index)}
//                         className="text-white"
//                       >
//                         Delete
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )} */}


//         {formData.quotedList.length > 0 && (
//   <div className="overflow-x-auto">
//     <Label>Quoted Items</Label>
//     <table className="w-full text-sm text-left text-gray-500 mt-2">
//       <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//         <tr>
//           <th className="px-4 py-2">Product ID</th>
//           <th className="px-4 py-2">Item #</th>
//           <th className="px-4 py-2">Item Name</th>
//           <th className="px-4 py-2">Price ($)</th>
//           <th className="px-4 py-2">Packet Size</th>
//           <th className="px-4 py-2">Action</th>
//         </tr>
//       </thead>
//       <tbody>
//         {formData.quotedList.map((item, index) => (
//           <tr key={index} className="bg-white border-b">
//             <td className="px-4 py-2">{item.productObjId}</td>
//             <td className="px-4 py-2">{item.itemNumber}</td>
//             <td className="px-4 py-2">{item.itemName}</td>
//             <td className="px-4 py-2">
//               {isAdmin ? (
//                 <Input
//                   type="number"
//                   value={item.price}
//                   onChange={(e) => handleQuotePriceChange(index, e.target.value)}
//                   className="w-24 px-2 py-1 border rounded-md"
//                   step="0.01"
//                 />
//               ) : (
//                 `$${item.price}` // Fixed: Use template literal inside a string or directly format
//               )}
//             </td>
//             <td className="px-4 py-2">{item.packetSize || "N/A"}</td>
//             <td className="px-4 py-2">
//               <Button
//                 variant="destructive"
//                 size="sm"
//                 onClick={() => handleDeleteQuote(index)}
//                 className="text-white"
//               >
//                 Delete
//               </Button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// )}

//         {/* Follow Up Activities Table */}
//         {formData.followUpActivities.length > 0 && (
//           <div className="overflow-x-auto">
//             <Label>Follow Up Activities</Label>
//             <table className="w-full text-sm text-left text-gray-500 mt-2">
//               <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-2">Activity</th>
//                   <th className="px-4 py-2">Date</th>
//                   <th className="px-4 py-2">Medium</th>
//                   <th className="px-4 py-2">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {formData.followUpActivities.map((activity, index) => (
//                   <tr key={index} className="bg-white border-b">
//                     <td className="px-4 py-2">{activity.activity}</td>
//                     <td className="px-4 py-2">{activity.activityDate}</td>
//                     <td className="px-4 py-2">{activity.activityMedium}</td>
//                     <td className="px-4 py-2">
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => handleDeleteFollowUp(index)}
//                         className="text-white"
//                       >
//                         Delete
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         <div className="flex justify-end space-x-4 pt-6">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={handleCancel}
//             className="px-6 py-2 cursor-pointer text-white hover:text-white bg-gray-500 hover:bg-gray-600"
//             disabled={isSaving}
//           >
//             Cancel
//           </Button>
//           <Button
//             type="submit"
//             className="px-6 py-2 bg-red-600 hover:bg-red-700 cursor-pointer text-white"
//             disabled={isSaving}
//           >
//             {isSaving ? "Saving..." : "Save"}
//           </Button>
//         </div>
//       </form>

//       {isQuoteModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//             <h2 className="text-xl font-bold mb-4">Add Quote Info</h2>
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="productObjId">Product ID</Label>
//                 <select
//                   id="productObjId"
//                   name="productObjId"
//                   value={newQuote.productObjId}
//                   onChange={handleQuoteInputChange}
//                   className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
//                   disabled={isInventoryLoading}
//                 >
//                   <option value="">Select Product</option>
//                   {inventoryData?.data?.map((product: Product) => (
//                     <option key={product._id} value={product._id}>
//                       {product.name} ({product._id})
//                     </option>
//                   )) || <option disabled>No products available</option>}
//                 </select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="itemNumber">Item Number</Label>
//                 <Input
//                   id="itemNumber"
//                   name="itemNumber"
//                   value={newQuote.itemNumber}
//                   onChange={handleQuoteInputChange}
//                   placeholder="Item Number"
//                   className="w-full"
//                   disabled
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="itemName">Item Name</Label>
//                 <Input
//                   id="itemName"
//                   name="itemName"
//                   value={newQuote.itemName}
//                   onChange={handleQuoteInputChange}
//                   placeholder="Item Name"
//                   className="w-full"
//                   disabled
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="price">Price ($)</Label>
//                 <Input
//                   id="price"
//                   name="price"
//                   type="number"
//                   value={newQuote.price}
//                   onChange={handleQuoteInputChange}
//                   placeholder="Price"
//                   className="w-full"
//                   disabled
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end space-x-4 mt-4">
//               <Button type="button" onClick={() => setIsQuoteModalOpen(false)} variant="outline">
//                 Cancel
//               </Button>
//               <Button type="button" onClick={addQuote} className="bg-blue-600 text-white">
//                 Add Quote
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isFollowUpModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//             <h2 className="text-xl font-bold mb-4">Add Follow Up</h2>
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="activity">Activity</Label>
//                 <Input
//                   id="activity"
//                   name="activity"
//                   value={newFollowUp.activity}
//                   onChange={handleFollowUpInputChange}
//                   placeholder="Enter activity"
//                   className="w-full"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="activityDate">Date</Label>
//                 <Input
//                   id="activityDate"
//                   name="activityDate"
//                   type="date"
//                   value={newFollowUp.activityDate}
//                   onChange={handleFollowUpInputChange}
//                   className="w-full"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="activityMedium">Medium</Label>
//                 <select
//                   id="activityMedium"
//                   name="activityMedium"
//                   value={newFollowUp.activityMedium}
//                   onChange={handleFollowUpInputChange}
//                   className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   {ACTIVITY_MEDIUM_OPTIONS.map((option) => (
//                     <option key={option} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="flex justify-end space-x-4 mt-4">
//               <Button type="button" onClick={() => setIsFollowUpModalOpen(false)} variant="outline">
//                 Cancel
//               </Button>
//               <Button type="button" onClick={addFollowUp} className="bg-green-600 text-white">
//                 Add Follow Up
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AddProspectRequest, useAddProspectMutation } from "@/redux/api/auth/prospact/prospactApi";
import { FollowUpActivity, QuotedListItem } from "@/types";
import { useGetSalesUsersQuery } from "@/redux/api/auth/admin/adminApi";
import { useGetInventoryQuery } from "@/redux/api/auth/inventory/inventoryApi";

// Define enums
const STATUS_OPTIONS = ["new", "contacted", "qualified", "rejected", "converted"] as const;
type Status = typeof STATUS_OPTIONS[number];

const ACTIVITY_MEDIUM_OPTIONS = ["call", "email", "meeting", "whatsapp"] as const;
type ActivityMedium = typeof ACTIVITY_MEDIUM_OPTIONS[number];

interface Product {
  _id: string;
  itemNumber: string;
  name: string;
  packetSize: string;
  salesPrice: number;
}

interface FormData {
  _id?: string;
  storeName: string;
  storePhone: string;
  storePersonEmail: string;
  storePersonName: string;
  storePersonPhone: string;
  salesTaxId: string;
  shippingAddress: string;
  shippingState: string;
  shippingZipcode: string;
  shippingCity: string;
  miscellaneousDocImage: string;
  leadSource: string;
  note: string;
  status: Status;
  assignedSalesPerson: string;
  followUpActivities: FollowUpActivity[];
  quotedList: QuotedListItem[];
  competitorStatement: string;
}

export default function AddProspact(): React.ReactElement {
  const [isAdmin, setIsAdmin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    _id: "",
    storeName: "",
    storePhone: "",
    storePersonEmail: "",
    storePersonName: "",
    storePersonPhone: "",
    salesTaxId: "",
    shippingAddress: "",
    shippingState: "",
    shippingZipcode: "",
    shippingCity: "",
    miscellaneousDocImage: "",
    leadSource: "",
    note: "",
    status: "contacted",
    assignedSalesPerson: "",
    followUpActivities: [],
    quotedList: [],
    competitorStatement: "",
  });

  console.log("formdata ", formData);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [newQuote, setNewQuote] = useState<QuotedListItem>({
    productObjId: "",
    itemNumber: "",
    itemName: "",
    price: 0,
    packetSize: "",
  });
  const [newFollowUp, setNewFollowUp] = useState<FollowUpActivity>({
    activity: "",
    activityDate: "",
    activityMedium: "call",
  });
  const { data: inventoryData, isLoading: isInventoryLoading, isError: isInventoryError } = useGetInventoryQuery();
  const { data: salesUsersResponse, error: salesError, isLoading: isUsersLoading } = useGetSalesUsersQuery();
  const [addProspect, { isLoading: isSaving }] = useAddProspectMutation();
  const router = useRouter();

  useEffect(() => {
    if (isInventoryError) {
      console.error("Error fetching inventory:", isInventoryError);
      toast.error("Failed to load inventory.");
    }
  }, [isInventoryError]);

  useEffect(() => {
    if (salesError) {
      console.error("Error fetching sales users:", salesError);
      toast.error("Failed to load sales users.");
    }
  }, [salesError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuotePriceChange = (index: number, newPrice: string) => {
    const updatedQuotedList = [...formData.quotedList];
    updatedQuotedList[index] = {
      ...updatedQuotedList[index],
      price: parseFloat(newPrice) || 0,
    };
    setFormData((prev) => ({
      ...prev,
      quotedList: updatedQuotedList,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);
    formDataUpload.append("key", process.env.NEXT_PUBLIC_IMGBB_API_KEY || "YOUR_IMGBB_API_KEY");

    fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formDataUpload,
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setFormData((prev) => ({ ...prev, miscellaneousDocImage: result.data.url }));
        }
      })
      .catch(() => {});
  };

  const handleQuoteInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "productObjId" && inventoryData?.data) {
      const selectedProduct = inventoryData.data.find((p: Product) => p._id === value);
      if (selectedProduct) {
        setNewQuote({
          productObjId: selectedProduct._id,
          itemNumber: selectedProduct.itemNumber,
          itemName: selectedProduct.name,
          price: selectedProduct.salesPrice,
          packetSize: selectedProduct.packetSize || "",
        });
      }
    } else if (name === "price") {
      setNewQuote((prev) => ({
        ...prev,
        price: parseFloat(value) || 0,
      }));
    }
  };

  const handleFollowUpInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewFollowUp((prev) => ({ ...prev, [name]: value }));
  };

  const addQuote = () => {
    if (!newQuote.productObjId || !newQuote.itemNumber || !newQuote.itemName || !newQuote.price) {
      toast.error("All required quote fields must be filled.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      quotedList: [...prev.quotedList, { ...newQuote, packetSize: newQuote.packetSize || "" }],
    }));
    setNewQuote({ productObjId: "", itemNumber: "", itemName: "", price: 0, packetSize: "" });
    setIsQuoteModalOpen(false);
  };

  const addFollowUp = () => {
    if (!newFollowUp.activity || !newFollowUp.activityDate || !newFollowUp.activityMedium) {
      toast.error("All required follow-up fields must be filled.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      followUpActivities: [...prev.followUpActivities, { ...newFollowUp }],
    }));
    setNewFollowUp({ activity: "", activityDate: "", activityMedium: "call" });
    setIsFollowUpModalOpen(false);
  };

  const handleDeleteQuote = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      quotedList: prev.quotedList.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteFollowUp = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      followUpActivities: prev.followUpActivities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      storeName: formData.storeName,
      storePhone: formData.storePhone,
      storePersonEmail: formData.storePersonEmail,
      storePersonName: formData.storePersonName,
      storePersonPhone: formData.storePersonPhone,
      salesTaxId: formData.salesTaxId || undefined,
      shippingAddress: formData.shippingAddress,
      shippingState: formData.shippingState,
      shippingZipcode: formData.shippingZipcode,
      shippingCity: formData.shippingCity,
      miscellaneousDocImage: formData.miscellaneousDocImage || undefined,
      leadSource: formData.leadSource,
      note: formData.note || undefined,
      status: formData.status,
      assignedSalesPerson: formData.assignedSalesPerson || undefined,
      followUpActivities: formData.followUpActivities,
      quotedList: formData.quotedList,
      competitorStatement: formData.competitorStatement,
    };

    console.log("check local data", payload);
    try {
      const addData = await addProspect(payload as any).unwrap();
      console.log("adddata", addData);
      toast.success("Prospect Added successfully");
      router.push("/dashboard/prospact");
    } catch (err) {
      console.error("Failed to add prospect:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleCancel = () => router.push("/dashboard/prospact");

  return (
    <div className="p-4 bg-white rounded-lg shadow-md min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Add Prospect Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              placeholder="Enter store name"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storePhone">Store Phone Number</Label>
            <Input
              id="storePhone"
              name="storePhone"
              type="tel"
              value={formData.storePhone}
              onChange={handleInputChange}
              placeholder="Enter store phone number"
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
 
            <Label htmlFor="storePersonName">Customer Full Name</Label>
            <Input
              id="storePersonName"
              name="storePersonName"
              value={formData.storePersonName}
              onChange={handleInputChange}
              placeholder="Enter customer full name"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storePersonPhone">Cell Phone Number</Label>
            <Input
              id="storePersonPhone"
              name="storePersonPhone"
              type="tel"
              value={formData.storePersonPhone}
              onChange={handleInputChange}
              placeholder="Enter cell phone number"
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storePersonEmail">Email Address</Label>
          <Input
            id="storePersonEmail"
            name="storePersonEmail"
            type="email"
            value={formData.storePersonEmail}
            onChange={handleInputChange}
            placeholder="Enter email address"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salesTaxId">Sales Tax ID</Label>
          <Input
            id="salesTaxId"
            name="salesTaxId"
            value={formData.salesTaxId}
            onChange={handleInputChange}
            placeholder="Enter sales tax ID"
            className="w-full"
          />
        </div>

        {/* Shipping Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Shipping Address</Label>
            <textarea
              id="shippingAddress"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              placeholder="Enter shipping address"
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shippingCity">Shipping City</Label>
              <Input
                id="shippingCity"
                name="shippingCity"
                value={formData.shippingCity}
                onChange={handleInputChange}
                placeholder="Enter shipping city"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingState">Shipping State</Label>
              <Input
                id="shippingState"
                name="shippingState"
                value={formData.shippingState}
                onChange={handleInputChange}
                placeholder="Enter shipping state"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingZipcode">Shipping Zipcode</Label>
              <Input
                id="shippingZipcode"
                name="shippingZipcode"
                value={formData.shippingZipcode}
                onChange={handleInputChange}
                placeholder="Enter shipping zipcode"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="miscellaneousDocImage">Miscellaneous Doc Image</Label>
            <label
              htmlFor="miscellaneousDocImage"
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2 w-full"
            >
              {formData.miscellaneousDocImage ? (
                <img
                  src={formData.miscellaneousDocImage}
                  alt="Doc Preview"
                  className="w-32 h-32 object-cover rounded"
                />
              ) : (
                <>
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500">Click to upload</span>
                </>
              )}
              <input
                type="file"
                id="miscellaneousDocImage"
                name="miscellaneousDocImage"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadSource">Lead Source</Label>
            <Input
              id="leadSource"
              name="leadSource"
              value={formData.leadSource}
              onChange={handleInputChange}
              placeholder="Enter lead source"
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            placeholder="Enter note"
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="competitorStatement">Competitor Statement</Label>
          <textarea
            id="competitorStatement"
            name="competitorStatement"
            value={formData.competitorStatement}
            onChange={handleInputChange}
            placeholder="Enter competitor statement"
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedSalesPerson">Assigned Sales Person ID</Label>
          <select
            id="assignedSalesPerson"
            name="assignedSalesPerson"
            value={formData.assignedSalesPerson}
            onChange={handleInputChange}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isUsersLoading}
          >
            <option value="">Select Sales Person</option>
            {salesUsersResponse?.data
              ?.filter((user) => user.role === "salesUser")
              .map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email} ({user._id})
                </option>
              ))}
          </select>
        </div>

        <div className="flex space-x-4">
          <Button type="button" onClick={() => setIsQuoteModalOpen(true)} className="bg-blue-600 text-white">
            Quote Info
          </Button>
          <Button type="button" onClick={() => setIsFollowUpModalOpen(true)} className="bg-green-600 text-white">
            Follow Up
          </Button>
        </div>

        {/* Quoted List Table */}
        {formData.quotedList.length > 0 && (
          <div className="overflow-x-auto">
            <Label>Quoted Items</Label>
            <table className="w-full text-sm text-left text-gray-500 mt-2">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Product ID</th>
                  <th className="px-4 py-2">Item #</th>
                  <th className="px-4 py-2">Item Name</th>
                  <th className="px-4 py-2">Price ($)</th>
                  <th className="px-4 py-2">Packet Size</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.quotedList.map((item, index) => (
                  <tr key={index} className="bg-white border-b">
                    <td className="px-4 py-2">{item.productObjId}</td>
                    <td className="px-4 py-2">{item.itemNumber}</td>
                    <td className="px-4 py-2">{item.itemName}</td>
                    <td className="px-4 py-2">
                      {isAdmin ? (
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleQuotePriceChange(index, e.target.value)}
                          className="w-24 px-2 py-1 border rounded-md"
                          step="0.01"
                        />
                      ) : (
                        `$${item.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-4 py-2">{item.packetSize || "N/A"}</td>
                    <td className="px-4 py-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteQuote(index)}
                        className="text-white"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Follow Up Activities Table */}
        {formData.followUpActivities.length > 0 && (
          <div className="overflow-x-auto">
            <Label>Follow Up Activities</Label>
            <table className="w-full text-sm text-left text-gray-500 mt-2">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Activity</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Medium</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.followUpActivities.map((activity, index) => (
                  <tr key={index} className="bg-white border-b">
                    <td className="px-4 py-2">{activity.activity}</td>
                    <td className="px-4 py-2">{activity.activityDate}</td>
                    <td className="px-4 py-2">{activity.activityMedium}</td>
                    <td className="px-4 py-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteFollowUp(index)}
                        className="text-white"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="px-6 py-2 cursor-pointer text-white hover:text-white bg-gray-500 hover:bg-gray-600"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-6 py-2 bg-red-600 hover:bg-red-700 cursor-pointer text-white"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>

      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Quote Info</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productObjId">Product ID</Label>
                <select
                  id="productObjId"
                  name="productObjId"
                  value={newQuote.productObjId}
                  onChange={handleQuoteInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isInventoryLoading}
                >
                  <option value="">Select Product</option>
                  {inventoryData?.data?.map((product: Product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} ({product._id})
                    </option>
                  )) || <option disabled>No products available</option>}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemNumber">Item Number</Label>
                <Input
                  id="itemNumber"
                  name="itemNumber"
                  value={newQuote.itemNumber}
                  onChange={handleQuoteInputChange}
                  placeholder="Item Number"
                  className="w-full"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  name="itemName"
                  value={newQuote.itemName}
                  onChange={handleQuoteInputChange}
                  placeholder="Item Name"
                  className="w-full"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={newQuote.price}
                  onChange={handleQuoteInputChange}
                  placeholder="Price"
                  className="w-full"
                  disabled={!isAdmin} // Enable price input for admins
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" onClick={() => setIsQuoteModalOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button type="button" onClick={addQuote} className="bg-blue-600 text-white">
                Add Quote
              </Button>
            </div>
          </div>
        </div>
      )}

      {isFollowUpModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Follow Up</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activity">Activity</Label>
                <Input
                  id="activity"
                  name="activity"
                  value={newFollowUp.activity}
                  onChange={handleFollowUpInputChange}
                  placeholder="Enter activity"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activityDate">Date</Label>
                <Input
                  id="activityDate"
                  name="activityDate"
                  type="date"
                  value={newFollowUp.activityDate}
                  onChange={handleFollowUpInputChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activityMedium">Medium</Label>
                <select
                  id="activityMedium"
                  name="activityMedium"
                  value={newFollowUp.activityMedium}
                  onChange={handleFollowUpInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ACTIVITY_MEDIUM_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" onClick={() => setIsFollowUpModalOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button type="button" onClick={addFollowUp} className="bg-green-600 text-white">
                Add Follow Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}