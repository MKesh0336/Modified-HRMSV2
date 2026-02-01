import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  employee: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('access_token');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string, role: string = 'employee') => {
    // This function is now only for admin use - requires authentication token
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Authentication required to create employees');
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Use actual token instead of public key
        },
        body: JSON.stringify({ email, password, name, role })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create employee');
    }

    const data = await response.json();
    return data; // Return employee data but don't auto-login
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}