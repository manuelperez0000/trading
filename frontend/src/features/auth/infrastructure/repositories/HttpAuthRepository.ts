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
    // Manuel publica /users/login (con compatibilidad de nombres)
    let raw: unknown;
    try {
      raw = await httpClient.post<unknown>('/users/login', {
        correoElectronico: credentials.email,
        email: credentials.email,
        password: credentials.password,
      });
    } catch (err) {
      // Fallback a /auth/login en caso de API anterior
      raw = await httpClient.post<unknown>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        role: credentials.requestedRole,
      });
    }

    const session = AuthMapper.sessionToDomain(raw);
    if (session.tokens.accessToken) {
      localStorage.setItem('nt_admin_jwt_token', session.tokens.accessToken);
    }
    return session;
  }

  public async register(input: RegisterInput): Promise<AuthSession> {
    // Manuel publica /users/register con validaciones estrictas
    let raw: unknown;
    try {
      raw = await httpClient.post<unknown>('/users/register', {
        nombreCompleto: input.fullName,
        correoElectronico: input.email,
        password: input.password,
      });
    } catch (err) {
      // Fallback a /auth/register
      raw = await httpClient.post<unknown>('/auth/register', {
        full_name: input.fullName,
        email: input.email,
        password: input.password,
        default_machine_id: input.defaultMachineId,
      });
    }

    const session = AuthMapper.sessionToDomain(raw);
    if (session.tokens.accessToken) {
      localStorage.setItem('nt_admin_jwt_token', session.tokens.accessToken);
    }
    return session;
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      let raw: unknown;
      try {
        raw = await httpClient.get<unknown>('/users/me');
      } catch {
        raw = await httpClient.get<unknown>('/auth/me');
      }
      return AuthMapper.userToDomain(raw);
    } catch {
      return null;
    }
  }

  public async recoverPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await httpClient.post<any>('/users/recover-password', {
        correoElectronico: email,
        email,
      });
      return {
        success: true,
        message: res?.message ?? 'Instrucciones enviadas por correo electrónico.',
      };
    } catch {
      return httpClient.post<{ success: boolean; message: string }>('/auth/recover-password', {
        email,
      });
    }
  }

  public async resetPassword(params: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await httpClient.post<any>('/users/reset-password', {
        token: params.code,
        password: params.newPassword,
      });
      return {
        success: true,
        message: res?.message ?? 'Contraseña restablecida exitosamente.',
      };
    } catch {
      return httpClient.post<{ success: boolean; message: string }>('/auth/reset-password', params);
    }
  }

  public async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('nt_admin_jwt_token');
    }
  }
}
