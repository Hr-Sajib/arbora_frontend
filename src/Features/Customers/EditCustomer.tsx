"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter } from "next/navigation";
import { useUpdateCustomerMutation, useGetCustomerQuery } from "@/redux/api/customers/customersApi";
import { toast } from "react-hot-toast";
import { Customer } from "@/types";

// Utility function to format phone numbers
const formatPhoneNumber = (value: string, inputElement: HTMLInputElement | null): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // If less than 10 digits, return as is (partial input)
  if (digits.length < 10) {
    return digits;
  }
  
  // Format to (XXX)XXX-XXXX
  if (digits.length >= 10) {
    const areaCode = digits.slice(0, 3);
    const prefix = digits.slice(3, 6);
    const lineNumber = digits.slice(6, 10);
    return `(${areaCode})${prefix}-${lineNumber}`;
  }
  
  return digits;
};

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const storePhoneRef = useRef<HTMLInputElement>(null);
  const storePersonPhoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customerData?.data) {
      setFormData((prev) => ({
        ...prev,
        ...customerData.data,
        isCustomerSourceProspect: customerData.data.isCustomerSourceProspect ?? false,
        note: customerData.data.note || "",
      }));
    }
  }, [customerData]);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading customer data</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    const inputElement = e.target as HTMLInputElement;

    // Apply phone number formatting for storePhone and storePersonPhone
    if (name === "storePhone" || name === "storePersonPhone") {
      formattedValue = formatPhoneNumber(value, inputElement);
      console.log(`Formatting ${name}: ${value} -> ${formattedValue}`);
      // Maintain cursor position
      const cursorPosition = inputElement.selectionStart || 0;
      const digitsBefore = value.replace(/\D/g, '').slice(0, cursorPosition).length;
      const newValue = formatPhoneNumber(value, null);
      const newCursorPosition = newValue
        .split('')
        .reduce((count, char, i) => (i < cursorPosition && /\d/.test(char) ? count + 1 : count), 0);
      setTimeout(() => {
        inputElement.selectionStart = newCursorPosition;
        inputElement.selectionEnd = newCursorPosition;
      }, 0);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
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
      formDataImg.append("key", process.env.NEXT_PUBLIC_IMGBB_API_KEY || "YOUR_IMGBB_API_KEY");
      formDataImg.append("image", file);
      formDataImg.append("expiration", "600");

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.storeName.trim()) {
      errors.storeName = "Store name is required.";
    }
    if (!formData.storePhone.match(/^\(\d{3}\)\d{3}-\d{4}$/) || formData.storePhone.replace(/\D/g, '').length !== 10) {
      errors.storePhone = "Store phone must be a valid 10-digit number in format (XXX)XXX-XXXX.";
    }
    if (!formData.storePersonName.trim()) {
      errors.storePersonName = "Authorized person name is required.";
    }
    if (!formData.storePersonPhone.match(/^\(\d{3}\)\d{3}-\d{4}$/) || formData.storePersonPhone.replace(/\D/g, '').length !== 10) {
      errors.storePersonPhone = "Cell phone must be a valid 10-digit number in format (XXX)XXX-XXXX.";
    }
    if (!formData.storePersonEmail.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      errors.storePersonEmail = "Invalid email format.";
    }
    if (!formData.billingAddress.trim()) {
      errors.billingAddress = "Billing address is required.";
    }
    if (!formData.billingCity.trim()) {
      errors.billingCity = "Billing city is required.";
    }
    if (!formData.billingState.trim()) {
      errors.billingState = "Billing state is required.";
    }
    if (!formData.billingZipcode.match(/^\d{5}$/)) {
      errors.billingZipcode = "Billing zipcode must be 5 digits.";
    }
    if (!formData.shippingAddress.trim()) {
      errors.shippingAddress = "Shipping address is required.";
    }
    if (!formData.shippingCity.trim()) {
      errors.shippingCity = "Shipping city is required.";
    }
    if (!formData.shippingState.trim()) {
      errors.shippingState = "Shipping state is required.";
    }
    if (!formData.shippingZipcode.match(/^\d{5}$/)) {
      errors.shippingZipcode = "Shipping zipcode must be 5 digits.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors.");
      return;
    }

    console.log("Submitting payload:", JSON.stringify(formData, null, 2));

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
              required
            />
            {validationErrors.storeName && (
              <span className="text-red-500 text-sm">{validationErrors.storeName}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="storePersonName">Auth Person Name</Label>
            <Input
              id="storePersonName"
              name="storePersonName"
              value={formData.storePersonName}
              onChange={handleChange}
              className="w-full text-gray-700"
              required
            />
            {validationErrors.storePersonName && (
              <span className="text-red-500 text-sm">{validationErrors.storePersonName}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="storePhone">Store Phone</Label>
            <Input
              id="storePhone"
              name="storePhone"
              type="tel"
              value={formData.storePhone}
              onChange={handleChange}
              placeholder="(XXX)XXX-XXXX"
              maxLength={14}
              ref={storePhoneRef}
              className="w-full text-gray-700"
              required
            />
            {validationErrors.storePhone && (
              <span className="text-red-500 text-sm">{validationErrors.storePhone}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="storePersonPhone">Cell Phone</Label>
            <Input
              id="storePersonPhone"
              name="storePersonPhone"
              type="tel"
              value={formData.storePersonPhone}
              onChange={handleChange}
              placeholder="(XXX)XXX-XXXX"
              maxLength={14}
              ref={storePersonPhoneRef}
              className="w-full text-gray-700"
              required
            />
            {validationErrors.storePersonPhone && (
              <span className="text-red-500 text-sm">{validationErrors.storePersonPhone}</span>
            )}
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
              required
            />
            {validationErrors.storePersonEmail && (
              <span className="text-red-500 text-sm">{validationErrors.storePersonEmail}</span>
            )}
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
            <Label htmlFor="bankACHAccountInfo">Bank ACH Account Info</Label>
            <Textarea
              id="bankACHAccountInfo"
              name="bankACHAccountInfo"
              value={formData.bankACHAccountInfo}
              onChange={handleChange}
              className="w-full text-gray-700"
              rows={4}
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
              required
            />
            {validationErrors.billingAddress && (
              <span className="text-red-500 text-sm">{validationErrors.billingAddress}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingCity">Billing City</Label>
            <Input
              id="billingCity"
              name="billingCity"
              value={formData.billingCity}
              onChange={handleChange}
              className="w-full text-gray-700"
              required
            />
            {validationErrors.billingCity && (
              <span className="text-red-500 text-sm">{validationErrors.billingCity}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingState">Billing State</Label>
            <Input
              id="billingState"
              name="billingState"
              value={formData.billingState}
              onChange={handleChange}
              className="w-full text-gray-700"
              required
            />
            {validationErrors.billingState && (
              <span className="text-red-500 text-sm">{validationErrors.billingState}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingZipcode">Billing Zipcode</Label>
            <Input
              id="billingZipcode"
              name="billingZipcode"
              value={formData.billingZipcode}
              onChange={handleChange}
              className="w-full text-gray-700"
              required
            />
            {validationErrors.billingZipcode && (
              <span className="text-red-500 text-sm">{validationErrors.billingZipcode}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Shipping Address</Label>
            <Input
              id="shippingAddress"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleChange}
              className="w-full text-gray-700"
              required
            />
            {validationErrors.shippingAddress && (
              <span className="text-red-500 text-sm">{validationErrors.shippingAddress}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingCity">Shipping City</Label>
            <Input
              id="shippingCity"
              name="shippingCity"
              value={formData.shippingCity}
              onChange={handleChange}
              className="w-full text-gray-700"
              required
            />
            {validationErrors.shippingCity && (
              <span className="text-red-500 text-sm">{validationErrors.shippingCity}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingState">Shipping State</Label>
            <Input
              id="shippingState"
              name="shippingState"
              value={formData.shippingState}
              onChange={handleChange}
              className="w-full text-gray-700"
              required
            />
            {validationErrors.shippingState && (
              <span className="text-red-500 text-sm">{validationErrors.shippingState}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingZipcode">Shipping Zipcode</Label>
            <Input
              id="shippingZipcode"
              name="shippingZipcode"
              value={formData.shippingZipcode}
              onChange={handleChange}
              className="w-full text-gray-700"
              required
            />
            {validationErrors.shippingZipcode && (
              <span className="text-red-500 text-sm">{validationErrors.shippingZipcode}</span>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full text-gray-700"
              rows={4}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-4 py-4 gap-6">
          <div className="space-y-2">
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
          <Button
            type="button"
            onClick={() => router.push("/dashboard/customers")}
            className="bg-gray-500 text-white hover:bg-gray-600"
          >
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