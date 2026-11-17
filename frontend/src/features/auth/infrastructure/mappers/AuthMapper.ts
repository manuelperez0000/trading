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
    const dto = UserDtoSchema.parse(raw);
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
