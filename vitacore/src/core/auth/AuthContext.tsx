import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { ICurrentUser } from '@forge/shared-types';
import { apiFetch } from '../api/client';

interface AuthContextType {
  user: ICurrentUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ICurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('forge_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiFetch<ICurrentUser>('/auth/me');
        if (response.data) {
          setUser(response.data);
        }
      } catch {
        // Clear invalid token
        localStorage.removeItem('forge_auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await apiFetch<{ token: string; user: ICurrentUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      const { token: jwtToken, user: authUser } = response.data;
      localStorage.setItem('forge_auth_token', jwtToken);
      setToken(jwtToken);
      setUser(authUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('forge_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
