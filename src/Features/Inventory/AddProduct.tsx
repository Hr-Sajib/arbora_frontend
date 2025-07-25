




'use client';

import { useGetCategoriesQuery } from '@/redux/api/auth/categories/categoriesApi';
import { useAddInventoryMutation, useGetPackSizeQuery } from '@/redux/api/auth/inventory/inventoryApi';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const AddProductPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    itemNumber: '',
    quantity: 0,
    reorderPointOfQuantity: 0,
    weight: 0,
    weightUnit: 'KILOGRAM',
    purchasePrice: 0,
    salesPrice: 0,
    competitorPrice: 0,
    barcodeString: '',
    warehouseLocation: '',
    packetSize: '',
    categoryId: '',
    packageDimensions: { length: 0, width: 0, height: 0, unit: 'CM' }
  });

  const [addInventory] = useAddInventoryMutation();
  const { data: categoryData } = useGetCategoriesQuery(); // Removed unused refetch
  const categoriesData: { _id: string; name: string }[] = categoryData?.data ?? [];
  const { data: packSize } = useGetPackSizeQuery(); // Removed unused refetch
  const packSizes: string[] = packSize?.data ?? [];

  console.log("pack", packSize)

  const weightUnits = ['KILOGRAM', 'POUND', 'OUNCE', 'LITRE', 'PIECE', 'GRAM', 'MILLIGRAM', 'MILLILITER'];
  const packageUnits = ['CM', 'INCH'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('packageDimensions')) {
      const dimension = name.split('.')[1];
      if (dimension === 'unit') {
        setFormData(prev => ({
          ...prev,
          packageDimensions: { ...prev.packageDimensions, [dimension]: value }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          packageDimensions: { ...prev.packageDimensions, [dimension]: Number(value) || 0 }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, categoryId: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      itemNumber: formData.itemNumber,
      quantity: Number(formData.quantity),
      reorderPointOfQuantity: Number(formData.reorderPointOfQuantity),
      weight: Number(formData.weight),
      weightUnit: formData.weightUnit.toUpperCase(),
      purchasePrice: Number(formData.purchasePrice),
      salesPrice: Number(formData.salesPrice),
      competitorPrice: Number(formData.competitorPrice),
      barcodeString: formData.barcodeString,
      warehouseLocation: formData.warehouseLocation,
      packetSize: formData.packetSize,
      categoryId: formData.categoryId,
      packageDimensions: {
        length: Number(formData.packageDimensions.length),
        width: Number(formData.packageDimensions.width),
        height: Number(formData.packageDimensions.height),
        unit: formData.packageDimensions.unit.toUpperCase()
      },
      isDeleted: false
    };
    try {
      await addInventory(payload).unwrap();
      console.log("Post data:", payload);
      toast.success('Product added successfully!');
      setFormData({
        name: '',
        itemNumber: '',
        quantity: 0,
        reorderPointOfQuantity: 0,
        weight: 0,
        weightUnit: 'KILOGRAM',
        purchasePrice: 0,
        salesPrice: 0,
        competitorPrice: 0,
        barcodeString: '',
        warehouseLocation: '',
        packetSize: '',
        categoryId: '',
        packageDimensions: { length: 0, width: 0, height: 0, unit: 'CM' }
      });
    } catch (err) {
      console.error("Failed to add product:", err);
      toast.error('Failed to add product');
    }
  };



  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add Product</h2>
      {categoryData === undefined && <p>Loading categories...</p>}
      {packSize === undefined && <p>Loading pack sizes...</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name *</label>
          <input name="name" value={formData.name} onChange={handleChange} className="mt-1 p-2 w-full border rounded" required placeholder="Enter product name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Pack Size *</label>
          <input
            list="packSizeOptions"
            name="packetSize"
            value={formData.packetSize}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
            placeholder="Type or select pack size"
            required
          />
          <datalist id="packSizeOptions">
            {packSizes.map(size => (
              <option key={size} value={size} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Weight Unit *</label>
          <select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="mt-1 p-2 w-full border rounded" required>
            {weightUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Product Quantity *</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="mt-1 p-2 w-full border rounded" required placeholder="Enter quantity" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category *</label>
          <select name="categoryId" value={formData.categoryId} onChange={handleCategoryChange} className="mt-1 p-2 w-full border rounded" required>
            <option value="">Select Category</option>
            {categoriesData.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reorder Quantity *</label>
          <input type="number" name="reorderPointOfQuantity" value={formData.reorderPointOfQuantity} onChange={handleChange} className="mt-1 p-2 w-full border rounded" required placeholder="Enter reorder quantity" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sales Price *</label>
          <input type="number" name="salesPrice" value={formData.salesPrice} onChange={handleChange} className="mt-1 p-2 w-full border rounded" required placeholder="Enter sales price" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Competitors Price *</label>
          <input type="number" name="competitorPrice" value={formData.competitorPrice} onChange={handleChange} className="mt-1 p-2 w-full border rounded" required placeholder="Enter competitor price" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Item Number</label>
          <input name="itemNumber" value={formData.itemNumber} onChange={handleChange} className="mt-1 p-2 w-full border rounded" placeholder="Enter item number" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Weight *</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="mt-1 p-2 w-full border rounded" required placeholder="Enter weight" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Purchase Price *</label>
          <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="mt-1 p-2 w-full border rounded" required placeholder="Enter purchase price" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Barcode String</label>
          <input name="barcodeString" value={formData.barcodeString} onChange={handleChange} className="mt-1 p-2 w-full border rounded" placeholder="Enter barcode" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Warehouse Location</label>
          <input name="warehouseLocation" value={formData.warehouseLocation} onChange={handleChange} className="mt-1 p-2 w-full border rounded" placeholder="Enter location" />
        </div>

        <div>
          
          <div className="flex gap-2 mt-1 items-center">
            <div className="flex flex-col w-1/4">
               <label className="block text-sm font-medium text-gray-700">Lenth</label>
              <input type="number" name="packageDimensions.length" value={formData.packageDimensions.length} onChange={handleChange} className="p-2 border rounded" placeholder="L" />
            </div>
            <div className="flex flex-col w-1/4">
              <label className="block text-sm font-medium text-gray-700">Width</label>
              <input type="number" name="packageDimensions.width" value={formData.packageDimensions.width} onChange={handleChange} className="p-2 border rounded" placeholder="W" />
            </div>
            <div className="flex flex-col w-1/4">
              <label className="block text-sm font-medium text-gray-700">Height</label>
              <input type="number" name="packageDimensions.height" value={formData.packageDimensions.height} onChange={handleChange} className="p-2 border rounded" placeholder="H" />
            </div>
            <div className="flex flex-col w-1/4">
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <select name="packageDimensions.unit" value={formData.packageDimensions.unit} onChange={handleChange} className="p-2 border rounded">
                {packageUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex justify-end gap-4">
          <button type="submit" className="bg-red-500 text-white p-2 cursor-pointer px-4 rounded" disabled={categoryData === undefined || packSize === undefined}>Save</button>
          <button type="button" className="bg-pink-500 cursor-pointer text-white p-2 px-4 rounded" onClick={() => setFormData({
            name: '',
            itemNumber: '',
            quantity: 0,
            reorderPointOfQuantity: 0,
            weight: 0,
            weightUnit: 'KILOGRAM',
            purchasePrice: 0,
            salesPrice: 0,
            competitorPrice: 0,
            barcodeString: '',
            warehouseLocation: '',
            packetSize: '',
            categoryId: '',
            packageDimensions: { length: 0, width: 0, height: 0, unit: 'CM' }
          })}>Clear</button>
          <button></button>
         <button type="button"
          onClick={() => router.push("/dashboard/inventory")}
           className="bg-gray-500 cursor-pointer text-white p-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;

