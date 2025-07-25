"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Cookies from "js-cookie";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Edit,
  Eye,
  FileText,
  Download,
  MoreHorizontal,
  DollarSign,
} from "lucide-react";
import { useGiteSingleOrderQuery } from "./orderManagementApi";
import { ImFilePdf } from "react-icons/im";
import Link from "next/link";
import Loading from "@/components/Loding/Loding";


const OrderDeatils = ({ id }: { id: string }) => {

  const [isBestLoading,setIsBestLoading]=useState(false)
  const { data, isError, isLoading } = useGiteSingleOrderQuery(id);
  console.log("order deatils data", data);
  const [searchQuery, setSearchQuery] = useState("");

  const orderData = [
    {
      productName: "Tea Masala",
      itemNumber: "#322552",
      batchNumber: "-",
      categoryName: "Tea Masala",
      quantity: 20,
      price: 5.3,
      discount: 5.0,
      netPrice: 5.3,
      profit: "5.2.3",
      scanStatus: "Scanned",
    },
    {
      productName: "Tea Masala",
      itemNumber: "#322552",
      batchNumber: "-",
      categoryName: "Tea Masala",
      quantity: 20,
      price: 5.3,
      discount: 5.0,
      netPrice: 5.3,
      profit: "5.2.3",
      scanStatus: "Scanned",
    },
    {
      productName: "Tea Masala",
      itemNumber: "#322552",
      batchNumber: "-",
      categoryName: "Tea Masala",
      quantity: 20,
      price: 5.3,
      discount: 5.0,
      netPrice: 5.3,
      profit: "5.2.3",
      scanStatus: "Scanned",
    },
  ];

// const handleDownloadInvice = async (id: string) => {
//   try {
//     const token = Cookies?.get("token");
//     console.log(token)
//     if (!token) {
//       console.error('Authentication token not found. Please log in.');
//       return; // Stop execution if no token
//     }

//     // Fetch the PDF as a binary response (arrayBuffer)
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_URL}/order/orderInvoice/${id}`,
//       {
//         headers: {
//           'Authorization': `${token}`, // Add the Bearer token
//           'Content-Type': 'application/json', // Good practice, though PDF download might not strictly need it
//         },
//       }
//     );

//     console.log(response)
//     if (!response.ok) {
//       throw new Error("Failed to fetch PDF");
//     }

//     const data = await response.arrayBuffer();
//     const blob = new Blob([data], { type: "application/pdf" });
//     const fileURL = URL.createObjectURL(blob);

//     window.open(fileURL, "_blank");

//     setTimeout(() => {
//       URL.revokeObjectURL(fileURL);
//     }, 10);
//   } catch (err) {
//     console.log(err);
//   }
// };

// //----------------------------------------------------------------------------------------------------

// const handleDownloadDilverySlip = async (id: string) => {
//   try {
//     const token = Cookies?.get("token");
//     if (!token) {
//       console.error('Authentication token not found. Please log in.');
//       return; // Stop execution if no token
//     }

//     // Fetch the PDF as a binary response (arrayBuffer)
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_URL}/order/deliverySheet/${id}`,
//       {
//         headers: {
//           'Authorization': `${token}`, // Add the Bearer token
//           'Content-Type': 'application/json', // Good practice
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch PDF");
//     }

//     const data = await response.arrayBuffer();
//     const blob = new Blob([data], { type: "application/pdf" });
//     const fileURL = URL.createObjectURL(blob);

//     window.open(fileURL, "_blank");

//     setTimeout(() => {
//       URL.revokeObjectURL(fileURL);
//     }, 10);
//   } catch (err) {
//     console.log(err);
//   }
// };

// //----------------------------------------------------------------------------------------------------

// const handleDownloadExcel = async () => {
//   try {
//     const token = Cookies?.get("token"); // Get token from localStorage
//     if (!token) {
//       console.error('Authentication token not found. Please log in.');
//       return; // Stop execution if no token
//     }

