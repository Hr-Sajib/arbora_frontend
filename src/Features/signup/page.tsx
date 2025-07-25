



"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useSignupMutation } from "@/redux/api/auth/admin/adminApi";
import Image from "next/image";
import Link from "next/link";

// Define a custom error type for RTK Query
interface ApiError {
  data?: {
    success?: boolean;
    message?: string;
    errorSources?: any[];
    err?: { statusCode?: number };
    stack?: string | null;
  };
  status?: number;
}

interface DecodedToken {
  role: string;
  // Add other JWT claims if needed (e.g., exp, iat)
}

const UserSignup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, { isLoading: isSignupLoading, isError: isSignupError, error }] = useSignupMutation();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Step 1: Signup the user with persistent admin token
      const signupResult = await signup({
        email,
        password,
        role: "salesUser",
      }).unwrap();
      console.log("Signup response:", signupResult);

      if (signupResult.success) {
        // Step 2: Redirect to dashboard after successful creation
        // Note: No login here; salesUser must log in separately
        router.push("/dashboard/dashboard");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      const errorData = (error as ApiError)?.data || {};
      console.log("Error details:", errorData); // Log full error data for debugging
      const errorMessage = errorData.message || "Unknown error";
      if (errorMessage === "No authorization token available. Please configure a valid admin token." || errorMessage === "No authorization token provided") {
        alert(
          "Signup failed: A valid admin token is required. Please configure it in the .env file or contact support."
        );
      } else {
        alert("Signup failed: " + errorMessage);
      }
      // Clear cookies on failure
      Cookies.remove("token");
      Cookies.remove("role");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url('/dashboardIcons/login.jpg')` }}
    >
      <div className="p-12 border border-gray-300 w-[400px] h-[500px] max-w-md">
        <div className="text-center py-12">
          <Image
            src="/dashboardIcons/logo.png"
            alt="Logo"
            width={225}
            height={100}
            className="mx-auto mb-4"
          />
        </div>
        <form onSubmit={handleSignup} className="">
          <div className="relative mb-6">
            <Image
              src="/dashboardIcons/user.png"
              alt="User Icon"
              width={20}
              height={20}
              className="absolute left-2 top-1/2 transform -translate-y-1/2"
            />
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full pl-10 p-2 text-gray-100 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="relative my-6">
            <Image
              src="/dashboardIcons/lock.png"
              alt="Password Icon"
              width={20}
              height={20}
              className="absolute left-2 top-1/2 transform -translate-y-1/2"
            />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full pl-10 p-2 text-gray-100 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSignupLoading}
            className="w-full mt-8 py-2 px-4 bg-white font-bold text-blue-600 rounded-md cursor-pointer "
          >
            {isSignupLoading ? "Signing up..." : "SIGNUP"}
          </button>
          {isSignupError && (
            <p className="text-red-500 text-sm text-center">Error signing up</p>
          )}
          
        </form>
      </div>
    </div>
  );
};

export default UserSignup;
