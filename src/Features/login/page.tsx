
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useLoginMutation } from "@/redux/api/auth/admin/adminApi";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { useForgetPasswordSendEmailMutation, useSetNewPasswordMutation } from "@/redux/api/auth/admin/adminApi";
import { Label } from "@/components/ui/label";

interface DecodedToken {
  role: string;
}

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, isError }] = useLoginMutation();
  const [forgetEmail, setForgetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPass] = useState("");
  const [resetEmail, setResetEmail] = useState(""); // New state for email in reset modal
  const [isForgetModalOpen, setIsForgetModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [forgetPasswordSendEmail, { isLoading: isSendingOtp, isError: isOtpError }] = useForgetPasswordSendEmailMutation();
  const [setNewPassword, { isLoading: isResetting, isError: isResetError }] = useSetNewPasswordMutation();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      console.log("Login response:", result);
      const decodedToken = jwtDecode<DecodedToken>(result.data.accessToken);
      const role = decodedToken.role.toLowerCase();

      Cookies.set("token", result.data.accessToken, { expires: 7 });
      Cookies.set("role", role, { expires: 7 });

      if (role === "admin") {
        router.push("/dashboard/dashboard");
      } else if (role === "user" || role === "salesuser") {
        router.push("/dashboard/prospact");
      } else {
        throw new Error("Unauthorized: Invalid role");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert(
        "Login failed: " + (error instanceof Error ? error.message : "Unknown error")
      );
      Cookies.remove("token");
      Cookies.remove("role");
    }
  };

  const handleForgetPassword = () => {
    setIsForgetModalOpen(true);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgetPasswordSendEmail({ email: forgetEmail }).unwrap();
      alert("OTP sent to your email!");
      setIsForgetModalOpen(false);
      setIsResetModalOpen(true);
      setResetEmail(forgetEmail); // Pre-fill reset email with the one used for OTP
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert("Failed to send OTP: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setNewPassword({ email: resetEmail, otp, newPassword }).unwrap(); // Send email, otp, and newPassword
      alert("Password reset successfully! You can now log in.");
      setIsResetModalOpen(false);
      setForgetEmail("");
      setOtp("");
      setNewPass("");
      setResetEmail("");
    } catch (error) {
      console.error("Failed to reset password:", error);
      alert("Failed to reset password: " + (error instanceof Error ? error.message : "Unknown error"));
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
        <form onSubmit={handleLogin} className="">
          <div className="relative mb-6">
            <Image
              src="/dashboardIcons/user.png"
              alt="User Icon"
              width={20}
              height={20}
              className="absolute left-2 top-1/2 transform -translate-y-1/2"
            />
            <input
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
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full pl-10 p-2 text-gray-100 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 py-2 px-4 bg-white font-bold text-blue-600 rounded-md cursor-pointer "
          >
            {isLoading ? "Logging in..." : "LOGIN"}
          </button>
          {isError && (
            <p className="text-red-500 text-sm text-center">Error logging in</p>
          )}
          <div className="text-end text-sm my-2 text-white">
            <p className="cursor-pointer hover:underline" onClick={handleForgetPassword}>
              Forget Password?
            </p>
          </div>
        </form>

        {/* Forget Password Modal */}
        {isForgetModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Forget Password</h2>
              <form onSubmit={handleSendOtp}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgetEmail">Email</Label>
                    <input
                      type="email"
                      id="forgetEmail"
                      value={forgetEmail}
                      onChange={(e) => setForgetEmail(e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md"
                  >
                    {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                  </button>
                  {isOtpError && <p className="text-red-500 text-sm">Error sending OTP</p>}
                  <button
                    type="button"
                    onClick={() => setIsForgetModalOpen(false)}
                    className="w-full py-2 px-4 bg-gray-500 text-white rounded-md mt-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {isResetModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Reset Password</h2>
              <form onSubmit={handleResetPassword}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <input
                      type="email"
                      id="resetEmail"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-md"
                  >
                    {isResetting ? "Resetting..." : "Reset Password"}
                  </button>
                  {isResetError && <p className="text-red-500 text-sm">Error resetting password</p>}
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="w-full py-2 px-4 bg-gray-500 text-white rounded-md mt-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;