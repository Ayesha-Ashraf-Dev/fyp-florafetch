"use client";

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from "react";
import { apiClient, CartItem, Plant } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  itemCount: number;
  loadCart: () => Promise<void>;
  addToCart: (plantId: number | string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn } = useAuth();

  const loadCart = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.getCart();
      setItems(response.items || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      loadCart();
    } else {
      setItems([]);
      setTotal(0);
    }
  }, [isLoggedIn, loadCart]);

  const addToCart = useCallback(async (plantId: number | string, quantity: number) => {
    if (!isLoggedIn) {
      throw new Error("Please log in to add items to cart");
    }
    try {
      await apiClient.addToCart(plantId, quantity);
      // Directly refresh cart after adding
      const response = await apiClient.getCart();
      console.log("Cart after add:", response); // Debug log
      setItems(response.items || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  }, [isLoggedIn]);

  const removeFromCart = useCallback(async (itemId: number) => {
    if (!isLoggedIn) {
      throw new Error("Please log in to modify your cart");
    }
    try {
      await apiClient.removeFromCart(itemId);
      // Immediately refresh cart
      const response = await apiClient.getCart();
      setItems(response.items || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  }, [isLoggedIn]);

  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    if (!isLoggedIn) {
      throw new Error("Please log in to modify your cart");
    }
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
      } else {
        await apiClient.updateCartItem(itemId, quantity);
        // Immediately refresh cart
        const response = await apiClient.getCart();
        setItems(response.items || []);
        setTotal(response.total || 0);
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      throw error;
    }
  }, [isLoggedIn, removeFromCart]);

  const clearCartFn = useCallback(async () => {
    if (!isLoggedIn) {
      throw new Error("Please log in to modify your cart");
    }
    try {
      await apiClient.clearCart();
      setItems([]);
      setTotal(0);
    } catch (error) {
      throw error;
    }
  }, [isLoggedIn]);

  const value: CartContextType = {
    items,
    total,
    isLoading,
    itemCount: items.length,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart: clearCartFn,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
