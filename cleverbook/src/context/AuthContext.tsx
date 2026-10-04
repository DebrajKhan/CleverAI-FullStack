"use client";

import React, { createContext, useContext } from "react";
import { loginAction } from "@/app/actions";

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const login = async (email: string, password: string) => {
    const res = await loginAction(email, password);
    if (!res.success) {
      // Simulate axios error structure for the login page
      throw { response: { data: { detail: res.error } } };
    }
  };

  return (
    <AuthContext.Provider value={{ login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
