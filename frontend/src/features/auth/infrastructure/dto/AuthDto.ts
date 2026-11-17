import { z } from 'zod';

export const UserDtoSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  handle: z.string(),
  role: z.enum(['ADMIN', 'TRADER']),
  ninja_version: z.string(),
  default_machine_id: z.string(),
  member_since: z.string(),
});

export const AuthTokensDtoSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in_seconds: z.number().optional(),
});

export const AuthResponseDtoSchema = z.object({
  user: UserDtoSchema,
  tokens: AuthTokensDtoSchema,
});

export type UserDto = z.infer<typeof UserDtoSchema>;
export type AuthTokensDto = z.infer<typeof AuthTokensDtoSchema>;
export type AuthResponseDto = z.infer<typeof AuthResponseDtoSchema>;
