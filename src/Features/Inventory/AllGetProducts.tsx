


"use client";
import Cookies from "js-cookie";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, PlusCircle } from "lucide-react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import {
  useGetInventoryQuery,
  useDeleteInventoryMutation,
  useUpdateInventoryMutation,
  payload,
  UpdateInventoryPayload,
} from "@/redux/api/auth/inventory/inventoryApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loading from "@/redux/Shared/Loading";
import BestLoding from "@/components/Loding/Loding";
import ErrorState from "@/redux/Shared/ErrorState";
import ProductFiltersModal from "./FilterModal";
import { ImFilePdf } from "react-icons/im";
import { useGetCategoriesQuery } from "@/redux/api/category/categoryApi";

export default function AllGetProducts() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isBestLoading,setIsBestLoading]=useState(false)
  const itemsPerPage = 20;
  const router = useRouter();
  const { data, isLoading, isError } = useGetInventoryQuery();
  const [deleteInventory] = useDeleteInventoryMutation();
  const [updateInventory] = useUpdateInventoryMutation();
  const products: payload[] = data?.data ?? [];
  console.log("get data", products);
 const [activeFilters, setActiveFilters] = useState({
    category: "",
    product: "",
    outOfStock: false,
    lowStock: false,
  });


  // get category data 
 const { data: categoryData } = useGetCategoriesQuery(); // Removed unused refetch
  const categoriesData: { _id: string; name: string }[] = categoryData?.data ?? [];

