import type {
  AuthSession,
  User,
} from '@features/auth/domain/entities/User';
import {
  AuthResponseDtoSchema,
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

    // Soporte para la estructura plana de Usuario de Manuel
    if ('nombreCompleto' in u || 'correoElectronico' in u) {
      const email = String(u.correoElectronico || u.email || '');
      const fullName = String(u.nombreCompleto || u.full_name || email.split('@')[0] || 'Trader TLA');
      return {
        id: String(u.id ?? 'usr-remote'),
        fullName,
        email,
        handle: u.handle || `@${email.split('@')[0].toLowerCase() || 'trader'}`,
        role: u.role || (email.toLowerCase().includes('admin') ? 'ADMIN' : 'TRADER'),
        ninjaVersion: u.ninjaVersion || 'NinjaTrader 8.1.3.1 (64-bit)',
        defaultMachineId: u.defaultMachineId || 'WIN11-TRD-9F82A1C0',
        memberSince: u.fechaCreacion
          ? new Date(u.fechaCreacion).toLocaleDateString()
          : 'Noviembre 2026',
      };
    }

    // Formato estándar DTO (mock / arquitectura previa)
    const dto = UserDtoSchema.parse(u);
    return {
      id: dto.id,
      fullName: dto.full_name,
      email: dto.email,
      handle: dto.handle,
      role: dto.role,
      ninjaVersion: dto.ninja_version,
      defaultMachineId: dto.default_machine_id,
      memberSince: dto.member_since,
    };
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

    // Si viene del backend de Manuel con token JWT en body.token
    if ('token' in body && typeof body.token === 'string') {
      const token = body.token;
      const user = this.userToDomain(body.user ?? body);
      return {
        user,
        tokens: {
          accessToken: token,
          refreshToken: token,
          expiresInSeconds: 3600,
        },
      };
    }

    // Si viene de registro directo { body: { user: { ... } } }
    if (body.user && !body.tokens) {
      const user = this.userToDomain(body.user);
      return {
        user,
        tokens: {
          accessToken: 'jwt-registered-session',
          refreshToken: 'jwt-registered-session',
          expiresInSeconds: 3600,
        },
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
