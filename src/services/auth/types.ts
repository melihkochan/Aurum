export type AvatarType = 'beam' | 'custom' | 'letter' | 'emoji';
export type AvatarColor = 'gold' | 'red' | 'purple' | 'blue' | 'green' | 'orange';

export interface User {
  id: string;
  name: string;
  fullName: string;
  username: string;
  email: string;
  avatar: string;
  avatarType: AvatarType;
  avatarColor?: AvatarColor;
  authProvider?: 'email' | 'google' | 'apple';
  plan?: string;
  avatarUrl?: string;
  currencyPreference?: 'TRY' | 'USD' | 'EUR';
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: number;
}

export interface LoginCredentials {
  identifier?: string;
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  avatarType?: AvatarType;
  avatarColor?: AvatarColor;
}

export interface AuthError {
  code: string;
  message: string;
}
