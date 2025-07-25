




"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, PlusCircle, Eye, Edit, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetContainersQuery, useImportContainerExcelMutation } from "@/redux/api/auth/container/containerApi";
import { Container } from "@/redux/api/auth/container/containerApi";
import { useDeleteContainerMutation } from "@/redux/api/auth/container/containerApi";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import Loading from "@/redux/Shared/Loading";

export default function ContainerTable() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [containerToDelete, setContainerToDelete] = useState<string | null>(null);

    // Import dialog states
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [containerName, setContainerName] = useState("");
    // Add containerNumber state
    const [containerNumber, setContainerNumber] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [containerStatus, setContainerStatus] = useState("arrived");
    const [shippingCost, setShippingCost] = useState("");

    const [importContainerExcel, { isLoading: isImporting }] = useImportContainerExcelMutation();

    const {
        data: response,
        isLoading,
        error,
    } = useGetContainersQuery();



    const [deleteContainer] = useDeleteContainerMutation();

    const containers: Container[] = response?.data || [];

    console.log("container data ", containers)

    // const filteredData: Container[] = useMemo(() => {
    //     return containers.filter((c) =>
    //         `${c.containerName} ${c.containerNumber}`.toLowerCase().includes(search.toLowerCase())
    //     );
    // }, [search, containers]);


     const filteredData = containers.filter((cont) =>
    cont.containerName.toLowerCase().includes(search.toLowerCase()) || cont.containerNumber.toLowerCase().includes(search.toLowerCase())
  );


    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData: Container[] = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [currentPage, filteredData]);

    if (isLoading) return (
        <Loading title="Loading containers..." message="All Container Table data Fetching" />
    )
    if (error) return <div className="p-4 text-red-500">Error loading data.</div>;

    const handleDelete = async (id: string) => {
        try {
            await deleteContainer(id).unwrap();
            toast.success("Container deleted successfully", {
                duration: 3000,
            });
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete container", {
                duration: 3000,
            });
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const isExcel = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                file.type === "application/vnd.ms-excel" ||
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.xls');

            if (isExcel) {
                setSelectedFile(file);
            } else {
                toast.error("Please select a valid Excel (.xlsx or .xls) file");
                event.target.value = "";
            }
        }
    };

    const resetImportForm = () => {
        setSelectedFile(null);
        setContainerName("");
        setContainerNumber(""); // Reset container number
        setDeliveryDate("");
        setContainerStatus("arrived");
        setShippingCost("");
        // Reset file input
        const fileInput = document.getElementById('excel-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const handleImport = async () => {
        if (!selectedFile) {
            toast.error("Please select an Excel file");
            return;
        }

        if (!containerName.trim()) {
            toast.error("Please enter a container name");
            return;
        }
        // Add validation for containerNumber
        if (!containerNumber.trim()) {
            toast.error("Please enter a container number");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("containerName", containerName.trim());
        formData.append("containerNumber", containerNumber.trim()); // Append containerNumber
        formData.append("deliveryDate", deliveryDate || new Date().toISOString().split('T')[0]);
        formData.append("containerStatus", containerStatus);
        formData.append("shippingCost", shippingCost || "0");

        try {
            const result = await importContainerExcel(formData).unwrap();
            toast.success("Container imported successfully!", {
                duration: 3000,
            });
            setImportDialogOpen(false);
            resetImportForm();
        } catch (err: any) {
            console.error("Import failed:", err);
            const errorMessage = err?.data?.message || err?.message || "Failed to import container";
            toast.error(errorMessage, {
                duration: 4000,
            });
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Input
                    placeholder="Search by Container Name or Number..."
                    className="max-w-sm"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />
                <div className="flex gap-2">
                    <Button
                        className="bg-red-600 cursor-pointer hover:bg-red-700 text-white gap-2"
                        onClick={() => router.push("/dashboard/add-container")}
                    >
                        <PlusCircle className="h-4 w-4" /> Add Container
                    </Button>

                    {/* Import Excel Dialog */}
                    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="text-gray-600 border hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Import Excel
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Import Container from Excel</DialogTitle>
                                <DialogDescription>
                                    Upload an Excel file with container products data. Fill in the container details below.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {/* File Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Excel File *</label>
                                    <input
                                        id="excel-file-input"
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileSelect}
                                        className="w-full p-2 border border-gray-300 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                    />
                                    {selectedFile && (
                                        <p className="text-sm text-green-600">
                                            Selected: {selectedFile.name}
                                        </p>
                                    )}
                                </div>

                                {/* Container Number */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Container Number *</label>
                                    <Input
                                        placeholder="e.g., C12345"
                                        value={containerNumber}
                                        onChange={(e) => setContainerNumber(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Container Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Container Name *</label>
                                    <Input
                                        placeholder="e.g., Container India"
                                        value={containerName}
                                        onChange={(e) => setContainerName(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Delivery Date */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Delivery Date</label>
                                    <Input
                                        type="date"
                                        value={deliveryDate}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Container Status */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <select
                                        value={containerStatus}
                                        onChange={(e) => setContainerStatus(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                                    >
                                        <option value="arrived">Arrived</option>
                                        <option value="onTheWay">On The Way</option>
                                    </select>
                                </div>

                                {/* Shipping Cost */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Shipping Cost</label>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 200"
                                        value={shippingCost}
                                        onChange={(e) => setShippingCost(e.target.value)}
                                        className="w-full"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setImportDialogOpen(false);
                                        resetImportForm();
                                    }}
                                    disabled={isImporting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={!selectedFile || !containerName.trim() || !containerNumber.trim() || isImporting}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isImporting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Importing...
                                        </>
                                    ) : (
                                        "Import Container"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="overflow-auto rounded border">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            {["Container No", "Container Name", "Status", "Arrived Date", "Purchase Cost", " Shipping Cost", "Total Cost", "Action"].map(
                                (heading, i) => (
                                    <th key={i} className="p-2 whitespace-nowrap font-medium">
                                        <div className="flex items-center gap-1">
                                            {heading}
                                            {heading !== "Action" && <ArrowUpDown className="w-3 h-3" />}
                                        </div>
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row) => {
                            const purchaseCost = row.containerProducts.length > 0
                                ? row.containerProducts.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0).toFixed(2)
                                : "0.00";
                            const totalCost = row.containerProducts.length > 0
                                ? (parseFloat(purchaseCost) + row.shippingCost).toFixed(2)
                                : row.shippingCost.toFixed(2);

                            return (
                                <tr key={row._id} className="border-t hover:bg-gray-50">
                                    <td className="p-2 whitespace-nowrap">{row.containerNumber}</td>
                                    <td className="p-2 whitespace-nowrap">{row.containerName}</td>
                                    <td className="p-2 whitespace-nowrap">{row.containerStatus}</td>
                                    <td className="p-2 whitespace-nowrap">{row.deliveryDate || "N/A"}</td>
                                    <td className="p-2 whitespace-nowrap">${purchaseCost}</td>
                                    <td className="p-2 whitespace-nowrap">${row.shippingCost}</td>
                                    <td className="p-2 whitespace-nowrap">${totalCost}</td>
                                    <td className="p-2 whitespace-nowrap flex gap-2">
                                        <Eye
                                            className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-700"
                                            onClick={() => {
                                                setSelectedContainer(row);
                                                setIsModalOpen(true);
                                            }}
                                        />
                                        <Edit
                                            className="w-4 h-4 text-gray-500 cursor-pointer hover:text-yellow-700"
                                            onClick={() => router.push(`/dashboard/edit-container/${row._id}`)}
                                        />
                                        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-700"
                                                    onClick={() => {
                                                        setContainerToDelete(row._id);
                                                    }}
                                                />
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete container {row.containerNumber}? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => containerToDelete && handleDelete(containerToDelete)}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
                <p>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to
                    {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                </p>
                <div className="flex items-center gap-1">
                    <button
                        className="px-2 py-1 border rounded"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    >
                        «
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-2 py-1 border rounded ${page === currentPage ? "bg-gray-200" : ""}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        className="px-2 py-1 border rounded"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    >
                        »
                    </button>
                </div>
            </div>

            {isModalOpen && selectedContainer && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Container Details</h2>
                        <div className="space-y-4">
                            <p><strong>Container Number:</strong> {selectedContainer.containerNumber}</p>
                            <p><strong>Container Name:</strong> {selectedContainer.containerName}</p>
                            <p><strong>Status:</strong> {selectedContainer.containerStatus}</p>
                            <p><strong>Delivery Date:</strong> {selectedContainer.deliveryDate || 'N/A'}</p>
                            <p><strong>Shipping Cost:</strong> ${selectedContainer.shippingCost}</p>
                            <h3 className="text-lg font-semibold mt-4">Products:</h3>
                            <table className="w-full mt-2 border-collapse">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border p-2">Category</th>
                                        <th className="border p-2">Item Number</th>
                                        <th className="border p-2">Quantity</th>
                                        <th className="border p-2">Per Case Cost</th>
                                        <th className="border p-2">per Case Shipping Cost</th>
                                        <th className="border p-2">Sales Price</th>
                                        <th className="border p-2">Purchase Price</th>
                                        <th className="border p-2">Packet Size</th> {/* Added Packet Size column header */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedContainer.containerProducts.map((prod) => (
                                        <tr key={prod._id} className="border-t">
                                            <td className="border p-2">{prod.category}</td>
                                            <td className="border p-2">{prod.itemNumber}</td>
                                            <td className="border p-2">{prod.quantity}</td>
                                            <td className="border p-2">
                                            {prod.perCaseCost !== undefined && prod.perCaseCost !== null
                                              ? parseFloat(String(prod.perCaseCost)).toFixed(3)
                                              : '-'}
                                          </td>
                                          <td className="border p-2">
                                            {prod.perCaseShippingCost !== undefined && prod.perCaseShippingCost !== null
                                              ? parseFloat(String(prod.perCaseShippingCost)).toFixed(3)
                                              : '-'}
                                          </td>
                                            <td className="border p-2">${prod.salesPrice}</td>
                                            <td className="border p-2">${prod.purchasePrice}</td>
                                            <td className="border p-2">{prod.packetSize || 'N/A'}</td> {/* Display Packet Size */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            className="mt-4 bg-red-500 text-white p-2 py-1 px-4 rounded"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}