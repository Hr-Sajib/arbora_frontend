


"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie"; // Explicit import
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";

export interface DecodedToken {
  email: string;
  role: string;
  // Add other claims if needed (e.g., name, iat, exp)
}

export default function AppSidebar() {
  const pathname = usePathname();
  const role = Cookies.get("role")?.toLowerCase();
  const isAdmin = role === "admin";
  const token = Cookies.get("token");

  // Decode token to get email dynamically
  let email = ""; // Default value
  let username = ""; // Default username
  if (token) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      email = decodedToken.email;
      // Derive username from email (e.g., first part before @)
      username = email.split("@")[0] || "User";
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    window.location.href = "/"; // Redirect to login
  };

  // Logic to hide button if role is "salesuser"
  const shouldHideButton = role === "salesuser";

  return (
    <Sidebar>
      <SidebarContent className="bg-[#282828] flex flex-col justify-between p-2 max-w-[260px] h-screen">
        {/* Top Section */}
        <div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Profile */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/dashboardIcons/logo.png"
                      width={225}
                      height={80}
                      alt="Profile"
                      className="rounded-full"
                    />
                  </div>
                </div>

                {/* Main menu */}
                <p className="text-white mt-4 mb-2 text-sm font-medium">Main Menu</p>
                <div className="flex flex-col gap-2">
                  {/* Dashboard */}
                  {isAdmin && (
                    <button
                      className={`flex w-full items-center gap-2 rounded-sm px-4 py-2.5 transition-colors ${
                        pathname === "/dashboard/dashboard"
                          ? "bg-green-700 text-white text-lg"
                          : "hover:bg-[#F7F7F81A] text-white focus:bg-[#F7F7F81A]"
                      }`}
                    >
                      <Link href="/dashboard/dashboard" className="flex items-center gap-2 w-full">
                        <Image
                          src="/dashboardIcons/Group.png"
                          width={20}
                          height={20}
                          alt="Profile"
                          className="rounded-full"
                        />
                        <span className="text-[16px]">Dashboard</span>
                      </Link>
                    </button>
                  )}

                   {/* Prospact */}
                  {(isAdmin || role === "user" || role === "salesuser") && (
                    <button
                      className={`flex w-full items-center gap-2 rounded-sm px-4 py-2.5 transition-colors ${
                        pathname === "/dashboard/prospact"
                          ? "bg-green-700 text-white text-lg"
                          : "text-[#D5D6E2] hover:bg-[#F7F7F81A] hover:text-white focus:bg-[#F7F7F81A] focus:text-white"
                      }`}
                    >
                      <Link href="/dashboard/prospact" className="flex items-center gap-2 w-full">
                        <Image
                          src="/dashboardIcons/Layer_1.png"
                          width={20}
                          height={20}
                          alt="Profile"
                          className="rounded-full"
                        />
                        <span className="text-[16px]">Prospect</span>
                      </Link>
                    </button>
                  )}

                  {/* Customer */}
                  {isAdmin && (
                    <button
                      className={`flex w-full items-center gap-2 rounded-sm px-4 py-2.5 transition-colors ${
                        pathname === "/dashboard/customers"
                          ? "bg-green-700 text-white text-lg"
                          : "text-[#D5D6E2] hover:bg-[#F7F7F81A] hover:text-white focus:bg-[#F7F7F81A] focus:text-white"
                      }`}
                    >
                      <Link href="/dashboard/customers" className="flex items-center gap-2 w-full">
                        <Image
                          src="/dashboardIcons/users.png"
                          width={20}
                          height={20}
                          alt="Profile"
                          className="rounded-full"
                        />
                        <span className="text-[16px]">Customers</span>
                      </Link>
                    </button>
                  )}
                  {/* Order management */}
                  {isAdmin && (
                    <button
                      className={`flex w-full items-center gap-2 rounded-sm px-4 py-2.5 transition-colors ${
                        pathname === "/dashboard/order-management"
                          ? "bg-green-700 text-white text-lg"
                          : "text-[#D5D6E2] hover:bg-[#F7F7F81A] hover:text-white focus:bg-[#F7F7F81A] focus:text-white"
                      }`}
                    >
                      <Link href="/dashboard/order-management" className="flex items-center gap-2 w-full">
                        <Image
                          src="/dashboardIcons/Vector.png"
                          width={20}
                          height={20}
                          alt="Profile"
                          className="rounded-full"
                        />
                        <span className="text-[16px]">Orders</span>
                      </Link>
                    </button>
                  )}
                  
                  {/* Inventory */}
                  {isAdmin && (
                    <button
                      className={`flex w-full items-center gap-2 rounded-sm px-4 py-2.5 transition-colors ${
                        pathname === "/dashboard/inventory"
                          ? "bg-green-700 text-white text-lg"
                          : "text-[#D5D6E2] hover:bg-[#F7F7F81A] hover:text-white focus:bg-[#F7F7F81A] focus:text-white"
                      }`}
                    >
                      <Link href="/dashboard/inventory" className="flex items-center gap-2 w-full">
                        <Image
                          src="/dashboardIcons/fluent-mdl2_product-list.png"
                          width={20}
                          height={20}
                          alt="Profile"
                          className="rounded-full"
                        />
                        <span className="text-[16px]">Inventory</span>
                      </Link>
                    </button>
                  )}
                  {/* Categories */}
                  {isAdmin && (
                    <button
                      className={`flex w-full items-center gap-2 rounded-sm px-4 py-2.5 transition-colors ${
                        pathname === "/dashboard/categories"
                          ? "bg-green-700 text-white text-lg"
                          : "text-[#D5D6E2] hover:bg-[#F7F7F81A] hover:text-white focus:bg-[#F7F7F81A] focus:text-white"
                      }`}
                    >
                      <Link href="/dashboard/categories" className="flex items-center gap-2 w-full">
                        <Image
                          src="/dashboardIcons/circle-square.png"
                          width={20}
                          height={20}
                          alt="Profile"
                          className="rounded-full"
                        />
                        <span className="text-[16px]">Categories</span>
                      </Link>
                    </button>
                  )}
                 
                  {/* Container */}
                  {isAdmin && (
                    <button
                      className={`flex w-full items-center gap-2 rounded-sm px-4 py-2.5 transition-colors ${
                        pathname === "/dashboard/container"
                          ? "bg-green-700 text-white text-lg"
                          : "text-[#D5D6E2] hover:bg-[#F7F7F81A] hover:text-white focus:bg-[#F7F7F81A] focus:text-white"
                      }`}
                    >
                      <Link href="/dashboard/container" className="flex items-center gap-2 w-full">
                        <Image
                          src="/dashboardIcons/Vector 61.png"
                          width={20}
                          height={20}
                          alt="Profile"
                          className="rounded-full"
                        />
                        <span className="text-[16px]">Container</span>
                      </Link>
                    </button>
                  )}
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Bottom Section */}
        <div className="pt-4">
          <Separator className="bg-[#242432] mb-4" />
          <SidebarMenu>
            {/* User logout */}
            <p className="text-white ml-4">{role === "admin" ? "Admin" : role === "salesuser" ? "Sales User" : "User"}</p>
            <div
              className="flex items-center gap-2 w-full mb-12 px-4 py-1 bg-white rounded-lg cursor-pointer"
              onClick={handleLogout}
            >
              <Image
                src="/dashboardIcons/logo.png"
                width={40}
                height={40}
                alt="Profile"
                className="rounded-full"
              />
              <div className="flex flex-col px-3">
                <h3 className="text-lg font-semibold text-gray-700">{username}</h3>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
              <span>
                <FaArrowRightFromBracket className="text-gray-500" />
              </span>
            </div>
            {!shouldHideButton && (
              <Link href="/signup">
                <Button className="bg-green-600 hover:bg-green-700 text-white w-full mb-2">
                  Create User
                </Button>
              </Link>
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
