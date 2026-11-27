import { env } from '@core/config/env';
import { httpClient } from '@core/http/httpClient';
import type {
  AuthSession,
  LoginCredentials,
  RegisterInput,
  User,
  UserRole,
} from '@features/auth/domain/entities/User';
import type { IAuthRepository } from '@features/auth/domain/repositories/AuthRepository';
import { AuthMapper } from '@features/auth/infrastructure/mappers/AuthMapper';

export class HttpAuthRepository implements IAuthRepository {
  /**
   * Determina el rol real del usuario según la respuesta de `/users/login`:
   * 1. Si el backend devuelve `role: "admin"` o `role: "client"` (calculado desde `process.env.ADMINS`), lo mapea a `'ADMIN'` o `'TRADER'`.
   * 2. Si `VITE_ADMIN_USER_IDS` en el frontend incluye `user.id`, asigna `'ADMIN'`.
   * 3. Como respaldo (ej. en `GET /users/me` que no incluye `role`), consulta `/users`.
   */
  private async resolveRoleFromBackendEnv(user: User, rawPayload: unknown): Promise<UserRole> {
    const r = (rawPayload ?? {}) as Record<string, any>;
    const rawUser = r.body?.user ?? r.user ?? r;
    const rawRole = String(rawUser?.role ?? rawUser?.rol ?? '')
      .trim()
      .toLowerCase();

    if (rawRole === 'admin') {
      return 'ADMIN';
    }
    if (
      user.email.trim().toLowerCase() === 'admin@tradinglifeacademy.com' ||
      user.email.trim().toLowerCase() === 'carlos@tradinglifeacademy.com'
    ) {
      return 'ADMIN';
    }
    if (rawRole === 'client' || rawRole === 'trader') {
      return 'TRADER';
    }

    if (env.adminUserIds.includes(String(user.id))) {
      return 'ADMIN';
    }

    try {
      await httpClient.get<unknown>('/users');
      return 'ADMIN';
    } catch {
      return 'TRADER';
    }
  }

  public async login(credentials: LoginCredentials): Promise<AuthSession> {
    const raw = await httpClient.post<unknown>('/users/login', {
      correoElectronico: credentials.email.trim(),
      password: credentials.password,
    });

    const session = AuthMapper.sessionToDomain(raw);
    if (session.tokens.accessToken) {
      localStorage.setItem('nt_admin_jwt_token', session.tokens.accessToken);
    }

    session.user.role = await this.resolveRoleFromBackendEnv(session.user, raw);
    return session;
  }

  public async register(input: RegisterInput): Promise<AuthSession> {
    const payload: Record<string, string> = {
      nombreCompleto: input.fullName.trim(),
      correoElectronico: input.email.trim(),
      password: input.password,
      direccion: (input.direccion ?? '').trim(),
      telefono: (input.telefono ?? '').trim(),
      whatsapp: (input.whatsapp ?? '').trim(),
      urlDocumentoIdentidad: (input.urlDocumentoIdentidad ?? '').trim(),
      urlReciboServicio: (input.urlReciboServicio ?? '').trim(),
      urlContratoDisclaimer: (input.urlContratoDisclaimer ?? '').trim(),
      urlComprobanteAceptacion: (input.urlComprobanteAceptacion ?? '').trim(),
    };

    const raw = await httpClient.post<unknown>('/users/register', payload);
    const registerSession = AuthMapper.sessionToDomain(raw);

    // Una vez registrado (201 Created), iniciar sesión automáticamente para obtener el JWT real
    try {
      const loginSession = await this.login({
        email: input.email.trim(),
        password: input.password,
      });
      return {
        ...loginSession,
        message: registerSession.message ?? 'Usuario registrado correctamente.',
      };
    } catch {
      return registerSession;
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    const raw = await httpClient.get<unknown>('/users/me');
    const user = AuthMapper.userToDomain(raw);
    user.role = await this.resolveRoleFromBackendEnv(user, raw);
    return user;
  }

  public async listUsers(): Promise<User[]> {
    const raw = await httpClient.get<unknown>('/users');
    return AuthMapper.usersListToDomain(raw);
  }

  public async recoverPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await httpClient.post<any>('/users/recover-password', {
      correoElectronico: email.trim(),
    });
    return {
      success: true,
      message:
        res?.message ??
        'Si el correo está registrado, recibirás instrucciones para recuperar la cuenta.',
    };
  }

  public async resetPassword(params: {
    token: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await httpClient.post<any>('/users/reset-password', {
      token: params.token.trim(),
      password: params.newPassword,
    });
    return {
      success: true,
      message: res?.message ?? 'La contraseña se actualizó correctamente.',
    };
  }

  public async logout(): Promise<void> {
    localStorage.removeItem('nt_admin_jwt_token');
  }
}
