'use client'
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Upload, Download, FileSpreadsheet, ArrowUpDown } from "lucide-react"
import { useForm, Controller, SubmitHandler, FieldValues } from 'react-hook-form'
import ImageGenetors from "@/utils/ImgeGenetor"
import { useGetPaymentHistoryQuery, useInsertPaymentMutation } from "@/redux/api/order/orderManagementApi"
import toast from "react-hot-toast"

export default function Payment({productId, paymentId}: {productId: string, paymentId: string}) {
  const { register, handleSubmit, control, formState: { errors }, watch } = useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [image, setImage] = useState("");

  const { data, isLoading, isError, refetch } = useGetPaymentHistoryQuery(paymentId);
  const [addPayment] = useInsertPaymentMutation();
  console.log('payment data', data);

  const paymentData = [
    {
      id: 1,
      orderDate: "21-07-2025",
      invoiceNo: "NLM123",
      invoiceDate: "21-07-2025",
      paymentDueDate: "21-07-2025",
      orderAmount: "$20,000",
      paymentAmountReceived: "$ 0.00",
      openBalance: "$20.00",
      payment: "$ 0.00",
    },
  ];

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    const image1 = await ImageGenetors(file)
    setImage(image1);
    console.log(image1);
    if (file) {
      setSelectedFileName(file.name);
      console.log('Selected file:', file);
    } else {
      setSelectedFileName('');
    }
  };

  const paymentMethod = watch('paymentMethod'); // Watch the paymentMethod field

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (paymentMethod === 'check' && !image) {
      toast.error("Check Image is required for check payments");
      return;
    }

    const paymentData = {
      storeId: paymentId,
      forOrderId: productId,
      amount: data.amountReceived ||0,
      checkNumber: data.checkNumber ||"noCheck",
      date: data.paymentDate,
      method: data.paymentMethod,
      checkImage: image ||"noCheck"
    };
    console.log(paymentData);

    try {
      const payment = await addPayment(paymentData);
      console.log(payment);
      if (payment.data.success) {
        refetch();
        toast.success("Successfully payment done");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const totalAmount = data?.data?.reduce((acc: number, product: any) => {
    return acc + product.amount;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Update Payment Received</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Outstanding Amount: $ {totalAmount}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="payment-method" className="text-sm font-medium">
                    Payment Method *
                  </Label>
                  <Controller
                    name="paymentMethod"
                    control={control}
                    rules={{ required: 'Payment Method is required' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
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
                  {errors.paymentMethod && typeof errors.paymentMethod.message === 'string' && (
                    <p className="text-red-500 text-sm">{errors.paymentMethod.message}</p>
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
                      {...register('paymentDate', { required: 'Payment Date is required' })}
                      className="pr-10"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.paymentDate && typeof errors.paymentDate.message === 'string' && (
                    <p className="text-red-500 text-sm">{errors.paymentDate.message}</p>
                  )}
                </div>

                {/* Amount Received */}
                <div className="space-y-2">
  <Label htmlFor="amount-received" className="text-sm font-medium">
    Amount Received * {/* Removed the conditional asterisk as it's always required now */}
  </Label>
  <Input
    id="amount-received"
    type="text"
    placeholder="Payment Amount"
    {...register('amountReceived', {
      required: 'Amount Received is required', // Simplified to always be required
      pattern: {
        value: /^\d+(\.\d{1,2})?$/, // Regex for currency (e.g., 123 or 123.45)
        message: 'Invalid amount format (e.g., 123.45)'
      }
    })}
  />
  {errors.amountReceived && typeof errors.amountReceived.message === 'string' && (
    <p className="text-red-500 text-sm">{errors.amountReceived.message}</p>
  )}
</div>

                {/* Check Number */}
                <div className="space-y-2">
                  <Label htmlFor="check-number" className="text-sm font-medium">
                    Check Number {paymentMethod === 'check' ? '*' : ''}
                  </Label>
                  <Input
                    id="check-number"
                    type="text"
                    defaultValue={""}
                    placeholder="Check Number"
                    {...register('checkNumber', {
                      required: paymentMethod === 'check' ? 'Check Number is required' : false
                    })}
                  />
                  {errors.checkNumber && typeof errors.checkNumber.message === 'string' && (
                    <p className="text-red-500 text-sm">{errors.checkNumber.message}</p>
                  )}
                </div>

                {/* Check Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="checkImage" className="text-sm font-medium">
                    Check Image {paymentMethod === 'check' ? '*' : ''}
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
                  {paymentMethod === 'check' && !image && (
                    <p className="text-red-500 text-sm">Check Image is required</p>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex items-end">
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 h-10">
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Payment Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">
                      Order Date
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">
                      Invoice No.
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">
                      Invoice Date
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">Payment Due Date</TableHead>
                  <TableHead className="font-medium">Order Amount</TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">
                      Payment Amount Received
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">
                    <div className="flex items-center gap-1">
                      Open Balance
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="font-medium">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((row: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium">{row.date}</TableCell>
                    <TableCell>{row.forOrderId.invoiceNumber}</TableCell>
                    <TableCell>{row.forOrderId.date}</TableCell>
                    <TableCell>{row.forOrderId.paymentDueDate}</TableCell>
                    <TableCell>${row.forOrderId.orderAmount}</TableCell>
                    <TableCell>${row.forOrderId.paymentAmountReceived}</TableCell>
                    <TableCell>${row.forOrderId.openBalance}</TableCell>
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