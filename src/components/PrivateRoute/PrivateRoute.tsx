


"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);
  const token = Cookies.get("token");
  const role = Cookies.get("role")?.toLowerCase();

  useEffect(() => {
    // Determine allowed roles based on the current route
    const isProspactRoute = pathname === "/dashboard/prospact";
    const allowedRoles = isProspactRoute ? ["admin", "user", "salesuser"] : ["admin"];

    if (!token) {
      router.push("/");
      return;
    }

    // if (role && !allowedRoles.includes(role)) {
    //   if (role === "salesuser" && !isProspactRoute) {
    //     router.push("/dashboard/prospact");
    //   } else {
    //     router.push("/");
    //   }
    //   return;
    // }

    setIsAllowed(true);
  }, [token, role, router, pathname]);

  if (isAllowed && token && role) {
    return <>{children}</>;
  }

  return null;
};

export default PrivateRoute;