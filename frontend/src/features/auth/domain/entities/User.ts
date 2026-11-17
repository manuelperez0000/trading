export type UserRole = 'ADMIN' | 'TRADER';

export interface User {
  id: string;
  fullName: string;
  email: string;
  handle: string;
  role: UserRole;
  ninjaVersion: string;
  defaultMachineId: string;
  memberSince: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  requestedRole?: UserRole;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password?: string;
  defaultMachineId?: string;
}
