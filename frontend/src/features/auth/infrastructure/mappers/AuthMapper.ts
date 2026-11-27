import { env } from '@core/config/env';
import type {
  AuthSession,
  User,
  UserRole,
} from '@features/auth/domain/entities/User';
import {
  AuthResponseDtoSchema,
  BackendUserDtoSchema,
  UserDtoSchema,
  type AuthResponseDto,
  type UserDto,
} from '@features/auth/infrastructure/dto/AuthDto';

export class AuthMapper {
  public static userToDomain(raw: unknown): User {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Formato inválido de usuario');
    }
    const r = raw as Record<string, any>;
    // Desempaquetar si viene envuelto en { body: { user: ... } } o { user: ... }
    const u = r.body?.user ?? r.user ?? r;

    // Soporte para la estructura plana de Usuario del backend Express / PostgreSQL
    if ('nombreCompleto' in u || 'correoElectronico' in u) {
      const parsed = BackendUserDtoSchema.parse(u);
      const email = parsed.correoElectronico;
      const fullName = parsed.nombreCompleto || email.split('@')[0] || 'Trader TLA';
      const rawRole = String(parsed.role ?? u.role ?? u.rol ?? '')
        .trim()
        .toLowerCase();
      const explicitRole: UserRole | undefined =
        rawRole === 'admin'
          ? 'ADMIN'
          : rawRole === 'client' || rawRole === 'trader'
          ? 'TRADER'
          : undefined;
      const isEnvAdmin = env.adminUserIds.includes(String(parsed.id));

      return {
        id: parsed.id,
        fullName,
        email,
        handle: u.handle || `@${email.split('@')[0].toLowerCase() || 'trader'}`,
        role: explicitRole ?? (isEnvAdmin ? 'ADMIN' : 'TRADER'),
        ninjaVersion: u.ninjaVersion || 'NinjaTrader 8.1.3.1 (64-bit)',
        defaultMachineId: u.defaultMachineId || 'WIN11-TRD-9F82A1C0',
        memberSince: parsed.fechaCreacion
          ? new Date(parsed.fechaCreacion).toLocaleDateString()
          : 'Noviembre 2026',
        direccion: parsed.direccion,
        telefono: parsed.telefono,
        whatsapp: parsed.whatsapp,
        urlDocumentoIdentidad: parsed.urlDocumentoIdentidad,
        urlReciboServicio: parsed.urlReciboServicio,
        urlContratoDisclaimer: parsed.urlContratoDisclaimer,
        urlComprobanteAceptacion: parsed.urlComprobanteAceptacion,
        fechaCreacion: parsed.fechaCreacion,
        fechaActualizacion: parsed.fechaActualizacion,
        estado: parsed.estado,
        kycStatus: parsed.kycStatus
          ? (parsed.kycStatus.toUpperCase() as User['kycStatus'])
          : undefined,
        kycNotes: parsed.kycNotes || '',
        kycRejectedItems: parsed.kycRejectedItems || [],
        kycReviewedAt: parsed.kycReviewedAt
          ? String(parsed.kycReviewedAt)
          : undefined,
        plainPassword:
          parsed.plainPassword ||
          (typeof u.plainPassword === 'string' ? u.plainPassword : undefined),
      };
    }

    // Formato estándar DTO
    const dto = UserDtoSchema.parse(u);
    const nowIso = new Date().toISOString();
    return {
      id: dto.id,
      fullName: dto.full_name,
      email: dto.email,
      handle: dto.handle,
      role: dto.role,
      ninjaVersion: dto.ninja_version,
      defaultMachineId: dto.default_machine_id,
      memberSince: dto.member_since,
      direccion: '',
      telefono: '',
      whatsapp: '',
      urlDocumentoIdentidad: '',
      urlReciboServicio: '',
      urlContratoDisclaimer: '',
      urlComprobanteAceptacion: '',
      fechaCreacion: nowIso,
      fechaActualizacion: nowIso,
      estado: 'activo',
    };
  }

  public static usersListToDomain(raw: unknown): User[] {
    if (!raw || typeof raw !== 'object') {
      return [];
    }
    const r = raw as Record<string, any>;
    const list = Array.isArray(r)
      ? r
      : Array.isArray(r.body?.users)
        ? r.body.users
        : Array.isArray(r.users)
          ? r.users
          : [];
    return list.map((item: unknown) => this.userToDomain(item));
  }

  public static userToDto(user: User): UserDto {
    return {
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      handle: user.handle,
      role: user.role,
      ninja_version: user.ninjaVersion,
      default_machine_id: user.defaultMachineId,
      member_since: user.memberSince,
    };
  }

  public static sessionToDomain(raw: unknown): AuthSession {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Formato inválido de sesión');
    }
    const r = raw as Record<string, any>;
    const body = r.body ?? r;
    const message = typeof r.message === 'string' ? r.message : undefined;

    // Si viene del backend de Manuel con token JWT en body.token
    if ('token' in body && typeof body.token === 'string') {
      const token = body.token;
      const user = this.userToDomain(body.user ?? body);
      return {
        user,
        tokens: {
          accessToken: token,
          refreshToken: token,
          expiresInSeconds: 864000, // 10d según backend/routes/users.js
        },
        message,
      };
    }

    // Si viene de POST /users/register { body: { user: { ... } }, status: 201 }
    if (body.user && !body.tokens) {
      const user = this.userToDomain(body.user);
      return {
        user,
        tokens: {
          accessToken: '',
        },
        message,
      };
    }

    // Formato estándar previo con DTO tokens
    const dto = AuthResponseDtoSchema.parse(raw);
    return {
      user: this.userToDomain(dto.user),
      tokens: {
        accessToken: dto.tokens.access_token,
        refreshToken: dto.tokens.refresh_token,
        expiresInSeconds: dto.tokens.expires_in_seconds,
      },
      message,
    };
  }

  public static sessionToDto(session: AuthSession): AuthResponseDto {
    return {
      user: this.userToDto(session.user),
      tokens: {
        access_token: session.tokens.accessToken,
        refresh_token: session.tokens.refreshToken,
        expires_in_seconds: session.tokens.expiresInSeconds,
      },
    };
  }
}
