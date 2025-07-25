


"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { useParams, useRouter } from "next/navigation";
import { useUpdateCustomerMutation, useGetCustomerQuery } from "@/redux/api/customers/customersApi";
import { toast } from "react-hot-toast";
import { Customer } from "@/types";

export default function EditCustomerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: customerData, isLoading, error } = useGetCustomerQuery(id as string, { skip: !id });
  const [updateCustomer] = useUpdateCustomerMutation();
  const [formData, setFormData] = useState<Customer>({
    _id: "",
    storeName: "",
    storePhone: "",
    storePersonEmail: "",
    salesTaxId: "",
    acceptedDeliveryDays: [],
    isCustomerSourceProspect: false,
    bankACHAccountInfo: "",
    storePersonName: "",
    storePersonPhone: "",
    billingAddress: "",
    billingState: "",
    billingZipcode: "",
    billingCity: "",
    shippingAddress: "",
    shippingState: "",
    shippingZipcode: "",
    shippingCity: "",
    creditApplication: "",
    ownerLegalFrontImage: "",
    ownerLegalBackImage: "",
    voidedCheckImage: "",
    isDeleted: false,
    createdAt: "",
    updatedAt: "",
    note: "",
  });

  useEffect(() => {
    if (customerData?.data) {
      setFormData((prev) => ({
        ...prev,
        ...customerData.data,
        isCustomerSourceProspect: customerData.data.isCustomerSourceProspect ?? false,
        note: customerData.data.note || "", // Ensure note is set from fetched data
      }));
    }
  }, [customerData]);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading customer data</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliveryDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const day = e.target.value.toLowerCase();
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      acceptedDeliveryDays: isChecked
        ? [...prev.acceptedDeliveryDays, day]
        : prev.acceptedDeliveryDays.filter((d) => d !== day),
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof Customer) => {
    const file = e.target.files?.[0];
    if (file) {
      const formDataImg = new FormData();
      formDataImg.append("key", process.env.NEXT_PUBLIC_IMGBB_API_KEY || "YOUR_IMGBB_API_KEY"); // Replace with your ImgBB API key
      formDataImg.append("image", file);
      formDataImg.append("expiration", "600"); // Optional: 10-minute expiration

      try {
        const response = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formDataImg,
        });
        const result = await response.json();
        if (result.success) {
          setFormData((prev) => ({ ...prev, [field]: result.data.url }));
          toast.success(`${field} image uploaded successfully`);
        } else {
          toast.error("Failed to upload image");
        }
      } catch (err) {
        toast.error("Error uploading image");
        console.error("Image upload error:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCustomer({ id: formData._id, data: formData }).unwrap();
      toast.success("Customer updated successfully");
      router.push("/dashboard/customers");
    } catch (err) {
      toast.error("Failed to update customer");
      console.error("Update error:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Edit Customer</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storePersonName">Auth Person Name</Label>
            <Input
              id="storePersonName"
              name="storePersonName"
              value={formData.storePersonName}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storePhone">Store Phone</Label>
            <Input
              id="storePhone"
              name="storePhone"
              type="tel"
              value={formData.storePhone}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storePersonPhone">Cell Phone</Label>
            <Input
              id="storePersonPhone"
              name="storePersonPhone"
              type="tel"
              value={formData.storePersonPhone}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storePersonEmail">Store Email</Label>
            <Input
              id="storePersonEmail"
              name="storePersonEmail"
              type="email"
              value={formData.storePersonEmail}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salesTaxId">Sales Tax ID</Label>
            <Input
              id="salesTaxId"
              name="salesTaxId"
              value={formData.salesTaxId}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acceptedDeliveryDays">Delivery Days</Label>
            <div className="flex flex-wrap gap-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <label key={day} className="flex items-center gap-1 text-gray-700">
                  <input
                    type="checkbox"
                    value={day.toLowerCase()}
                    checked={formData.acceptedDeliveryDays.includes(day.toLowerCase())}
                    onChange={handleDeliveryDaysChange}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankACHAccountInfo">Bank ACH Info</Label>
            <Input
              id="bankACHAccountInfo"
              name="bankACHAccountInfo"
              value={formData.bankACHAccountInfo}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingAddress">Billing Address</Label>
            <Input
              id="billingAddress"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingCity">Billing City</Label>
            <Input
              id="billingCity"
              name="billingCity"
              value={formData.billingCity}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingState">Billing State</Label>
            <Input
              id="billingState"
              name="billingState"
              value={formData.billingState}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingZipcode">Billing Zipcode</Label>
            <Input
              id="billingZipcode"
              name="billingZipcode"
              value={formData.billingZipcode}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Shipping Address</Label>
            <Input
              id="shippingAddress"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingCity">Shipping City</Label>
            <Input
              id="shippingCity"
              name="shippingCity"
              value={formData.shippingCity}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingState">Shipping State</Label>
            <Input
              id="shippingState"
              name="shippingState"
              value={formData.shippingState}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingZipcode">Shipping Zipcode</Label>
            <Input
              id="shippingZipcode"
              name="shippingZipcode"
              value={formData.shippingZipcode}
              onChange={handleChange}
              className="w-full text-gray-700"
            />
          </div>
          {/* Add the Note field here */}
          <div className="space-y-2 md:col-span-2"> {/* Make it span two columns for better layout */}
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full text-gray-700"
              rows={4} // Adjust rows as needed for the textarea
            />
          </div>
          <div className="space-y-2 md:col-span-2"> {/* Make it span two columns for better layout */}
            <Label htmlFor="note">Bank ACH Account Information</Label>
            <Textarea
              id="note"
              name="note"
              value={formData.bankACHAccountInfo}
              onChange={handleChange}
              className="w-full text-gray-700"
              rows={4} // Adjust rows as needed for the textarea
            />
          </div>
        </div>

        {/* image start here */}

        <div className="grid md:grid-cols-4 py-4 gap-6">
          <div className="space-y-2 ">
            <Label htmlFor="creditApplication">Credit Application</Label>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
              {formData.creditApplication ? (
                <img
                  src={formData.creditApplication}
                  alt="Credit Application Preview"
                  className="w-20 h-20 object-cover mx-auto mb-2 rounded"
                />
              ) : (
                <p className="text-gray-500 mb-2">No image uploaded</p>
              )}
              <Input
                id="creditApplication"
                name="creditApplication"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "creditApplication")}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => document.getElementById("creditApplication")?.click()}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
              >
                Upload Image
              </Button>
              <p className="text-xs text-gray-400 mt-1">Drag and drop or click to upload</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerLegalFrontImage">Owner Legal Front Image</Label>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
              {formData.ownerLegalFrontImage ? (
                <img
                  src={formData.ownerLegalFrontImage}
                  alt="Owner Legal Front Preview"
                  className="w-20 h-20 object-cover mx-auto mb-2 rounded"
                />
              ) : (
                <p className="text-gray-500 mb-2">No image uploaded</p>
              )}
              <Input
                id="ownerLegalFrontImage"
                name="ownerLegalFrontImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "ownerLegalFrontImage")}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => document.getElementById("ownerLegalFrontImage")?.click()}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
              >
                Upload Image
              </Button>
              <p className="text-xs text-gray-400 mt-1">Drag and drop or click to upload</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerLegalBackImage">Owner Legal Back Image</Label>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
              {formData.ownerLegalBackImage ? (
                <img
                  src={formData.ownerLegalBackImage}
                  alt="Owner Legal Back Preview"
                  className="w-20 h-20 object-cover mx-auto mb-2 rounded"
                />
              ) : (
                <p className="text-gray-500 mb-2">No image uploaded</p>
              )}
              <Input
                id="ownerLegalBackImage"
                name="ownerLegalBackImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "ownerLegalBackImage")}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => document.getElementById("ownerLegalBackImage")?.click()}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
              >
                Upload Image
              </Button>
              <p className="text-xs text-gray-400 mt-1">Drag and drop or click to upload</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="voidedCheckImage">Voided Check Image</Label>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
              {formData.voidedCheckImage ? (
                <img
                  src={formData.voidedCheckImage}
                  alt="Voided Check Preview"
                  className="w-20 h-20 object-cover mx-auto mb-2 rounded"
                />
              ) : (
                <p className="text-gray-500 mb-2">No image uploaded</p>
              )}
              <Input
                id="voidedCheckImage"
                name="voidedCheckImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "voidedCheckImage")}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => document.getElementById("voidedCheckImage")?.click()}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
              >
                Upload Image
              </Button>
              <p className="text-xs text-gray-400 mt-1">Drag and drop or click to upload</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button type="button"
          onClick={() => router.push("/dashboard/customers")}
            className="bg-gray-500 text-white hover:bg-gray-600">
            Cancel
          </Button>
          <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
            Update
          </Button>
        </div>
      </form>
    </div>
  );
}