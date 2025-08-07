"use client";

import { useGetInventoryQuery } from "@/redux/api/auth/inventory/inventoryApi";
import { useGetSalesOverviewDataQuery } from "@/redux/api/dashboard/dashboardApi";
import Loading from "@/redux/Shared/Loading";
import Link from "next/link";
import { useState, useEffect } from "react";

const SalesOverview = () => {
  const {
    data: salesData,
    isLoading,
    isError,
  } = useGetSalesOverviewDataQuery();
  const { data: inventoryData } = useGetInventoryQuery();
  const [overviewData, setOverviewData] = useState({
    totalSales: 0,
    ordersLast7Days: 0,
    ordersLast30Days: 0,
    dueAmount: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    trends: { totalSales: 0, ordersLast7Days: 0 },
  });

  console.log("Orders______", salesData);

  useEffect(() => {
    if (salesData?.data && inventoryData) {
      const today = new Date();
      const last7Days = new Date(today.setDate(today.getDate() - 7))
        .toISOString()
        .split("T")[0];
      const last30Days = new Date(today.setDate(today.getDate() - 23))
        .toISOString()
        .split("T")[0];

      // Filter orders for the last 7 days based on createdAt
      const recentOrders = salesData.data.filter((order) => {
        const orderCreatedAt = new Date(order.createdAt).toISOString().split("T")[0];
        return orderCreatedAt >= last7Days;
      });

      // Filter orders for the last 30 days based on createdAt
      const recent30DaysOrders = salesData.data.filter((order) => {
        const orderCreatedAt = new Date(order.createdAt).toISOString().split("T")[0];
        return orderCreatedAt >= last30Days;
      });

      // Calculate total sales for all orders
      const totalSales = salesData.data.reduce(
        (sum, order) => sum + (order.orderAmount || 0),
        0
      );
      const ordersLast7DaysCount = recentOrders.length;
      const ordersLast30DaysCount = recent30DaysOrders.length;

      // Calculate due amount for all orders
      const dueAmount = salesData.data.reduce(
        (sum, order) => sum + (order.openBalance || 0),
        0
      );

      // Trend calculation for last 7 days vs previous 7 days
      const allOrders = salesData.data;
      const previous7Days = allOrders.filter((order) => {
        const orderCreatedAt = new Date(order.createdAt).toISOString().split("T")[0];
        const prevStart = new Date(today.setDate(today.getDate() - 14))
          .toISOString()
          .split("T")[0];
        const prevEnd = new Date(today.setDate(today.getDate() - 7))
          .toISOString()
          .split("T")[0];
        return orderCreatedAt >= prevStart && orderCreatedAt < prevEnd;
      });
      const prevTotalSales = previous7Days.reduce(
        (sum, order) => sum + (order.orderAmount || 0),
        0
      );
      const prevOrderCount = previous7Days.length;
      const totalSalesTrend =
        prevTotalSales > 0
          ? ((totalSales - prevTotalSales) / prevTotalSales) * 100
          : 0;
      const ordersLast7DaysTrend =
        prevOrderCount > 0
          ? ((ordersLast7DaysCount - prevOrderCount) / prevOrderCount) * 100
          : 0;

      // Calculate total products and low stock products
      const totalProducts = inventoryData.data.length;
      const lowStockProducts = inventoryData.data.filter(
        (product) => product.quantity < product.reorderPointOfQuantity
      ).length;

      setOverviewData({
        totalSales: Number(totalSales.toFixed(2)),
        ordersLast7Days: ordersLast7DaysCount,
        ordersLast30Days: ordersLast30DaysCount,
        dueAmount: Number(dueAmount.toFixed(2)),
        totalProducts,
        lowStockProducts,
        trends: {
          totalSales: Number(totalSalesTrend.toFixed(2)),
          ordersLast7Days: Number(ordersLast7DaysTrend.toFixed(2)),
        },
      });
    }
  }, [salesData, inventoryData]);

  if (isLoading)
    return (
      <div>
        <Loading title="Overview card Loading" />
      </div>
    );
  if (isError) return <div>Error loading sales data</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <div className="bg-[#114F5E] text-white p-4 rounded-lg">
        <h3 className="text-base md:text-lg mb-2">Total Sales</h3>
        <p className="text-3xl md:text-4xl font-bold mb-2">
          ${overviewData.totalSales}
        </p>
        <p className="text-sm text-blue-300">
          💎 Total order amounts excluding shipping charges
        </p>
      </div>
      <Link href="/dashboard/order-management" passHref>
        <div className="bg-[#219EBC] text-white p-4 rounded-lg cursor-pointer h-34">
          <h3 className="text-base md:text-xl mb-2">Due Amount</h3>
          <p className="text-3xl md:text-4xl font-bold mb-2">
            ${overviewData.dueAmount}
          </p>
          <p className="text-sm text-white">⚠️ Total open balances</p>
        </div>
      </Link>
      <Link href="/dashboard/order-management" passHref>
        <div className="flex gap-4 bg-[#1F6F97] text-white p-8 md:p-4 rounded-lg items-center justify-between h-34">
          <div className="text-white border-r-2 border-gray-400 pr-8 xl:pr-10 2xl:pr-18">
            <h3 className="text-lg">Orders (Last 7 Days)</h3>
            <p className="text-4xl font-bold">{overviewData.ordersLast7Days}</p>
          </div>
          <div className="text-white pl-4">
            <h3 className="text-lg">Orders (Last 30 Days)</h3>
            <p className="text-4xl font-bold">{overviewData.ordersLast30Days}</p>
          </div>
        </div>
      </Link>
      <div className="flex gap-4 bg-[#023047] text-white p-8 md:p-4 rounded-lg items-center justify-between h-34">
        <div className="text-white border-r-2 border-gray-400 pr-8 xl:pr-10 2xl:pr-18">
          <h3 className="text-lg">Total Product</h3>
          <p className="text-4xl font-bold">{overviewData.totalProducts}</p>
        </div>
        <Link href="/dashboard/inventory" passHref>
          <div className="text-white pl-4 cursor-pointer">
            <h3 className="text-lg">Low Stock Product</h3>
            <p className="text-4xl font-bold">{overviewData.lowStockProducts}</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SalesOverview;