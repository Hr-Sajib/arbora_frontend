"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useAddCustomerMutation } from "@/redux/api/customers/customersApi";
import toast from "react-hot-toast";

interface FormData {
  storeName: string;
  storePersonName: string;
  storePhone: string;
  storePersonPhone: string;
  storePersonEmail: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZipcode: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipcode: string;
  salesTaxId: string;
  termDays: string;
  acceptDeliveryDays: string[];
  shippingStatus: string;
  note: string;
  sameAsBillingAddress: boolean;
  bankAchInfo: string;
  creditApplication: string;
  ownerLegalFrontImage: string;
  ownerLegalBackImage: string;
  voidedCheckImage: string;
  miscellaneous: string;
  [key: string]: string | string[] | boolean; // Index signature
}

interface FilePreviews {
  creditApplication: string;
  ownerLegalFrontImage: string;
  ownerLegalBackImage: string;
  voidedCheckImage: string;
  miscellaneous: string;
}

interface FieldErrors {
  [key: string]: string;
}

export default function AddCustomer(): React.ReactElement {
  const [formData, setFormData] = useState<FormData>({
    storeName: "",
    storePersonName: "",
    storePhone: "",
    storePersonPhone: "",
    storePersonEmail: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZipcode: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZipcode: "",
    salesTaxId: "",
    termDays: "30",
    acceptDeliveryDays: [] as string[],
    shippingStatus: "SILVER",
    note: "",
    sameAsBillingAddress: false,
    bankAchInfo: "",
    creditApplication: "",
    ownerLegalFrontImage: "",
    ownerLegalBackImage: "",
    voidedCheckImage: "",
    miscellaneous: "",
  });
  const [filePreviews, setFilePreviews] = useState<FilePreviews>({
    creditApplication: "",
    ownerLegalFrontImage: "",
    ownerLegalBackImage: "",
    voidedCheckImage: "",
    miscellaneous: "",
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [addCustomer, { isLoading, error }] = useAddCustomerMutation();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Required fields
  const requiredFields = [
    "storeName",
    "storePersonName",
    "storePhone",
    "storePersonPhone",
    "storePersonEmail",
    "billingAddress",
    "billingCity",
    "billingState",
    "billingZipcode",
    "shippingAddress",
    "shippingCity",
    "shippingState",
    "shippingZipcode",
  ];

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error for this field when user starts typing
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  // Handle same as billing address checkbox
  const handleSameAsBillingAddress = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      sameAsBillingAddress: isChecked,
      ...(isChecked && {
        shippingAddress: prev.billingAddress,
        shippingCity: prev.billingCity,
        shippingState: prev.billingState,
        shippingZipcode: prev.billingZipcode,
      }),
    }));
    // Clear shipping-related errors if checked
    if (isChecked) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.shippingAddress;
        delete newErrors.shippingCity;
        delete newErrors.shippingState;
        delete newErrors.shippingZipcode;
        return newErrors;
      });
    }
  };

  // Handle acceptDeliveryDays checkbox changes
  const handleDeliveryDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const day = e.target.value.toLowerCase();
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      acceptDeliveryDays: isChecked
        ? [...prev.acceptDeliveryDays, day]
        : prev.acceptDeliveryDays.filter((d) => d !== day),
    }));
    // Clear error for acceptDeliveryDays if at least one day is selected
    if (isChecked || formData.acceptDeliveryDays.length > 0) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.acceptDeliveryDays;
        return newErrors;
      });
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle file uploads to ImgBB
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);
    formDataUpload.append(
      "key",
      process.env.NEXT_PUBLIC_IMGBB_API_KEY || "YOUR_IMGBB_API_KEY"
    );

    try {
      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const result = await response.json();
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          [field]: result.data.url,
        }));
        setFilePreviews((prev) => ({
          ...prev,
          [field]: file.type.startsWith("image/") ? result.data.url : file.name,
        }));
        // Clear error for this field after successful upload
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      } else {
        setUploadError(result.error?.message || "Failed to upload image");
      }
    } catch (err) {
      setUploadError("Error uploading to ImgBB");
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Validate required fields
  const newErrors: FieldErrors = {};
  requiredFields.forEach((field) => {
    if (field === "acceptDeliveryDays") {
      if (formData[field].length === 0) {
        newErrors[field] = "At least one delivery day is required.";
      }
    } else if (field === "termDays") {
      if (!formData[field] || parseInt(formData[field]) <= 0) {
        newErrors[field] = "Valid term days are required.";
      }
    } else if (!formData[field]) {
      newErrors[field] = "This field is required.";
    }
  });
  if (Object.keys(newErrors).length > 0) {
    console.log("Validation errors:", newErrors);
    setFieldErrors(newErrors);
    return;
  }

  try {
    const payload = {
      storeName: formData.storeName,
      storePhone: formData.storePhone.replace(/\D/g, ""),
      storePersonEmail: formData.storePersonEmail,
      storePersonName: formData.storePersonName,
      storePersonPhone: formData.storePersonPhone.replace(/\D/g, ""),
      billingAddress: formData.billingAddress,
      billingCity: formData.billingCity,
      billingState: formData.billingState,
      billingZipcode: formData.billingZipcode,
      shippingAddress: formData.shippingAddress,
      shippingCity: formData.shippingCity,
      shippingState: formData.shippingState,
      shippingZipcode: formData.shippingZipcode,
      salesTaxId: formData.salesTaxId || "Not provided",
      acceptedDeliveryDays: formData.acceptDeliveryDays,
      bankACHAccountInfo: formData.bankAchInfo || "",
      creditApplication: formData.creditApplication || "",
      ownerLegalFrontImage: formData.ownerLegalFrontImage || "",
      ownerLegalBackImage: formData.ownerLegalBackImage || "",
      voidedCheckImage: formData.voidedCheckImage || "",
      termDays: formData.termDays ? parseInt(formData.termDays) : 30,
      shippingStatus: formData.shippingStatus || "SILVER",
      note: formData.note || "",
      miscellaneous: formData.miscellaneous || "",
    };
    console.log("Submitting payload:", payload);
    await addCustomer(payload).unwrap();
    console.log("Customer added successfully:", payload);
    toast.success("Customer Added successfully");
    console.log("Navigating to /dashboard/customers");
    router.push("/dashboard/customers");
  } catch (err: any) {
    console.error("Failed to add customer:", err);
    console.log("Error details:", {
      message: err.message,
      status: err.status,
      data: err.data,
      originalError: err,
    });
    if (err?.data?.errorSources) {
      const errors = err.data.errorSources.reduce(
        (acc: FieldErrors, source: any) => {
          acc[source.path] = source.message;
          return acc;
        },
        {}
      );
      console.log("Field-specific errors:", errors);
      setFieldErrors(errors);
      // Show alert for field-specific errors
      const errorMessages = Object.entries(errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join("\n");
      alert(`\n${errorMessages}`);
    } else if (err?.data?.message) {
      // Show alert for server error message
      alert(err.data.message);
      toast.error(err.data.message);
    } else {
      // Fallback for unexpected errors
      alert("An unexpected error occurred.");
      toast.error(err.message || "An unexpected error occurred.");
    }
  }
};

  const handleCancel = () => {
    router.push("/dashboard/customers");
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Add Customer</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name <span className="text-red-700">*</span></Label>
            <Input
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              required
              placeholder="Enter store name"
              className="w-full"
            />
            {fieldErrors.storeName && (
              <p className="text-red-500 text-sm">{fieldErrors.storeName}</p>
            )}
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="storePhone">Store Phone Number <span className="text-red-700">*</span></Label>
            <Input
              id="storePhone"
              name="storePhone"
              type="tel"
              value={formData.storePhone}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
                let formatted = raw;

                if (raw.length > 0) {
                  formatted = `(${raw.slice(0, 3)}`;
                }
                if (raw.length >= 4) {
                  formatted += `)${raw.slice(3, 6)}`;
                }
                if (raw.length >= 7) {
                  formatted += `-${raw.slice(6, 10)}`;
                }

                const syntheticEvent = {
                  target: {
                    name: "storePhone",
                    value: formatted,
                  },
                } as React.ChangeEvent<HTMLInputElement>;

                handleInputChange(syntheticEvent);
              }}
              required
              placeholder="(123)456-7890"
              className="w-full"
            />
            {fieldErrors.storePhone && (
              <p className="text-red-500 text-sm">{fieldErrors.storePhone}</p>
            )}
          </div>
        </div>

        {/* Authorized Person */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="storePersonName">
              Store Authorized Person Name (For Order) <span className="text-red-700">*</span>
            </Label>
            <Input
              id="storePersonName"
              name="storePersonName"
              value={formData.storePersonName}
              onChange={handleInputChange}
              required
              placeholder="Enter authorized person name"
              className="w-full"
            />
            {fieldErrors.storePersonName && (
              <p className="text-red-500 text-sm">
                {fieldErrors.storePersonName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storePersonPhone">
              Authorized Person Number (For Order) <span className="text-red-700">*</span>
            </Label>
            <Input
              id="storePersonPhone"
              name="storePersonPhone"
              type="tel"
              value={formData.storePersonPhone}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 10); // Keep only 10 digits
                const formatted =
                  raw.length >= 6
                    ? `(${raw.slice(0, 3)})${raw.slice(3, 6)}-${raw.slice(6)}`
                    : raw.length >= 3
                    ? `(${raw.slice(0, 3)})${raw.slice(3)}`
                    : raw;

                const syntheticEvent = {
                  target: {
                    name: "storePersonPhone",
                    value: formatted,
                  },
                } as React.ChangeEvent<HTMLInputElement>;

                handleInputChange(syntheticEvent);
              }}
              required
              placeholder="(111)111-1111"
              className="w-full"
            />
            {fieldErrors.storePersonPhone && (
              <p className="text-red-500 text-sm">
                {fieldErrors.storePersonPhone}
              </p>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <Label htmlFor="storePersonEmail">Email Address <span className="text-red-700">*</span></Label>
          <Input
            id="storePersonEmail"
            name="storePersonEmail"
            type="email"
            value={formData.storePersonEmail}
            onChange={handleInputChange}
            required
            placeholder="Enter email address"
            className="w-full"
          />
          {fieldErrors.storePersonEmail && (
            <p className="text-red-500 text-sm">
              {fieldErrors.storePersonEmail}
            </p>
          )}
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billingAddress">Billing Address <span className="text-red-700">*</span></Label>
            <textarea
              id="billingAddress"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleInputChange}
              required
              placeholder="Enter billing address"
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {fieldErrors.billingAddress && (
              <p className="text-red-500 text-sm">
                {fieldErrors.billingAddress}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingCity">Billing City <span className="text-red-700">*</span></Label>
              <Input
                id="billingCity"
                name="billingCity"
                value={formData.billingCity}
                onChange={handleInputChange}
                required
                placeholder="Enter billing city"
                className="w-full"
              />
              {fieldErrors.billingCity && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.billingCity}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingState">Billing State <span className="text-red-700">*</span></Label>
              <select
                id="billingState"
                name="billingState"
                onChange={handleInputChange}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select State</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
                {/* Add more states as needed */}
              </select>
              {fieldErrors.billingState && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.billingState}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingZipcode">Billing Zipcode <span className="text-red-700">*</span></Label>
              <Input
                id="billingZipcode"
                name="billingZipcode"
                value={formData.billingZipcode}
                onChange={handleInputChange}
                required
                placeholder="Enter billing zipcode"
                className="w-full"
              />
              {fieldErrors.billingZipcode && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.billingZipcode}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Same as Billing Address Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="sameAsBillingAddress"
            name="sameAsBillingAddress"
            checked={formData.sameAsBillingAddress}
            onChange={handleSameAsBillingAddress}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label
            htmlFor="sameAsBillingAddress"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Same as Billing Address
          </Label>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Shipping Address <span className="text-red-700">*</span></Label>
            <textarea
              id="shippingAddress"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              required
              placeholder="Enter shipping address"
              rows={3}
              disabled={formData.sameAsBillingAddress}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {fieldErrors.shippingAddress && (
              <p className="text-red-500 text-sm">
                {fieldErrors.shippingAddress}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shippingCity">Shipping City <span className="text-red-700">*</span></Label>
              <Input
                id="shippingCity"
                name="shippingCity"
                value={formData.shippingCity}
                onChange={handleInputChange}
                required
                placeholder="Enter shipping city"
                disabled={formData.sameAsBillingAddress}
                className="w-full"
              />
              {fieldErrors.shippingCity && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.shippingCity}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingState">Shipping State <span className="text-red-700">*</span></Label>
              <select
                id="shippingState"
                name="shippingState"
                value={formData.shippingState}
                onChange={handleInputChange}
                required
                disabled={formData.sameAsBillingAddress}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select State</option>
                <option value="">Select State</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
                {/* Add more states as needed */}
              </select>
              {fieldErrors.shippingState && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.shippingState}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingZipcode">Shipping Zipcode </Label>
              <Input
                id="shippingZipcode"
                name="shippingZipcode"
                value={formData.shippingZipcode}
                onChange={handleInputChange}
                required
                placeholder="Enter shipping zipcode"
                disabled={formData.sameAsBillingAddress}
                className="w-full"
              />
              {fieldErrors.shippingZipcode && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.shippingZipcode}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="space-y-2">
            <Label htmlFor="termDays">Term Days </Label>
            <Input
              id="termDays"
              name="termDays"
              type="number"
              value={formData.termDays}
              onChange={handleInputChange}
              placeholder="Enter term days"
              className="w-full"
            />
            {fieldErrors.termDays && (
              <p className="text-red-500 text-sm">{fieldErrors.termDays}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="acceptDeliveryDays">Accept Delivery Days</Label>
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors cursor-pointer hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                onClick={toggleDropdown}
              >
                {formData.acceptDeliveryDays.length > 0
                  ? formData.acceptDeliveryDays
                      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
                      .join(", ")
                  : "Select days"}
              </div>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md p-2">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <div key={day} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        id={`acceptDeliveryDays-${day}`}
                        name="acceptDeliveryDays"
                        value={day}
                        checked={formData.acceptDeliveryDays.includes(
                          day.toLowerCase()
                        )}
                        onChange={handleDeliveryDaysChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label
                        htmlFor={`acceptDeliveryDays-${day}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {fieldErrors.acceptDeliveryDays && (
              <p className="text-red-500 text-sm">
                {fieldErrors.acceptDeliveryDays}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingStatus">Shipping Status</Label>
            <select
              id="shippingStatus"
              name="shippingStatus"
              value={formData.shippingStatus}
              onChange={handleInputChange}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="SILVER">SILVER</option>
              <option value="GOLD">GOLD</option>
              <option value="PLATINUM">PLATINUM</option>
            </select>
            {fieldErrors.shippingStatus && (
              <p className="text-red-500 text-sm">
                {fieldErrors.shippingStatus}
              </p>
            )}
          </div>
        </div>

        {/* Note */}
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
          {fieldErrors.note && (
            <p className="text-red-500 text-sm">{fieldErrors.note}</p>
          )}
        </div>

        <Separator />

        {/* Bank ACH Account Information */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            Bank ACH Account Information
          </h3>
          <textarea
            id="bankAchInfo"
            name="bankAchInfo"
            value={formData.bankAchInfo}
            onChange={handleInputChange}
            placeholder="Enter bank ACH account information"
            rows={5}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* File Uploads */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditApplication">Credit Application</Label>
              <label
                htmlFor="creditApplication"
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                {filePreviews.creditApplication ? (
                  filePreviews.creditApplication.startsWith("http") ? (
                    <img
                      src={filePreviews.creditApplication}
                      alt="Credit Application Preview"
                      className="w-16 h-16 object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-500 truncate max-w-full">
                      {filePreviews.creditApplication}
                    </span>
                  )
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
                    <span className="text-sm text-gray-500">
                      Click to upload
                    </span>
                  </>
                )}
                <input
                  type="file"
                  id="creditApplication"
                  name="creditApplication"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, "creditApplication")}
                  className="hidden"
                />
              </label>
              {fieldErrors.creditApplication && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.creditApplication}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerLegalIdFront">Owner Legal ID (Front)</Label>
              <label
                htmlFor="ownerLegalIdFront"
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                {filePreviews.ownerLegalFrontImage ? (
                  filePreviews.ownerLegalFrontImage.startsWith("http") ? (
                    <img
                      src={filePreviews.ownerLegalFrontImage}
                      alt="Owner Legal ID Front Preview"
                      className="w-16 h-16 object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-500 truncate max-w-full">
                      {filePreviews.ownerLegalFrontImage}
                    </span>
                  )
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
                    <span className="text-sm text-gray-500">
                      Click to upload
                    </span>
                  </>
                )}
                <input
                  type="file"
                  id="ownerLegalIdFront"
                  name="ownerLegalIdFront"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, "ownerLegalFrontImage")}
                  className="hidden"
                />
              </label>
              {fieldErrors.ownerLegalFrontImage && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.ownerLegalFrontImage}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerLegalIdBack">Owner Legal ID (Back)</Label>
              <label
                htmlFor="ownerLegalIdBack"
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                {filePreviews.ownerLegalBackImage ? (
                  filePreviews.ownerLegalBackImage.startsWith("http") ? (
                    <img
                      src={filePreviews.ownerLegalBackImage}
                      alt="Owner Legal ID Back Preview"
                      className="w-16 h-16 object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-500 truncate max-w-full">
                      {filePreviews.ownerLegalBackImage}
                    </span>
                  )
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
                    <span className="text-sm text-gray-500">
                      Click to upload
                    </span>
                  </>
                )}
                <input
                  type="file"
                  id="ownerLegalIdBack"
                  name="ownerLegalIdBack"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, "ownerLegalBackImage")}
                  className="hidden"
                />
              </label>
              {fieldErrors.ownerLegalBackImage && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.ownerLegalBackImage}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="voidedCheck">Voided Check</Label>
              <label
                htmlFor="voidedCheck"
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                {filePreviews.voidedCheckImage ? (
                  filePreviews.voidedCheckImage.startsWith("http") ? (
                    <img
                      src={filePreviews.voidedCheckImage}
                      alt="Voided Check Preview"
                      className="w-16 h-16 object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-500 truncate max-w-full">
                      {filePreviews.voidedCheckImage}
                    </span>
                  )
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
                    <span className="text-sm text-gray-500">
                      Click to upload
                    </span>
                  </>
                )}
                <input
                  type="file"
                  id="voidedCheck"
                  name="voidedCheck"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, "voidedCheckImage")}
                  className="hidden"
                />
              </label>
              {fieldErrors.voidedCheckImage && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.voidedCheckImage}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="miscellaneous">Miscellaneous</Label>
              <label
                htmlFor="miscellaneous"
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                {filePreviews.miscellaneous ? (
                  filePreviews.miscellaneous.startsWith("http") ? (
                    <img
                      src={filePreviews.miscellaneous}
                      alt="Miscellaneous Preview"
                      className="w-16 h-16 object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-500 truncate max-w-full">
                      {filePreviews.miscellaneous}
                    </span>
                  )
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
                    <span className="text-sm text-gray-500">
                      Click to upload
                    </span>
                  </>
                )}
                <input
                  type="file"
                  id="miscellaneous"
                  name="miscellaneous"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, "miscellaneous")}
                  className="hidden"
                />
              </label>
              {fieldErrors.miscellaneous && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.miscellaneous}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Upload Error */}
        {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}

        {/* Action Buttons */}
        <div className="flex justify-end   space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="px-6 py-2 cursor-pointer text-white hover:text-white bg-gray-500 hover:bg-gray-600 "
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-6 py-2 bg-red-600 hover:bg-red-700 cursor-pointer text-white"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