const handleApplyFilters = (newFilters:any) => {

    setActiveFilters(newFilters);

    setIsModalOpen(false); // Close the modal after applying filters

    setCurrentPage(1); // Reset to the first page when filters change

   

  };
   const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.categoryId?.name?.toLowerCase() ?? "").includes(search.toLowerCase());

    const matchesCategory = activeFilters.category
      ? (product.categoryId?.name || "") === activeFilters.category
      : true;

    const matchesProduct = activeFilters.product
      ? product.name === activeFilters.product
      : true;

    const matchesOutOfStock = activeFilters.outOfStock
      ? (product.quantity ?? 0) === 0
      : true;

   const matchesLowStock = activeFilters.lowStock
  ? (product.quantity ?? 0) < 50 && (product.quantity ?? 0) > 0 
  : true;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesProduct &&
      matchesOutOfStock &&
      matchesLowStock
    );
  });
  // Filter products based on search
  // const filteredProducts = products.filter((product) =>
  //   product.name.toLowerCase().includes(search.toLowerCase()) ||
  //   (product.categoryId?.name?.toLowerCase() ?? "").includes(search.toLowerCase())
  // );


  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Get current page data
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate profit percentage dynamically
  const calculateProfitPercentage = (purchasePrice: number, salesPrice: number) => {
    if (purchasePrice === 0) return 0;
    const profit = salesPrice - purchasePrice;
    return ((profit / purchasePrice) * 100).toFixed(2);
  };

  // State for modals
  const [selectedProduct, setSelectedProduct] = useState<payload | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Permission check (replace with your auth logic)
  const hasDeletePermission = true; // Placeholder

  // Handle delete action
  const handleDelete = async (_id: string) => {
    if (!hasDeletePermission) {
      toast.error("You do not have permission to delete this product.");
      return;
    }
    try {
      await deleteInventory(_id).unwrap();
      setIsDeleteOpen(false);
      toast.success(' Product deleted Successfully !')
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct?._id) return;

    try {
      // Build the update payload
      const payload: UpdateInventoryPayload = {
        _id: selectedProduct._id,
        name: selectedProduct.name,
        description: selectedProduct.description,
        packetSize: selectedProduct.packetSize,
        weight: selectedProduct.weight,
        weightUnit: selectedProduct.weightUnit,
        categoryId:
          typeof selectedProduct.categoryId === "object"
            ? selectedProduct.categoryId._id
            : selectedProduct.categoryId ?? "",
        reorderPointOfQuantity: selectedProduct.reorderPointOfQuantity,
        quantity: selectedProduct.quantity,
        warehouseLocation: selectedProduct.warehouseLocation,
        purchasePrice: selectedProduct.purchasePrice,
        salesPrice: selectedProduct.salesPrice,
        competitorPrice: selectedProduct.competitorPrice,
        barcodeString: selectedProduct.barcodeString,
        packageDimensions: selectedProduct.packageDimensions,
      };

      console.log("product update",payload)

      const updatedProduct = await updateInventory(payload).unwrap();

      // Update local state if needed
      setSelectedProduct(updatedProduct);
      setIsUpdateOpen(false);
      toast.success("Product updated successfully!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(`Failed to update: ${error?.data?.message || "Unexpected error"}`);
    }
  };

  
  const handleDownloadExcel = async () => {
 setIsBestLoading(true)
  try {
    const token = Cookies?.get("token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/order/bulk-order-excel-empty?download=true`,{
         headers: {
    'Content-Type': 'application/json',
    'Authorization': `${token}`,
  },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Excel file");
    }

 
    const data = await response.arrayBuffer();

   
    const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }); 

    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    
    link.download = `order_repo.xlsx`; 
  
   
    document.body.appendChild(link);
    
   
    link.click(); 
    
   
    document.body.removeChild(link); 

    
    URL.revokeObjectURL(link.href);
     setIsBestLoading(false)
  } catch (err) {
    console.error("Error downloading Excel file:", err);
    setIsBestLoading(false)
  }
};

  const handleDownload = async () => {
    setIsBestLoading(true)
    const token = Cookies?.get("token");
    console.log(token)
    if (!token) {
      console.error('Authentication token not found. Please log in.');
      return; // Stop execution if no token
    }
    try {
      // Fetch the PDF as a binary response (arrayBuffer)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/product/all-products-pdf`,{
           headers: {
          'Authorization': `${token}`, // Add the Bearer token
          'Content-Type': 'application/json', // Good practice, though PDF download might not strictly need it
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
      setIsBestLoading(false)
    } catch (err) {
      console.log(err);
       setIsBestLoading(false)
    }
  };


  if (isLoading) {
    return <Loading title="All Product Loading..." message="all product fetch successfully " />;
  }

  if (isError) {
    return <ErrorState title="loading error" message="fetching error" />;
  }

  return (
    <div className="p-4">

      {isBestLoading && <BestLoding/>}
      {/* Search and Controls */}
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search product..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            Filter
          </Button>
          <Button
            className="bg-red-600 cursor-pointer hover:bg-red-700 text-white gap-2"
            onClick={() => router.push("/dashboard/add-product")}
          >
            <PlusCircle className="h-4 w-4" /> Add Product
          </Button>
          {/* Export to XL Button with icon only */}
          <Button onClick={handleDownload} className="bg-[#D9D9D9]" size="icon">
                      <ImFilePdf className="w-5 h-5 text-black" />
                    </Button>
                    <Button onClick={handleDownloadExcel} className="bg-[#D9D9D9]" size="icon">
                                <FaFileExcel className="w-5 h-5 text-black" />
                              </Button>
                   
        </div>
      </div>
      {/* add dialog */}
 <ProductFiltersModal open={isModalOpen}
        onOpenChange={setIsModalOpen}
        filterData={products} 
        onApplyFilters={handleApplyFilters} 
        currentFilters={activeFilters}/>
      {/* Product Table */}
      <Table className="w-full overflow-x-auto">
        <TableHeader>
          <TableRow className="bg-gray-100 text-gray-700">
            {[, "Product Name","Category", "Qty", "Incoming Qty", "Purchase Price", "Sales Price", "Profit", "Profit %", "Competitor Price", "Action"].map((heading, index) => (
              <TableHead key={index} className="p-2 whitespace-nowrap font-medium text-left">
                <div className="flex items-center gap-1">
                  {heading}
                  {heading !== "Action" && <ArrowUpDown className="w-3 h-3" />}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredProducts?.map((product, idx) => (
            <TableRow key={idx} className="text-sm">
              <TableCell className="text-blue-600 underline cursor-pointer">
                <button
              
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsUpdateOpen(true);
                    
                  }}
                  className="cursor-pointer"
                >
                  {product.name}
                </button>
              </TableCell>
              <TableCell>{product.categoryId?.name || ""}</TableCell>
              {/* <TableCell>{product.quantity?.toLocaleString() ?? ""}</TableCell> */}
              <TableCell>{product.quantity?.toLocaleString() ?? ""}</TableCell>
            <TableCell>{product.incomingQuantity?.toLocaleString() ?? ""}</TableCell>
              <TableCell>
                {product.purchasePrice ? `$${product.purchasePrice.toFixed(2)}` : ""}
              </TableCell>
              <TableCell>
                {product.salesPrice ? `$${product.salesPrice.toFixed(2)}` : ""}
              </TableCell>
              <TableCell>
                {product.salesPrice && product.purchasePrice
                  ? `$${(product.salesPrice - product.purchasePrice).toFixed(2)}`
                  : ""}
              </TableCell>
              <TableCell>
                {product.purchasePrice && product.salesPrice
                  ? `${calculateProfitPercentage(product.purchasePrice, product.salesPrice)}%`
                  : ""}
              </TableCell>
              <TableCell>
                {product.competitorPrice ? `$${product.competitorPrice.toFixed(2)}` : ""}
              </TableCell>
              <TableCell>
                <span className="inline-flex space-x-2">
                  <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <svg
                          width="20"
                          height="21"
                          viewBox="0 0 20 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10.0002 4.66669C15.1085 4.66669 17.5258 8.09166 18.3768 9.69284C18.6477 10.2027 18.6477 10.7974 18.3768 11.3072C17.5258 12.9084 15.1085 16.3334 10.0002 16.3334C4.89188 16.3334 2.4746 12.9084 1.62363 11.3072C1.35267 10.7974 1.35267 10.2027 1.62363 9.69284C2.4746 8.09166 4.89188 4.66669 10.0002 4.66669ZM5.69716 7.56477C4.31361 8.48147 3.50572 9.70287 3.09536 10.475C3.09078 10.4836 3.08889 10.4896 3.08807 10.4929C3.08724 10.4962 3.08708 10.5 3.08708 10.5C3.08708 10.5 3.08724 10.5038 3.08807 10.5071C3.08889 10.5104 3.09078 10.5164 3.09536 10.525C3.50572 11.2972 4.31361 12.5186 5.69716 13.4353C5.12594 12.5995 4.79188 11.5888 4.79188 10.5C4.79188 9.41127 5.12594 8.40055 5.69716 7.56477ZM14.3033 13.4353C15.6868 12.5186 16.4947 11.2972 16.905 10.525C16.9096 10.5164 16.9115 10.5104 16.9123 10.5071C16.9129 10.505 16.9133 10.5019 16.9133 10.5019L16.9133 10.5L16.913 10.4964L16.9123 10.4929C16.9115 10.4896 16.9096 10.4836 16.905 10.475C16.4947 9.70288 15.6868 8.48148 14.3033 7.56478C14.8745 8.40056 15.2085 9.41128 15.2085 10.5C15.2085 11.5888 14.8745 12.5995 14.3033 13.4353ZM6.45854 10.5C6.45854 8.54401 8.0442 6.95835 10.0002 6.95835C11.9562 6.95835 13.5419 8.54401 13.5419 10.5C13.5419 12.456 11.9562 14.0417 10.0002 14.0417C8.0442 14.0417 6.45854 12.456 6.45854 10.5Z"
                            fill="#667085"
                          />
                        </svg>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl!">
                      <DialogHeader>
                        <DialogTitle>Product Details</DialogTitle>
                      </DialogHeader>
                      {selectedProduct && (
                        <div className="space-y-4 md:grid grid-cols-2">
                          <div>
                            <p><strong>ID:</strong> {selectedProduct._id}</p>
                            <p><strong>Name:</strong> {selectedProduct.name}</p>
                            <p><strong>Category:</strong> {selectedProduct.categoryId?.name || "N/A"}</p>
                            <p><strong>Description:</strong> {selectedProduct.description || "N/A"}</p>
                            <p><strong>Item Number:</strong> {selectedProduct.itemNumber || "N/A"}</p>
                            <p><strong>Barcode:</strong> {selectedProduct.barcodeString || "N/A"}</p>
                            <p><strong>Packet Size:</strong> {selectedProduct.packetSize || "N/A"}</p>
                            <p><strong>Weight:</strong> {selectedProduct.weight} {selectedProduct.weightUnit}</p>
                            <p><strong>Quantity:</strong> {selectedProduct.quantity?.toLocaleString() ?? "N/A"}</p>
                            <p><strong>Reorder Point:</strong> {selectedProduct.reorderPointOfQuantity}</p>
                            <p><strong>Warehouse Location:</strong> {selectedProduct.warehouseLocation || "N/A"}</p>
                          </div>
                          <div>
                            <p><strong>Purchase Price:</strong> ${selectedProduct.purchasePrice?.toFixed(2) ?? "N/A"}</p>
                            <p><strong>Sales Price:</strong> ${selectedProduct.salesPrice?.toFixed(2) ?? "N/A"}</p>
                            <p><strong>Profit:</strong> ${(selectedProduct.salesPrice && selectedProduct.purchasePrice
                              ? (selectedProduct.salesPrice - selectedProduct.purchasePrice).toFixed(2)
                              : "N/A")}</p>
                            <p><strong>Profit %:</strong> {selectedProduct.purchasePrice && selectedProduct.salesPrice
                              ? `${calculateProfitPercentage(selectedProduct.purchasePrice, selectedProduct.salesPrice)}%`
                              : "N/A"}</p>
                            <p><strong>Competitor Price:</strong> ${selectedProduct.competitorPrice?.toFixed(2) ?? "N/A"}</p>
                            <p><strong>Package Dimensions:</strong> {selectedProduct.packageDimensions?.length} x {selectedProduct.packageDimensions?.width} x {selectedProduct.packageDimensions?.height} {selectedProduct.packageDimensions?.unit}</p>
                            <p><strong>Created At:</strong> {new Date(selectedProduct.createdAt).toLocaleString()}</p>
                            <p><strong>Updated At:</strong> {new Date(selectedProduct.updatedAt).toLocaleString()}</p>
                          </div>
                          <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <svg
                          width="20"
                          height="21"
                          viewBox="0 0 20 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M17.3047 7.3201C18.281 6.34379 18.281 4.76087 17.3047 3.78456L16.7155 3.19531C15.7391 2.219 14.1562 2.219 13.1799 3.19531L3.69097 12.6843C3.34624 13.029 3.10982 13.467 3.01082 13.9444L2.34111 17.1737C2.21932 17.7609 2.73906 18.2807 3.32629 18.1589L6.55565 17.4892C7.03302 17.3902 7.47103 17.1538 7.81577 16.809L17.3047 7.3201ZM16.1262 4.96307L15.5369 4.37382C15.2115 4.04838 14.6839 4.04838 14.3584 4.37382L13.4745 5.25773L15.2423 7.0255L16.1262 6.14158C16.4516 5.81615 16.4516 5.28851 16.1262 4.96307ZM14.0638 8.20401L12.296 6.43624L4.86948 13.8628C4.75457 13.9777 4.67577 14.1237 4.64277 14.2828L4.23082 16.2692L6.21721 15.8572C6.37634 15.8242 6.52234 15.7454 6.63726 15.6305L14.0638 8.20401Z"
                            fill="#667085"
                          />
                        </svg>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl!">
                      <DialogHeader>
                        <DialogTitle>Update Product Details</DialogTitle>
                      </DialogHeader>
                      {selectedProduct && (
                        <form onSubmit={handleUpdate} className="space-y-4">
                          <div className="min-[0px]:grid-cols-1 md:grid-cols-2 grid gap-4">
                            <div>
                              <Label className="mb-1" htmlFor="name">Product Name</Label>
                              <Input
                                id="name"
                                value={selectedProduct.name || ""}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                                placeholder="Product Name"
                                required
                              />
                            </div>
                            <div>
                              <Label className="mb-1" htmlFor="description">Description</Label>
                              <Input
                                id="description"
                                value={selectedProduct.description ?? ""}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                                placeholder="Description"
                              />
                            </div>
                            <div>
                              <Label className="mb-1" htmlFor="packetSize">Packet Size</Label>
                              <Input
                                id="packetSize"
                                value={selectedProduct.packetSize ?? ""}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, packetSize: e.target.value })}
                                placeholder="Packet Size"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="mb-1" htmlFor="weight">Weight</Label>
                                <Input
                                  id="weight"
                                  value={selectedProduct.weight?.toString() ?? "0"}
                                  onChange={(e) => setSelectedProduct({ ...selectedProduct, weight: parseFloat(e.target.value) || 0 })}
                                  type="number"
                                  step="0.1"
                                  placeholder="Weight"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="mb-1" htmlFor="weightUnit">Unit</Label>
                                <Input
                                  id="weightUnit"
                                  value={selectedProduct.weightUnit ?? ""}
                                  onChange={(e) => setSelectedProduct({ ...selectedProduct, weightUnit: e.target.value })}
                                  placeholder="Unit (e.g., KILOGRAM)"
                                  required
                                />
                              </div>
                            </div>
                            {/* <div>
                              <Label className="mb-1" htmlFor="categoryId">Category ID</Label>
                              <Input
                                id="categoryId"
                                value={selectedProduct?.categoryId?.name || ""}
                             
                                placeholder="Category ID"
                              />
                            </div> */}

                              <div>
  <label className="block text-sm font-medium text-gray-700">Category *</label>
  <select
    name="categoryId"
    value={
      typeof selectedProduct?.categoryId === "object"
        ? selectedProduct?.categoryId?._id || ""
        : selectedProduct?.categoryId || ""
    }
    onChange={(e) =>
      setSelectedProduct({
        ...selectedProduct,
        categoryId: {_id: e.target.value,name:selectedProduct.name}, // Update categoryId, not _id
      })
    }
    className="mt-1 p-2 w-full border rounded"
    required
  >
    <option value="">Select Category</option>
    {categoriesData.map((cat) => (
      <option key={cat._id} value={cat._id}>
        {cat.name}
      </option>
    ))}
  </select>
</div>
                            <div>
                              <Label className="mb-1" htmlFor="reorderPoint">Reorder Point</Label>
                              <Input
                                id="reorderPoint"
                                value={selectedProduct.reorderPointOfQuantity?.toString() ?? "0"}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, reorderPointOfQuantity: parseInt(e.target.value) || 0 })}
                                type="number"
                                placeholder="Reorder Point"
                                required
                              />
                            </div>
                            <div>
                              <Label className="mb-1" htmlFor="quantity">Quantity</Label>
                              <Input
                                id="quantity"
                                value={selectedProduct.quantity?.toString() ?? "0"}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, quantity: parseInt(e.target.value) || 0 })}
                                type="number"
                                placeholder="Quantity"
                                required
                              />
                            </div>
                            <div>
                              <Label className="mb-1" htmlFor="warehouseLocation">Warehouse Location</Label>
                              <Input
                                id="warehouseLocation"
                                value={selectedProduct.warehouseLocation ?? ""}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, warehouseLocation: e.target.value })}
                                placeholder="Warehouse Location"
                                required
                              />
                            </div>
                            <div>
                              <Label className="mb-1" htmlFor="purchasePrice">Purchase Price</Label>
                              <Input
                                id="purchasePrice"
                                value={selectedProduct.purchasePrice?.toString() ?? "0"}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, purchasePrice: parseFloat(e.target.value) || 0 })}
                                type="number"
                                step="0.01"
                                placeholder="Purchase Price"
                                required
                              />
                            </div>
                            <div>
                              <Label className="mb-1" htmlFor="salesPrice">Sales Price</Label>
                              <Input
                                id="salesPrice"
                                value={selectedProduct.salesPrice?.toString() ?? "0"}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, salesPrice: parseFloat(e.target.value) || 0 })}
                                type="number"
                                step="0.01"
                                placeholder="Sales Price"
                                required
                              />
                            </div>
                            <div>
                              <Label className="mb-1" htmlFor="competitorPrice">Competitor Price</Label>
                              <Input
                                id="competitorPrice"
                                value={selectedProduct.competitorPrice?.toString() ?? "0"}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, competitorPrice: parseFloat(e.target.value) || 0 })}
                                type="number"
                                step="0.01"
                                placeholder="Competitor Price"
                                required
                              />
                            </div>
                            <div>
                              <Label className="mb-1" htmlFor="barcode">Barcode</Label>
                              <Input
                                id="barcode"
                                value={selectedProduct.barcodeString ?? ""}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, barcodeString: e.target.value })}
                                placeholder="Barcode"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <Label className="mb-1" htmlFor="length">Length</Label>
                                <Input
                                  id="length"
                                  value={selectedProduct.packageDimensions?.length?.toString() ?? "0"}
                                  onChange={(e) => setSelectedProduct({
                                    ...selectedProduct,
                                    packageDimensions: { ...selectedProduct.packageDimensions, length: parseFloat(e.target.value) || 0 }
                                  })}
                                  type="number"
                                  step="0.1"
                                  placeholder="Length"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="mb-1" htmlFor="width">Width</Label>
                                <Input
                                  id="width"
                                  value={selectedProduct.packageDimensions?.width?.toString() ?? "0"}
                                  onChange={(e) => setSelectedProduct({
                                    ...selectedProduct,
                                    packageDimensions: { ...selectedProduct.packageDimensions, width: parseFloat(e.target.value) || 0 }
                                  })}
                                  type="number"
                                  step="0.1"
                                  placeholder="Width"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="mb-1" htmlFor="height">Height</Label>
                                <Input
                                  id="height"
                                  value={selectedProduct.packageDimensions?.height?.toString() ?? "0"}
                                  onChange={(e) => setSelectedProduct({
                                    ...selectedProduct,
                                    packageDimensions: { ...selectedProduct.packageDimensions, height: parseFloat(e.target.value) || 0 }
                                  })}
                                  type="number"
                                  step="0.1"
                                  placeholder="Height"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="mb-1" htmlFor="unit">Unit</Label>
                                <Input
                                  id="unit"
                                  value={selectedProduct.packageDimensions?.unit ?? ""}
                                  onChange={(e) => setSelectedProduct({
                                    ...selectedProduct,
                                    packageDimensions: { ...selectedProduct.packageDimensions, unit: e.target.value }
                                  })}
                                  placeholder="Unit (e.g., CM)"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="submit">Save Changes</Button>
                            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
                          </div>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                        disabled={!hasDeletePermission}
                      >
                        <svg
                          width="16"
                          height="17"
                          viewBox="0 0 16 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6.33317 6.62502C6.79341 6.62502 7.1665 6.99812 7.1665 7.45835V12.4584C7.1665 12.9186 6.79341 13.2917 6.33317 13.2917C5.87293 13.2917 5.49984 12.9186 5.49984 12.4584V7.45835C5.49984 6.99812 5.87293 6.62502 6.33317 6.62502Z"
                            fill="#667085"
                          />
                          <path
                            d="M10.4998 7.45835C10.4998 6.99812 10.1267 6.62502 9.6665 6.62502C9.20627 6.62502 8.83317 6.99812 8.83317 7.45835V12.4584C8.83317 12.9186 9.20627 13.2917 9.6665 13.2917C10.1267 13.2917 10.4998 12.9186 10.4998 12.4584V7.45835Z"
                            fill="#667085"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12.9998 3.50002V2.66669C12.9998 1.28598 11.8806 0.166687 10.4998 0.166687H5.49984C4.11913 0.166687 2.99984 1.28598 2.99984 2.66669V3.50002H1.74984C1.2896 3.50002 0.916504 3.87312 0.916504 4.33335C0.916504 4.79359 1.2896 5.16669 1.74984 5.16669H2.1665V14.3334C2.1665 15.7141 3.28579 16.8334 4.6665 16.8334H11.3332C12.7139 16.8334 13.8332 15.7141 13.8332 14.3334V5.16669H14.2498C14.7101 5.16669 15.0832 4.79359 15.0832 4.33335C15.0832 3.87312 14.7101 3.50002 14.2498 3.50002H12.9998ZM10.4998 1.83335H5.49984C5.0396 1.83335 4.6665 2.20645 4.6665 2.66669V3.50002H11.3332V2.66669C11.3332 2.20645 10.9601 1.83335 10.4998 1.83335ZM12.1665 5.16669H3.83317V14.3334C3.83317 14.7936 4.20627 15.1667 4.6665 15.1667H11.3332C11.7934 15.1667 12.1665 14.7936 12.1665 14.3334V5.16669Z"
                            fill="#667085"
                          />
                        </svg>
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                      </DialogHeader>
                      {selectedProduct && (
                        <div className="space-y-4">
                          <p>Are you sure you want to delete <strong>{selectedProduct.name}</strong>?</p>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(selectedProduct._id)}
                              disabled={!hasDeletePermission}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
        <p>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{" "}
          {filteredProducts.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            className="px-2 py-1 border rounded"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            «
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-2 py-1 border rounded ${page === currentPage ? "bg-gray-200" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="px-2 py-1 border rounded"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            »
          </button>
          <select
            className="ml-2 border px-2 py-1 rounded"
            value={itemsPerPage}
            onChange={(e) => setCurrentPage(1)} // Reset to page 1 on change
          >
            <option value="20">20</option>
          </select>
        </div>
      </div>
    </div>
  );
}