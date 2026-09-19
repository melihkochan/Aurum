import type { User, Session, LoginCredentials, RegisterData } from './types';
import { supabase } from '../supabase/supabaseClient';
import { SupabaseService } from '../supabase/supabaseService';

const STORAGE_KEYS = {
  AUTH_SESSION: 'aurum_auth_session_v1',
  REGISTERED_USERS: 'aurum_registered_users_v1',
};

// Default seed user for instant access/testing
const DEFAULT_USER: User = {
  id: 'usr-default-melih',
  email: 'melih@aurum.app',
  username: 'melih',
  fullName: 'Melih KOÇHAN',
  name: 'Melih',
  avatar: 'beam-2',
  avatarType: 'beam',
  avatarColor: 'orange',
  authProvider: 'email',
  plan: 'AURUM Pro',
  currencyPreference: 'TRY',
  createdAt: '2026-09-01T00:00:00.000Z',
};

interface StoredUserAccount {
  user: User;
  passwordHash: string; // Plain/mock hash for local prototype
}

export class AuthService {
  private static getStoredUsers(): StoredUserAccount[] {
    let users: StoredUserAccount[] = [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (data) {
        users = JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse registered users:', e);
    }

    // Ensure DEFAULT_USER with username 'melih' always exists and has current schema
    const defaultIndex = users.findIndex(
      (u) =>
        u.user.id === DEFAULT_USER.id ||
        u.user.email?.toLowerCase() === DEFAULT_USER.email.toLowerCase() ||
        u.user.username?.toLowerCase() === 'melih'
    );

    if (defaultIndex === -1) {
      users.unshift({
        user: DEFAULT_USER,
        passwordHash: 'Password123!',
      });
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    } else {
      // Patch missing fields from earlier schema if any
      const existing = users[defaultIndex];
      if (!existing.user.username || existing.passwordHash !== 'Password123!') {
        existing.user.username = 'melih';
        existing.passwordHash = 'Password123!';
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
      }
    }

    return users;
  }

  public static getSession(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (!raw) return null;
      const session: Session = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  public static getCurrentUser(): User | null {
    const session = this.getSession();
    return session ? session.user : null;
  }

  public static async loginAsDemo(): Promise<{ user: User; session: Session }> {
    await new Promise((r) => setTimeout(r, 250));

    const users = this.getStoredUsers();
    let account = users.find(
      (u) =>
        u.user.id === DEFAULT_USER.id ||
        u.user.email?.toLowerCase() === DEFAULT_USER.email.toLowerCase() ||
        u.user.username?.toLowerCase() === 'melih'
    );

    if (!account) {
      account = { user: DEFAULT_USER, passwordHash: 'Password123!' };
      users.unshift(account);
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    }

    const session: Session = {
      user: account.user,
      token: 'aurum_demo_jwt_' + Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    return { user: account.user, session };
  }

  public static async login(credentials: LoginCredentials): Promise<{ user: User; session: Session }> {
    const idInput = (credentials.identifier || credentials.email || credentials.username || '').trim().toLowerCase();
    const cleanId = idInput.startsWith('@') ? idInput.slice(1) : idInput;
    const password = credentials.password;

    // 1. If it looks like an email or not demo 'melih', attempt Supabase Auth first
    if (cleanId.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password,
        });

        if (!error && data.user) {
          // Fetch or generate profile
          let userProfile = await SupabaseService.getProfile(data.user.id);
          if (!userProfile) {
            userProfile = {
              id: data.user.id,
              email: data.user.email || cleanId,
              fullName: data.user.user_metadata?.full_name || cleanId.split('@')[0],
              name: (data.user.user_metadata?.full_name || cleanId.split('@')[0]).split(' ')[0],
              username: data.user.user_metadata?.username || cleanId.split('@')[0],
              avatar: data.user.user_metadata?.avatar || 'beam-2',
              avatarType: data.user.user_metadata?.avatar_type || 'beam',
              avatarColor: data.user.user_metadata?.avatar_color || 'orange',
              authProvider: 'email',
              plan: 'AURUM Pro',
              currencyPreference: 'TRY',
              createdAt: data.user.created_at,
            };
          }

          const session: Session = {
            user: userProfile,
            token: data.session?.access_token || 'sb_token_' + Date.now(),
            expiresAt: data.session?.expires_at ? data.session.expires_at * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000,
          };

          localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
          return { user: userProfile, session };
        }
      } catch (e) {
        console.warn('Supabase signInWithPassword fallback:', e);
      }
    }

    // 2. Local Demo / Fallback Login
    const users = this.getStoredUsers();
    let account = users.find((u) => {
      const uEmail = (u.user.email || '').toLowerCase();
      const uUser = (u.user.username || '').toLowerCase();
      return (
        uEmail === cleanId ||
        uUser === cleanId ||
        (cleanId === 'melih' && (uEmail === 'melih@aurum.app' || u.user.id === DEFAULT_USER.id))
      );
    });

    if (!account && (cleanId === 'melih' || cleanId === 'melih@aurum.app')) {
      account = { user: DEFAULT_USER, passwordHash: 'Password123!' };
      users.unshift(account);
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    }

    if (!account) {
      throw new Error('Bu e-posta veya kullanıcı adına ait bir hesap bulunamadı.');
    }

    if (account.passwordHash !== password) {
      throw new Error('Girdiğiniz şifre hatalı. Lütfen tekrar deneyiniz.');
    }

    const session: Session = {
      user: account.user,
      token: 'aurum_jwt_' + Math.random().toString(36).substring(2) + Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    return { user: account.user, session };
  }

  public static async register(data: RegisterData): Promise<{ user: User; session: Session }> {
    const email = data.email.trim().toLowerCase();
    const username = (data.username || '').trim().toLowerCase().replace(/^@/, '');
    const fullName = data.fullName.trim();
    const password = data.password;

    if (!username || username.length < 3) {
      throw new Error('Kullanıcı adı en az 3 karakter olmalıdır.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Geçerli bir e-posta adresi giriniz.');
    }
    if (!fullName) {
      throw new Error('Lütfen adınızı ve soyadınızı giriniz.');
    }
    if (password.length < 8) {
      throw new Error('Şifreniz en az 8 karakter olmalıdır.');
    }

    const firstName = fullName.split(' ')[0] || fullName;

    // 1. Attempt registration via Supabase Auth
    try {
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
            avatar: data.avatar || 'beam-2',
            avatar_type: data.avatarType || 'beam',
            avatar_color: data.avatarColor || 'orange',
          },
        },
      });

      if (sbError) {
        // If Supabase throws specific error (e.g., user already registered)
        if (sbError.message?.toLowerCase().includes('already registered')) {
          throw new Error('Bu e-posta adresi ile kayıtlı bir hesap zaten mevcut.');
        }
      }

      if (sbData?.user) {
        const newUser: User = {
          id: sbData.user.id,
          email,
          username,
          fullName,
          name: firstName,
          avatar: data.avatar || 'beam-2',
          avatarType: data.avatarType || 'beam',
          avatarColor: data.avatarColor || 'orange',
          authProvider: 'email',
          plan: 'AURUM Pro',
          currencyPreference: 'TRY',
          createdAt: new Date().toISOString(),
        };

        const session: Session = {
          user: newUser,
          token: sbData.session?.access_token || 'sb_token_' + Date.now(),
          expiresAt: sbData.session?.expires_at ? sbData.session.expires_at * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000,
        };

        localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
        return { user: newUser, session };
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      console.warn('Supabase signUp fallback to local storage:', err);
    }

    // 2. Local fallback registration if offline
    const users = this.getStoredUsers();
    if (users.some((u) => u.user.email.toLowerCase() === email)) {
      throw new Error('Bu e-posta adresi ile kayıtlı bir hesap zaten mevcut.');
    }

    const newUser: User = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email,
      username,
      fullName,
      name: firstName,
      avatar: data.avatar || 'beam-2',
      avatarType: data.avatarType || 'beam',
      avatarColor: data.avatarColor || 'orange',
      authProvider: 'email',
      plan: 'AURUM Pro',
      currencyPreference: 'TRY',
      createdAt: new Date().toISOString(),
    };

    users.push({ user: newUser, passwordHash: password });
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));

    const session: Session = {
      user: newUser,
      token: 'aurum_jwt_' + Math.random().toString(36).substring(2) + Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    return { user: newUser, session };
  }

  public static async updateProfile(updates: Partial<User & { onboardingCompleted?: boolean }>): Promise<User> {
    const session = this.getSession();
    if (!session) throw new Error('Aktif oturum bulunamadı.');

    const updatedUser: User = { ...session.user, ...updates };
    const updatedSession: Session = { ...session, user: updatedUser };
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(updatedSession));

    // Sync to Supabase in cloud
    try {
      await SupabaseService.updateProfile(session.user.id, updates);
    } catch (e) {
      console.warn('Supabase profile update warning:', e);
    }

    // Sync local store
    const users = this.getStoredUsers();
    const updatedUsers = users.map((u) => (u.user.id === updatedUser.id ? { ...u, user: updatedUser } : u));
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updatedUsers));

    return updatedUser;
  }

  public static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const session = this.getSession();
    if (!session) throw new Error('Aktif oturum bulunamadı.');

    if (!newPassword || newPassword.length < 8) {
      throw new Error('Yeni şifreniz en az 8 karakter uzunluğunda olmalıdır.');
    }

    // Try Supabase Auth password update
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } catch {
      // Local fallback
      const users = this.getStoredUsers();
      const userAcc = users.find((u) => u.user.id === session.user.id);
      if (userAcc && userAcc.passwordHash && userAcc.passwordHash !== currentPassword) {
        throw new Error('Mevcut şifreniz hatalı. Lütfen kontrol edip tekrar deneyiniz.');
      }
      if (userAcc) {
        userAcc.passwordHash = newPassword;
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
      }
    }
  }

  public static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut warning:', e);
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }

  public static async resetPassword(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Lütfen geçerli bir e-posta adresi girin.');
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
    } catch {
      // Graceful fallback
    }
  }

  public static async loginWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }

  public static async loginWithApple(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }
}
