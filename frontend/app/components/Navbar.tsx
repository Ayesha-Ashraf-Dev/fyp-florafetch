"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        apiClient.setToken(token);
        const profile = await apiClient.getProfile();
        setUser(profile);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
      }
    }
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold">
            🌿 FloraFetch
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/shop" className="hover:text-green-100">
              Shop
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/cart" className="hover:text-green-100">
                  🛒 Cart
                </Link>
                <Link href="/orders" className="hover:text-green-100">
                  Orders
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-100"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
