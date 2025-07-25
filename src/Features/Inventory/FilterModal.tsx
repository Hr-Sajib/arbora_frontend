// components/ProductFiltersModal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react"; // For the close button icon

interface ProductFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterData: any[]; 
  onApplyFilters?: (filters: { category?: string; product?: string; outOfStock?: boolean; lowStock?: boolean }) => void;
  currentFilters?: { category?: string; product?: string; outOfStock?: boolean; lowStock?: boolean };
}

export default function ProductFiltersModal({
  open,
  onOpenChange,
  filterData,
  onApplyFilters,
  currentFilters,
}: ProductFiltersModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(currentFilters?.category || "");
  const [selectedProduct, setSelectedProduct] = useState(currentFilters?.product || "");
  const [outOfStock, setOutOfStock] = useState(currentFilters?.outOfStock || false);
  const [lowStock, setLowStock] = useState(currentFilters?.lowStock || false);

  const handleClear = () => {
    setSelectedCategory("");
    setSelectedProduct("");
    setOutOfStock(false);
    setLowStock(false);
    // If onApplyFilters is provided, clear filters in parent as well
    if (onApplyFilters) {
      onApplyFilters({});
    }
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({
        category: selectedCategory,
        product: selectedProduct,
        outOfStock,
        lowStock,
      });
    }
    onOpenChange(false); // Close the modal after applying
  };

  // Extract unique categories and product names for select options
  const uniqueCategories = Array.from(new Set(filterData.map(item => item.categoryId?.name).filter(Boolean)));
  const uniqueProductNames = Array.from(new Set(filterData.map(item => item.name).filter(Boolean)));


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-medium text-gray-900">Product Filters</DialogTitle>
         
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map((category: string) => (
                  <SelectItem value={category} key={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Products</label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Products" />
              </SelectTrigger>
              <SelectContent>
                {uniqueProductNames.map((productName: string) => (
                  <SelectItem value={productName} key={productName}>
                    {productName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="out-of-stock"
                checked={outOfStock}
                onCheckedChange={(checked) => setOutOfStock(checked as boolean)}
              />
              <label htmlFor="out-of-stock" className="text-sm font-medium text-gray-700 cursor-pointer">
                Out of Stock
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="low-stock"
                checked={lowStock}
                onCheckedChange={(checked) => setLowStock(checked as boolean)}
              />
              <label htmlFor="low-stock" className="text-sm font-medium text-gray-700 cursor-pointer">
                Low of Stock
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClear}
              className="px-6 text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent"
            >
              Clear
            </Button>
            <Button onClick={handleApply} className="px-6 bg-orange-500 hover:bg-orange-600 text-white">
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}