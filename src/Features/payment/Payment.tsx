"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarIcon,
  Upload,
  ArrowUpDown,
} from "lucide-react";
import {
  useForm,
  Controller,
  SubmitHandler,
  FieldValues,
} from "react-hook-form";
import ImageGenetors from "@/utils/ImgeGenetor";
import {
  useGetPaymentHistoryQuery,
  useInsertPaymentMutation
} from "@/redux/api/order/orderManagementApi";
import toast from "react-hot-toast";
import Link from "next/link";
import { useGetCustomerQuery } from "@/redux/api/customers/customersApi";

export default function Payment({
  productId,
  paymentId,
}: {
  productId: string;
  paymentId: string;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [image, setImage] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]); // Track selected order IDs

  const { data: paymentData, isLoading: isPaymentLoading, isError: isPaymentError, refetch: refetchPayment } =
    useGetPaymentHistoryQuery(paymentId);
  const { data: customerData, isLoading: isCustomerLoading, isError: isCustomerError, refetch: refetchCustomer } =
    useGetCustomerQuery(paymentId);
  const [addPayment, { isLoading }] = useInsertPaymentMutation(); // Destructure isLoading from mutation

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    const image1 = await ImageGenetors(file);
    setImage(image1);
    console.log(image1);
    if (file) {
      setSelectedFileName(file.name);
      console.log("Selected file:", file);
    } else {
      setSelectedFileName("");
    }
  };

  const paymentMethod = watch("paymentMethod"); // Watch the paymentMethod field

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (paymentMethod === "check" && !image) {
      toast.error("Check Image is required for check payments");
      return;
    }

    if (selectedOrderIds.length === 0) {
      toast.error("Please select at least one order to apply the payment.");
      return;
    }

    // Process payment for the first selected order (or handle multiple if needed)
    const selectedOrderId = selectedOrderIds[0]; // Assuming single selection for now
    const paymentDataToSend = {
      storeId: paymentId,
      forOrderId: selectedOrderId, // Use the selected order's ID
      amount: data.amountReceived || 0,
      checkNumber: data.checkNumber || "noCheck",
      date: data.paymentDate,
      method: data.paymentMethod,
      checkImage: image || "noCheck",
    };
    console.log(paymentDataToSend);

    try {
      const payment = await addPayment(paymentDataToSend);
      console.log(payment);
      if (payment.data.success) {
        refetchPayment(); // Refetch payment history
        refetchCustomer(); // Refetch customer data to update orders
        toast.success("Successfully payment done");
        setSelectedOrderIds([]); // Clear selection after successful payment
      }
    } catch (error) {
      console.log(error);
    }
  };

  const totalAmount = paymentData?.data?.reduce((acc: number, product: any) => {
    return acc + product.amount;
  }, 0);

  // Filter orders with openBalance > 0
  const ordersWithOpenBalance = customerData?.data?.customerOrders?.filter(
    (order: any) => order.openBalance > 0
  ) || [];

  // Handle checkbox change
  const handleCheckboxChange = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [orderId] // Single selection for now; use [...prev, orderId] for multiple
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Update Payment Received
          </h1>
          <div className="flex items-center gap-4">
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                {/* Payment Method */}
                <div className="space-y-2">
                  <Label
                    htmlFor="payment-method"
                    className="text-sm font-medium"
                  >
                    Payment Method *
                  </Label>
                  <Controller
                    name="paymentMethod"
                    control={control}
                    rules={{ required: "Payment Method is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="cc">Credit Card</SelectItem>
                          <SelectItem value="donation">Donation</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.paymentMethod &&
                    typeof errors.paymentMethod.message === "string" && (
                      <p className="text-red-500 text-sm">
                        {errors.paymentMethod.message}
                      </p>
                    )}
                </div>

                {/* Payment Date */}
                <div className="space-y-2">
                  <Label htmlFor="payment-date" className="text-sm font-medium">
                    Payment Date *
                  </Label>
                  <div className="relative">
                    <Input
                      id="payment-date"
                      type="date"
                      {...register("paymentDate", {
                        required: "Payment Date is required",
                      })}
                      className="pr-10"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.paymentDate &&
                    typeof errors.paymentDate.message === "string" && (
                      <p className="text-red-500 text-sm">
                        {errors.paymentDate.message}
                      </p>
                    )}
                </div>

                {/* Amount Received */}
                <div className="space-y-2">
                  <Label
                    htmlFor="amount-received"
                    className="text-sm font-medium"
                  >
                    Amount Received *
                  </Label>
                  <Input
                    id="amount-received"
                    type="text"
                    placeholder="Payment Amount"
                    {...register("amountReceived", {
                      required: "Amount Received is required",
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: "Invalid amount format (e.g., 123.45)",
                      },
                    })}
                  />
                  {errors.amountReceived &&
                    typeof errors.amountReceived.message === "string" && (
                      <p className="text-red-500 text-sm">
                        {errors.amountReceived.message}
                      </p>
                    )}
                </div>

                {/* Check Number */}
                <div className="space-y-2">
                  <Label htmlFor="check-number" className="text-sm font-medium">
                    Check Number {paymentMethod === "check" ? "*" : ""}
                  </Label>
                  <Input
                    id="check-number"
                    type="text"
                    defaultValue={""}
                    placeholder="Check Number"
                    {...register("checkNumber", {
                      required:
                        paymentMethod === "check"
                          ? "Check Number is required"
                          : false,
                    })}
                  />
                  {errors.checkNumber &&
                    typeof errors.checkNumber.message === "string" && (
                      <p className="text-red-500 text-sm">
                        {errors.checkNumber.message}
                      </p>
                    )}
                </div>

                {/* Check Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="checkImage" className="text-sm font-medium">
                    Check Image {paymentMethod === "check" ? "*" : ""}
                  </Label>
                  <div className="border border-gray-300 rounded p-2 bg-gray-50 text-center">
                    <Upload className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                    <input
                      type="file"
                      id="checkImage"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                  {paymentMethod === "check" && !image && (
                    <p className="text-red-500 text-sm">
                      Check Image is required
                    </p>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex items-end">
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 h-10"
                    disabled={isLoading} // Disable button during loading
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Orders with Open Balance Table */}
        <h1 className="font-semibold mt-8 text-red-800 flex items-center gap-1"><span className="text-xl">▶</span> Customer Orders with Open Balance</h1>
        <Card className="pl-5">
          <CardContent className="p-0">
            {isCustomerLoading ? (
              <div className="p-6 text-center text-gray-700">Loading orders...</div>
            ) : isCustomerError ? (
              <div className="p-6 text-center text-red-600">Error loading orders. Please try again.</div>
            ) : ordersWithOpenBalance.length === 0 ? (
              <div className="p-6 text-center text-gray-700">No orders with open balance found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead> {/* Checkbox column */}
                    <TableHead className="font-medium">Order</TableHead>
                    <TableHead className="font-medium">
                      <div className="flex items-center gap-1">Invoice No.</div>
                    </TableHead>
                    <TableHead className="font-medium">
                      <div className="flex items-center gap-1">Order Date</div>
                    </TableHead>
                    <TableHead className="font-medium">Payment Due Date</TableHead>
                    <TableHead className="font-medium">Order Amount</TableHead>
                    <TableHead className="font-medium flex items-center gap-1">
                      Open Balance
                      <ArrowUpDown className="h-4 w-4" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersWithOpenBalance.map((order: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOrderIds.includes(order._id)}
                          onCheckedChange={() => handleCheckboxChange(order._id)}
                        />
                      </TableCell>
                      <Link href={`/dashboard/order-management/${order._id}`}>
                        <TableCell>{order.PONumber}</TableCell>
                      </Link>
                      <TableCell>{order.invoiceNumber}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.paymentDueDate}</TableCell>
                      <TableCell>${order.orderAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-red-800 font-semibold">${order.openBalance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <h1 className="font-semibold mt-15">This Customer's Payment History</h1>
        {/* Payment History Table */}
        <Card className="pl-5">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="">
                  <TableHead className="w-12">For Order</TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">Invoice No.</div>
                  </TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">Payment Date</div>
                  </TableHead>
                  <TableHead className="font-medium">
                    Payment Due Date
                  </TableHead>
                  <TableHead className="font-medium">Order Amount</TableHead>
                  <TableHead className="font-medium flex items-center gap-1">
                    Payment Amount
                    <ArrowUpDown className="h-4 w-4" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentData?.data?.map((row: any, index: number) => (
                  <TableRow key={index}>
                    <Link href={`/dashboard/order-management/${row._id}`}>
                      <TableCell>{row.forOrderId.PONumber}</TableCell>
                    </Link>
                    <TableCell>{row.forOrderId.invoiceNumber}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.forOrderId.paymentDueDate}</TableCell>
                    <TableCell>${row.forOrderId.orderAmount}</TableCell>
                    <TableCell>${row.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}