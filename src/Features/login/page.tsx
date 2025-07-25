

// "use client"; // Add this line to mark it as a Client Component

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import Cookies from "js-cookie";
// import { useLoginMutation } from "@/redux/api/auth/admin/adminApi";
// import { jwtDecode } from "jwt-decode";
// import Image from "next/image";

// interface DecodedToken {
//   role: string;
//   // Add other JWT claims if needed
// }

// const AdminLogin: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [login, { isLoading, isError }] = useLoginMutation();
//   const router = useRouter();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const result = await login({ email, password }).unwrap();
//       console.log("Login response:", result); // Debug the full response
//       const decodedToken = jwtDecode<DecodedToken>(result.data.accessToken);
//       if (decodedToken.role === "admin") {
//         Cookies.set("token", result.data.accessToken, { expires: 7 }); // Store accessToken for 7 days
//         router.push("/dashboard/dashboard");
//       } else {
//         throw new Error("Unauthorized: Admin role required");
//       }
//     } catch (error) {
//       console.error("Login failed:", error);
//       alert(
//         "Login failed: " + (error instanceof Error ? error.message : "Unknown error")
//       );
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center bg-cover bg-center"
//       style={{ backgroundImage: `url('/dashboardIcons/login.jpg')` }} // your image path in public/
//     >
//       <div className="p-12 border border-gray-300 w-[400px] h-[500px] max-w-md">
//         <div className="text-center py-12">
//           <Image
//             src="/dashboardIcons/logo.png"
//             alt="Logo"
//             width={225}
//             height={100}
//             className="mx-auto mb-4"
//           />
//         </div>
//         <form onSubmit={handleLogin} className="">
//           <div className="relative mb-6">
//             <Image
//               src="/dashboardIcons/user.png" // Replace with your user icon path
//               alt="User Icon"
//               width={20}
//               height={20}
//               className="absolute left-2 top-1/2 transform -translate-y-1/2"
//             />
//             <input
//               type="email"
//               id="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="mt-1 block w-full pl-10 p-2 text-gray-100 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div className="relative my-6">
//             <Image
//               src="/dashboardIcons/lock.png" 
//               alt="Password Icon"
//               width={20}
//               height={20}
//               className="absolute left-2 top-1/2 transform -translate-y-1/2"
//             />
//             <input
//               type="password"
//               id="password"
//               placeholder="PASSWORD"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="mt-1 block w-full pl-10 p-2 text-gray-100 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full mt-8 py-2 px-4 bg-white font-bold text-blue-600 rounded-md cursor-pointer "
//           >
//             {isLoading ? "Logging in..." : "LOGIN"}
//           </button>
//           {isError && (
//             <p className="text-red-500 text-sm text-center">Error logging in</p>
//           )}
//           <div className="text-end text-sm my-2 text-white">
//             <p className="cursor-pointer hover:underline">Forget Password? </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AdminLogin;


"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useLoginMutation } from "@/redux/api/auth/admin/adminApi";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";

interface DecodedToken {
  role: string;
  // Add other JWT claims if needed (e.g., exp, iat)
}

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, isError }] = useLoginMutation();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      console.log("Login response:", result); // Debug the full response
      const decodedToken = jwtDecode<DecodedToken>(result.data.accessToken);
      const role = decodedToken.role.toLowerCase();

      // Store token and role in cookies
      Cookies.set("token", result.data.accessToken, { expires: 7 });
      Cookies.set("role", role, { expires: 7 });

      // Redirect based on role
      if (role === "admin") {
        router.push("/dashboard/dashboard");
      } else if (role === "user" || role === "salesuser") { // Add salesUser as a valid user role
        router.push("/dashboard/prospact");
      } else {
        throw new Error("Unauthorized: Invalid role");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert(
        "Login failed: " + (error instanceof Error ? error.message : "Unknown error")
      );
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
            <p className="cursor-pointer hover:underline">Forget Password? </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
