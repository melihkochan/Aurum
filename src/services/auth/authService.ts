import type { User, Session, LoginCredentials, RegisterData } from './types';

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
    // Artificial small delay for premium feel
    await new Promise((r) => setTimeout(r, 350));

    const idInput = (credentials.identifier || credentials.email || credentials.username || '').trim().toLowerCase();
    const cleanId = idInput.startsWith('@') ? idInput.slice(1) : idInput;
    const password = credentials.password;

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

    // Special fallback for Melih demo user
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
    await new Promise((r) => setTimeout(r, 450));

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

    const users = this.getStoredUsers();
    const emailExists = users.some((u) => u.user.email.toLowerCase() === email);
    if (emailExists) {
      throw new Error('Bu e-posta adresi ile kayıtlı bir hesap zaten mevcut.');
    }

    const usernameExists = users.some((u) => (u.user.username || '').toLowerCase() === username);
    if (usernameExists) {
      throw new Error('Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçiniz.');
    }

    const firstName = fullName.split(' ')[0] || fullName;

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

    const newAccount: StoredUserAccount = {
      user: newUser,
      passwordHash: password,
    };

    users.push(newAccount);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));

    const session: Session = {
      user: newUser,
      token: 'aurum_jwt_' + Math.random().toString(36).substring(2) + Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    return { user: newUser, session };
  }

  public static async updateProfile(updates: Partial<User>): Promise<User> {
    await new Promise((r) => setTimeout(r, 250));
    const session = this.getSession();
    if (!session) throw new Error('Aktif oturum bulunamadı.');

    const updatedUser: User = { ...session.user, ...updates };
    const updatedSession: Session = { ...session, user: updatedUser };
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(updatedSession));

    const users = this.getStoredUsers();
    const updatedUsers = users.map((u) => (u.user.id === updatedUser.id ? { ...u, user: updatedUser } : u));
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updatedUsers));

    return updatedUser;
  }

  public static async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }

  public static async resetPassword(email: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 500));
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Lütfen geçerli bir e-posta adresi girin.');
    }
    // Simulation success
  }

  public static async loginWithGoogle(): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    throw new Error('Google ile giriş entegrasyonu Supabase Auth bağlantısından sonra aktif olacaktır.');
  }

  public static async loginWithApple(): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    throw new Error('Apple ile giriş entegrasyonu Supabase Auth bağlantısından sonra aktif olacaktır.');
  }
}
