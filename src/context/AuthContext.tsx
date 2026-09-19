import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session, LoginCredentials, RegisterData } from '../services/auth/types';
import { AuthService } from '../services/auth/authService';
import { supabase } from '../services/supabase/supabaseClient';
import { SupabaseService } from '../services/supabase/supabaseService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (updates: Partial<User & { onboardingCompleted?: boolean }>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
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
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check initial session from local cache
    const initialSession = AuthService.getSession();
    if (initialSession) {
      setSession(initialSession);
      setUser(initialSession.user);
    }

    // 2. Listen to Supabase Auth state changes (OAuth callbacks for Google & Apple)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      if (sbSession?.user) {
        let profile = await SupabaseService.getProfile(sbSession.user.id);
        const provider = (sbSession.user.app_metadata?.provider as any) || 'email';
        const needsOnboarding = !profile || !profile.onboardingCompleted;

        if (!profile) {
          const rawName =
            sbSession.user.user_metadata?.full_name ||
            sbSession.user.user_metadata?.name ||
            sbSession.user.email?.split('@')[0] ||
            'Kullanıcı';

          profile = {
            id: sbSession.user.id,
            email: sbSession.user.email || '',
            fullName: rawName,
            name: rawName.split(' ')[0],
            username: sbSession.user.user_metadata?.username || sbSession.user.email?.split('@')[0] || 'user',
            avatar: sbSession.user.user_metadata?.avatar_url || sbSession.user.user_metadata?.picture || 'beam-2',
            avatarType: sbSession.user.user_metadata?.avatar_url ? 'custom' : 'beam',
            avatarColor: 'orange',
            authProvider: provider,
            plan: 'AURUM Pro',
            currencyPreference: 'TRY',
            onboardingCompleted: false,
            createdAt: sbSession.user.created_at,
          };
        } else {
          profile.authProvider = provider;
        }

        if (needsOnboarding) {
          setIsOnboardingOpen(true);
        }

        const appSession: Session = {
          user: profile,
          token: sbSession.access_token,
          expiresAt: sbSession.expires_at ? sbSession.expires_at * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000,
        };
        setUser(profile);
        setSession(appSession);
        localStorage.setItem('aurum_auth_session_v1', JSON.stringify(appSession));
        if (profile?.fullName) {
          const firstName = profile.fullName.trim().split(' ')[0];
          if (firstName) localStorage.setItem('aurum_last_user_name', firstName);
        } else if (profile?.username) {
          localStorage.setItem('aurum_last_user_name', profile.username);
        }
        if (profile?.username) {
          localStorage.setItem('aurum_last_username', profile.username);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        localStorage.removeItem('aurum_auth_session_v1');
      }
    });

    setIsLoading(false);

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(credentials);
      setUser(result.user);
      setSession(result.session);
      if (result.user?.fullName) {
        const firstName = result.user.fullName.trim().split(' ')[0];
        if (firstName) localStorage.setItem('aurum_last_user_name', firstName);
      } else if (result.user?.username) {
        localStorage.setItem('aurum_last_user_name', result.user.username);
      }
      if (result.user?.username) {
        localStorage.setItem('aurum_last_username', result.user.username);
      }
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
      if (result.user?.fullName) {
        const firstName = result.user.fullName.trim().split(' ')[0];
        if (firstName) localStorage.setItem('aurum_last_user_name', firstName);
      }
      if (result.user?.username) {
        localStorage.setItem('aurum_last_username', result.user.username);
      }
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
      if (result.user?.fullName) {
        const firstName = result.user.fullName.trim().split(' ')[0];
        if (firstName) localStorage.setItem('aurum_last_user_name', firstName);
      }
      if (result.user?.username) {
        localStorage.setItem('aurum_last_username', result.user.username);
      }
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
      if (updated?.fullName) {
        const firstName = updated.fullName.trim().split(' ')[0];
        if (firstName) localStorage.setItem('aurum_last_user_name', firstName);
      }
      if (updated?.username) {
        localStorage.setItem('aurum_last_username', updated.username);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    await AuthService.changePassword(oldPassword, newPassword);
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
        isOnboardingOpen,
        setIsOnboardingOpen,
        login,
        loginAsDemo,
        register,
        updateProfile,
        changePassword,
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