//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_URL}/order/bulk-order-excel-empty?download=true`,
//       {
//         headers: {
//           'Authorization': `${token}`, // Add the Bearer token
//           'Content-Type': 'application/json', // Good practice
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch Excel file");
//     }

//     const data = await response.arrayBuffer();
//     const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `order_repo.xl`;

//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     URL.revokeObjectURL(link.href);
//   } catch (err) {
//     console.error("Error downloading Excel file:", err);
//   }
// };

  const handleDownloadInvice = async (id: string) => {
    setIsBestLoading(true)
    
    try {
       const token = Cookies?.get("token");
     
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/order/orderInvoice/${id}`,{
         headers: {
    'Content-Type': 'application/json',
    'Authorization': `${token}`,
    
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

      // Create a temporary link to trigger the download
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
  const handleDownloadDilverySlip = async (id: string) => {
setIsBestLoading(true)
    try {
       const token = Cookies?.get("token");
      // Fetch the PDF as a binary response (arrayBuffer)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/order/deliverySheet/${id}`,{
         headers: {
    'Content-Type': 'application/json',
    'Authorization': `${token}`,
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
  const handleDownloadShipTOAddress = async (id: string) => {
setIsBestLoading(true)
    try {
       const token = Cookies?.get("token");
      // Fetch the PDF as a binary response (arrayBuffer)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/order/${id}/ship-to-address-pdf`,{
         headers: {
    'Content-Type': 'application/json',
    'Authorization': `${token}`,
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
    return <div className="p-6 text-center text-gray-700">Loading order details...</div>;
  }

  if (isError) {
    return <div className="p-6 text-center text-red-600">Error loading order details. Please try again.</div>;
  }

  return (
    <div> 

    {isBestLoading&&  <Loading />}
      {" "}
      <div className="p-6 bg-white">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            View Order
          </h1>

          {/* Filter Section */}

          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="font-medium">{data?.data?.PONumber} </h2>
            <div className="flex items-center gap-2 ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Link href={`/dashboard/order-management/${data.data._id}/${data.data.storeId._id}`}>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <DollarSign className="h-4 w-4" />
              </Button>
              </Link>
              
             
           
              <DropdownMenu>
                <DropdownMenuTrigger> <ImFilePdf className="w-5 h-5 text-black" /></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDownloadInvice(data.data._id)}
                  >
                    Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadDilverySlip(data.data._id)}
                  >
                    Delivery slip
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadShipTOAddress(data.data._id)}
                  >
                    Ship to address 
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem
                    onClick={handleDownloadExcel}
                  >
                    Pro
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Product Name</TableHead>
                <TableHead className="font-semibold">Item Number</TableHead>
                <TableHead className="font-semibold">Batch Number</TableHead>
                <TableHead className="font-semibold">Category Name</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Discount</TableHead>
                <TableHead className="font-semibold">Net Price</TableHead>
                <TableHead className="font-semibold">Profit</TableHead>
                <TableHead className="font-semibold">Scan Status</TableHead>
               
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.products?.map((item: any, index: number) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {item?.productId?.name}
                  </TableCell>
                  <TableCell   className="text-blue-600 cursor-pointer">
                    {item?.productId?.itemNumber}
                  </TableCell>
                  <TableCell>{item?.productId?.barcodeString}</TableCell>
                  <TableCell>{item?.productId?.categoryId?.name}</TableCell>
                  <TableCell>{item?.quantity}</TableCell>
                  <TableCell>
                    {item?.productId?.purchasePrice.toFixed(2)}
                  </TableCell>
                  <TableCell>{item?.discount?.toFixed(2)}</TableCell>
                  <TableCell>{item?.productId?.salesPrice.toFixed(2)}</TableCell>
                  <TableCell>{item?.productId?.competitorPrice}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      panding
                    </Badge>
                  </TableCell>
                  
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>{" "}
    </div>
  );
};

export default OrderDeatils;
