


"use client";

import { useGetBestSellingProductsQuery, useGetWorstSellingProductsQuery } from '@/redux/api/dashboard/dashboardApi';
import Loading from '@/redux/Shared/Loading';
import React, { useState, useEffect } from 'react';

interface Product {
  _id: string;
  totalQuantity: number;
  numberOfOrders: number;
  orderScore: number;
  revenuePercentage: number;
  name: string;
  itemNumber: string | null;
  status?: 'Stock' | 'Stock Out'; // Optional, can be derived or added later
}

const BestSellingProducts: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<'best' | 'worst'>('best');
  const { data: bestSellingData, isLoading: isBestLoading, error: bestError } = useGetBestSellingProductsQuery();
  const { data: worstSellingData, isLoading: isWorstLoading, error: worstError } = useGetWorstSellingProductsQuery();

  // console.log("best data ", bestSellingData);
  // console.log("worst data ", worstSellingData);

  const products = selectedOption === 'best' ? bestSellingData?.data || [] : worstSellingData?.data || [];

  useEffect(() => {
    console.log('Selected Option:', selectedOption, 'Products:', products);
  }, [selectedOption, products]);

  if (isBestLoading || isWorstLoading) return <div className="p-4 bg-white rounded-lg shadow-md">
    <Loading title='Best Selling Loading.....' message='All best and worst Selling Product Fetched'/>
  </div>;
  if (bestError || worstError) return <div className="p-4 bg-white rounded-lg shadow-md text-red-500">Error loading products</div>;

  const handlePostData = () => {
    console.log('Posting data:', products);
  };

  return (
    <div className="px-4 py-3 bg-white rounded-xl shadow-md h-82">
      <div className="flex justify-between items-center mb-4">
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value as 'best' | 'worst')}
          className="p-2 font-bold"
        >
          <option value="best">Best Selling Product</option>
          <option value="worst">Worst Selling Product</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EAF8E7] text-[#6A717F]">
              <th className="p-2">PRODUCT</th>
              <th className="p-2">TOTAL ORDER</th>
              <th className="p-2">STATUS</th>
              <th className="p-2">REVENUE %</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0,5).map((product) => (
              <tr key={product._id} className="border-t">
                <td className="flex items-center p-2">{product.name || 'Unknown Product'}</td>
                <td className="p-2">{product.numberOfOrders}</td>
                <td className="p-2">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${product.totalQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className={product.totalQuantity > 0 ? 'text-green-500' : 'text-red-500'}>
                      {product.totalQuantity > 0 ? 'Stock' : 'Stock Out'}
                    </span>
                  </span>
                </td>
                <td className="p-2">{(product.revenuePercentage).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BestSellingProducts;
