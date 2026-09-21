'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  login: (
    email: string,
    password: string,
    requiredRole?: 'customer' | 'admin'
  ) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (
    data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      address?: string;
      city?: string;
      postalCode?: string;
    }
  ) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nusamart_session_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load session user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    requiredRole?: 'customer' | 'admin'
  ) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, requiredRole }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Login gagal. Periksa kembali email dan password.',
        };
      }

      setUser(data.user);
      localStorage.setItem('nusamart_session_user', JSON.stringify(data.user));
      return { success: true, message: 'Berhasil masuk!', user: data.user };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Terjadi kesalahan saat menghubungi server.',
      };
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Pendaftaran gagal.',
        };
      }

      setUser(data.user);
      localStorage.setItem('nusamart_session_user', JSON.stringify(data.user));
      return { success: true, message: 'Pendaftaran berhasil!', user: data.user };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Terjadi kesalahan saat mendaftarkan akun.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('nusamart_session_user');
    } catch (e) {
      console.error(e);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isCustomer,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
