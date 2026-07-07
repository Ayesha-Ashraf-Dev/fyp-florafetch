"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { apiClient, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        apiClient.clearToken();
        setUser(null);
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      apiClient.setToken(response.access_token);
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      const profile = await apiClient.getProfile();
      setUser(profile);
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const register = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      await apiClient.register(email, password, fullName, phone);
      // Auto login after registration
      await login(email, password);
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await apiClient.getProfile();
        setUser(profile);
      } catch (error) {
        logout();
        throw error;
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    checkAuth,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
