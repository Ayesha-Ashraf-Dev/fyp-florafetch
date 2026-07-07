"use client";

import { Toaster } from "sonner";
import { ReactNode } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster 
          position="top-right"
          richColors
          theme="light"
          closeButton
        />
      </CartProvider>
    </AuthProvider>
  );
}
