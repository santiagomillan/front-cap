import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '@/types';
import { authApi } from '@/lib/api';

interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const decodeAndSetUser = useCallback((token: string): User | null => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('access_token');
        return null;
      }

      const user: User = {
        id: decoded.sub,
        email: decoded.email || decoded.sub,
        role: decoded.role || 'OPERATOR',
        name: decoded.email?.split('@')[0] || 'User',
      };
      
      return user;
    } catch {
      localStorage.removeItem('access_token');
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const user = decodeAndSetUser(token);
      setUser(user);
    }
    setIsLoading(false);
  }, [decodeAndSetUser]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login({ username, password });
      const token = response.access_token;
      localStorage.setItem('access_token', token);
      
      const user = decodeAndSetUser(token);
      if (user) {
        setUser(user);
      } else {
        throw new Error('Invalid token received');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Invalid credentials. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
