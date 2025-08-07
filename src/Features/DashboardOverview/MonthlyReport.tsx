"use client";

import React, { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
  TooltipItem,
} from "chart.js";
import { useGetOrderCustomerChartQuery } from "@/redux/api/dashboard/dashboardApi";
import Loading from "@/redux/Shared/Loading";


ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MonthlyReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Order" | "Customer">("Order");
  const { data, isLoading, isError } = useGetOrderCustomerChartQuery();

  // ✅ Format chart data for full year (fill empty months with 0)
  const formatChartData = useMemo(() => {
    if (!data?.data) return Array(12).fill(0); // default to 0 for each month

    console.log("Data:_____", data.data)

    const raw = activeTab === "Order" ? data.data.orders : data.data.customers;

    const countsByMonth: Record<number, number> = {};
    raw.forEach((item) => {
      countsByMonth[item.month] = item.count;
    });

    return monthLabels.map((_, i) => countsByMonth[i + 1] || 0);
  }, [data, activeTab]);

  const chartData: ChartData<"line"> = {
    labels: monthLabels,
    datasets: [
      {
        label: `${activeTab} Count`,
        data: formatChartData,
        borderColor: "#34D399",
        backgroundColor: "rgba(167, 243, 208, 0.5)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"line">) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: { title: { display: false } },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => `${value}`,
        },
      },
    },
  };

  if (isLoading) return <Loading title="Montly cart Loading"/>;
  if (isError) return <div className="text-red-500">Failed to load chart data</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg mb-4 font-semibold">Monthly Report (Full Year)</h2>
        <div className="flex p-1 bg-[#EAF8E7] rounded-2xl space-x-2">
          <button
            onClick={() => setActiveTab("Order")}
            className={`px-4 py-2 text-sm font-bold rounded-lg ${
              activeTab === "Order" ? "bg-gray-50 text-green-700" : "text-gray-600"
            }`}
          >
            Order
          </button>
          <button
            onClick={() => setActiveTab("Customer")}
            className={`px-4 py-2 text-sm font-bold rounded-lg ${
              activeTab === "Customer" ? "bg-gray-50 text-green-700" : "text-gray-600"
            }`}
          >
            Customer
          </button>
        </div>
      </div>

      <div className="col-span-3 h-20 xl:h-64 2xl:h-52">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default MonthlyReport;
