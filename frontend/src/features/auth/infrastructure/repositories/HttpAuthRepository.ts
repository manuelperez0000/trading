import { httpClient } from '@core/http/httpClient';
import type {
  AuthSession,
  LoginCredentials,
  RegisterInput,
  User,
} from '@features/auth/domain/entities/User';
import type { IAuthRepository } from '@features/auth/domain/repositories/AuthRepository';
import { AuthMapper } from '@features/auth/infrastructure/mappers/AuthMapper';

export class HttpAuthRepository implements IAuthRepository {
  public async login(credentials: LoginCredentials): Promise<AuthSession> {
    const raw = await httpClient.post<unknown>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      role: credentials.requestedRole,
    });
    const session = AuthMapper.sessionToDomain(raw);
    if (session.tokens.accessToken) {
      localStorage.setItem('nt_admin_jwt_token', session.tokens.accessToken);
    }
    return session;
  }

  public async register(input: RegisterInput): Promise<AuthSession> {
    const raw = await httpClient.post<unknown>('/auth/register', {
      full_name: input.fullName,
      email: input.email,
      password: input.password,
      default_machine_id: input.defaultMachineId,
    });
    const session = AuthMapper.sessionToDomain(raw);
    if (session.tokens.accessToken) {
      localStorage.setItem('nt_admin_jwt_token', session.tokens.accessToken);
    }
    return session;
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      const raw = await httpClient.get<unknown>('/auth/me');
      return AuthMapper.userToDomain(raw);
    } catch {
      return null;
    }
  }

  public async recoverPassword(email: string): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>('/auth/recover-password', {
      email,
    });
  }

  public async resetPassword(params: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>('/auth/reset-password', params);
  }

  public async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('nt_admin_jwt_token');
    }
  }
}
