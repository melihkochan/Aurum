import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session, LoginCredentials, RegisterData } from '../services/auth/types';
import { AuthService } from '../services/auth/authService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial session on app mount
    const initialSession = AuthService.getSession();
    if (initialSession) {
      setSession(initialSession);
      setUser(initialSession.user);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(credentials);
      setUser(result.user);
      setSession(result.session);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.loginAsDemo();
      setUser(result.user);
      setSession(result.session);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await AuthService.register(data);
      setUser(result.user);
      setSession(result.session);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    setIsLoading(true);
    try {
      const updated = await AuthService.updateProfile(updates);
      setUser(updated);
      setSession(AuthService.getSession());
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await AuthService.resetPassword(email);
  };

  const loginWithGoogle = async () => {
    await AuthService.loginWithGoogle();
  };

  const loginWithApple = async () => {
    await AuthService.loginWithApple();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        register,
        updateProfile,
        logout,
        resetPassword,
        loginWithGoogle,
        loginWithApple,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
