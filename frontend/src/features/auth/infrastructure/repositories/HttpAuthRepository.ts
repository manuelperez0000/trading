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
    const raw = await httpClient.post<unknown>('/users/login', {
      correoElectronico: credentials.email.trim(),
      password: credentials.password,
    });

    const session = AuthMapper.sessionToDomain(raw);
    if (credentials.requestedRole) {
      session.user.role = credentials.requestedRole;
    }
    if (session.tokens.accessToken) {
      localStorage.setItem('nt_admin_jwt_token', session.tokens.accessToken);
    }
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
    return AuthMapper.userToDomain(raw);
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
