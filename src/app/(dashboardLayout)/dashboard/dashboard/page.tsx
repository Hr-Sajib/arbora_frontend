// "use client";

// import BestSellingProducts from "@/Features/DashboardOverview/BestSellingProducts";
// import ProductSegmentation from "@/Features/DashboardOverview/ProductSegmentation";
// import SalesOverview from "@/Features/DashboardOverview/SalesOverview";
// import MonthlyReport from "@/Features/DashboardOverview/MonthlyReport";
// import { useGetInventoryQuery } from "@/redux/api/auth/inventory/inventoryApi";

// export default function Dashboard(): React.ReactElement {
//   const salesData = {
//     totalSales: 12025,
//     dueAmount: 12025,
//     newOrder: 12025,
//     soldStock: 2025,
//     lowStock: 2025,
//     trends: { totalSales: 10.4, dueAmount: -10.4, newOrder: 10.4 },
//   };

//   const customerData = [
//     { customer: "Imtiaz, Mahadi, Shaikat", frequency: [20, 30, 56], qty: ["100gm", "250gm", "1kg"], products: ["Handvo Flour", "Ragi Flour", "Besan Fine"] },
//     { customer: "Imtiaz, Mahadi, Shaikat", frequency: [20, 30, 56], qty: ["100gm", "250gm", "1kg"], products: ["Handvo Flour", "Ragi Flour", "Besan Fine"] },
//     { customer: "Imtiaz, Mahadi, Shaikat", frequency: [20, 30, 56], qty: ["100gm", "250gm", "1kg"], products: ["Handvo Flour", "Ragi Flour", "Besan Fine"] },
//     { customer: "Imtiaz, Mahadi, Shaikat", frequency: [20, 30, 56], qty: ["100gm", "250gm", "1kg"], products: ["Handvo Flour", "Ragi Flour", "Besan Fine"] },
//     { customer: "Imtiaz, Mahadi, Shaikat", frequency: [20, 30, 56], qty: ["100gm", "250gm", "1kg"], products: ["Handvo Flour", "Ragi Flour", "Besan Fine"] },
//   ];

//   const { data, isLoading, isError } = useGetInventoryQuery();

//   const allProducts = data?.data;
//   const lowStockProducts = allProducts?.filter(
//     (product) => product.quantity < product.reorderPointOfQuantity
//   );

//   return (
//        <div className="p-4 md:p-2 space-y-6">


//             {/* Section 1: Sales Overview */}

//             <SalesOverview/>

//             {/* Section 2: Best Selling Products & Weekly Report */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div >
//                     <BestSellingProducts />
//                 </div>
//                 <div>
//                     <div>
//                       <MonthlyReport/>
//                     </div>
//                     <div className="w-full h-56 bg-white shadow-md rounded-2xl mt-2 p-5 overflow-auto">
//                         <p className="text-lg font-semibold mb-3 text-red-700">⚠️ {lowStockProducts?.length} low stock products</p>
//                         <table className="min-w-full text-left ">
//                             <thead className="border-b">
//                                 <tr>
//                                     <th className="py-2 px-3">Category</th>
//                                     <th className="py-2 px-3">Product Name</th>
//                                     <th className="py-2 px-3">Quantity</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {lowStockProducts?.map((product) => (
//                                     <tr key={product._id} className="border-b hover:bg-gray-50">
//                                         <td className="py-2 px-3">{product.categoryId?.name || "N/A"}</td>
//                                         <td className="py-2 px-3 text-red-700">{product.name}</td>
//                                         <td className="py-2 px-3">{product.quantity}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                 </div>
//             </div>

            

//             <ProductSegmentation/>
//         </div>
//   );
// }


"use client";

import BestSellingProducts from "@/Features/DashboardOverview/BestSellingProducts";
import ProductSegmentation from "@/Features/DashboardOverview/ProductSegmentation";
import SalesOverview from "@/Features/DashboardOverview/SalesOverview";
import MonthlyReport from "@/Features/DashboardOverview/MonthlyReport";
import { useGetInventoryQuery } from "@/redux/api/auth/inventory/inventoryApi";
import { useGetProspectsQuery } from "@/redux/api/auth/prospact/prospactApi";
import { useRouter } from "next/navigation"; // Import useRouter
import { useEffect, useState } from "react";
import { Prospect, ProspectsResponse } from "@/types";

export default function Dashboard(): React.ReactElement {
  const { data, isLoading, isError } = useGetInventoryQuery();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const allProducts = data?.data ;
  const lowStockProducts = allProducts?.filter(
    (product) => product.quantity < product.reorderPointOfQuantity
  );


  // Fetch prospects with RTK Query
  const { data: prospectsResponse, error, refetch } = useGetProspectsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    if (prospectsResponse) {
      const today = new Date().toISOString().split("T")[0];
      console.log(today);
      const filteredProspects = prospectsResponse.data.filter((prospect) =>
        prospect.followUpActivities?.some(
          (activity) => activity.activityDate === today
        )
      );
      setProspects(filteredProspects);
    }
  }, [prospectsResponse]);

  console.log("prospectsResponse",prospectsResponse);

  // Handler for View button
  const handleViewProspect = (prospectId: string) => {
    router.push(`/dashboard/update-prospact/${prospectId}`); // Navigate to update-prospact page
  };

  // console.log("prostpact data",data)
const actualCustomers :Prospect[]|undefined =prospectsResponse?.data.filter(customer => customer?.status !== "converted")||[]

  return (
    <div className="p-4 md:p-2 space-y-6">
      {/* Section 1: Sales Overview */}
      <SalesOverview />

      {/* Section 2: Best Selling Products & Weekly Report */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {/* Prospect follow ups for today */}
          <div className="w-full h-48 bg-white shadow-md rounded-2xl mb-3 p-5 overflow-auto">
            <p className="text-lg font-semibold mb-3 text-blue-800">
              📞 {actualCustomers.length} Prospect follow-ups for today
            </p>
            <table className="min-w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="py-2 px-3">Store Name</th>
                  <th className="py-2 px-3">Contact Person</th>
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {actualCustomers?.length > 0 ? (
                  actualCustomers?.map((prospect) => (
                    <tr key={prospect._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{prospect.storeName || "N/A"}</td>
                      <td className="py-2 px-3 text-black">{prospect.storePersonName || "N/A"}</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => handleViewProspect(prospect._id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-center text-gray-500">
                      No follow-ups scheduled for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <BestSellingProducts />
        </div>
        <div>
          <div>
            <MonthlyReport />
          </div>
          <div className="w-full h-56 bg-white shadow-md rounded-2xl mt-2 p-5 overflow-auto">
            <p className="text-lg font-semibold mb-3 text-red-700">
              ⚠️ {lowStockProducts?.length} low stock products
            </p>
            <table className="min-w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-3">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts?.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{product.categoryId?.name || "N/A"}</td>
                    <td className="py-2 px-3 text-red-700">{product.name}</td>
                    <td className="py-2 px-3">{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ProductSegmentation />
    </div>
  );
}
