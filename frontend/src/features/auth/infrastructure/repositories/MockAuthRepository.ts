import type {
  AuthSession,
  LoginCredentials,
  RegisterInput,
  User,
} from '@features/auth/domain/entities/User';
import type { IAuthRepository } from '@features/auth/domain/repositories/AuthRepository';

const DEFAULT_MOCK_USER: User = {
  id: 'usr-001',
  fullName: 'Carlos Figuera',
  email: 'carlos@tradinglifeacademy.com',
  handle: '@carlos_tla',
  role: 'ADMIN',
  ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
  defaultMachineId: 'WIN11-TRD-9F82A1C0',
  memberSince: 'Enero 2026',
};

export class MockAuthRepository implements IAuthRepository {
  private currentUser: User | null = structuredClone(DEFAULT_MOCK_USER);

  public async login(credentials: LoginCredentials): Promise<AuthSession> {
    const user: User = {
      ...DEFAULT_MOCK_USER,
      email: credentials.email || DEFAULT_MOCK_USER.email,
      role: credentials.requestedRole || 'ADMIN',
    };
    this.currentUser = user;
    localStorage.setItem('nt_admin_jwt_token', 'mock_jwt_token_tla_session');

    return {
      user,
      tokens: {
        accessToken: 'mock_jwt_token_tla_session',
        refreshToken: 'mock_refresh_token_tla_session',
        expiresInSeconds: 86400,
      },
    };
  }

  public async register(input: RegisterInput): Promise<AuthSession> {
    const user: User = {
      id: `usr-${Date.now()}`,
      fullName: input.fullName || 'Nuevo Trader',
      email: input.email,
      handle: `@${input.fullName.toLowerCase().replace(/\s+/g, '_')}`,
      role: 'TRADER',
      ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
      defaultMachineId: input.defaultMachineId || 'WIN11-NEW-TRADER',
      memberSince: 'Hoy',
    };
    this.currentUser = user;
    localStorage.setItem('nt_admin_jwt_token', 'mock_jwt_token_tla_session');

    return {
      user,
      tokens: {
        accessToken: 'mock_jwt_token_tla_session',
        refreshToken: 'mock_refresh_token_tla_session',
        expiresInSeconds: 86400,
      },
    };
  }

  public async getCurrentUser(): Promise<User | null> {
    return this.currentUser ? structuredClone(this.currentUser) : null;
  }

  public async recoverPassword(_email: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Código de recuperación simulado enviado exitosamente.',
    };
  }

  public async resetPassword(_params: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Contraseña actualizada exitosamente en el simulador.',
    };
  }

  public async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('nt_admin_jwt_token');
  }
}
