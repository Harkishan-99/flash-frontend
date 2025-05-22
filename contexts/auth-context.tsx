"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, LoginCredentials, RegisterData, AuthResponse } from '@/lib/auth-service';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we're in a browser
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
          // No token found, user is not authenticated
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Token exists, get user from localStorage or fetch if needed
        let userData = null;
        const userJson = localStorage.getItem('user');
        
        if (userJson) {
          try {
            userData = JSON.parse(userJson);
          } catch (e) {
            
          }
        }
        
        // If no valid user data in localStorage, fetch it
        if (!userData) {
          try {
            userData = await authService.getUserDetails();
            if (userData) {
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (error) {
            
            // Token might be invalid, clear it
            authService.logout();
          }
        }
        
        setUser(userData);
      } catch (error) {
        
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await authService.register(data);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 