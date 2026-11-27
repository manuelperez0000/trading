import { z } from 'zod';

/**
 * Esquema plano del Usuario según `toPublicUser` en `backend/models/User.js`.
 */
export const BackendUserDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  nombreCompleto: z.string(),
  direccion: z.string().optional().default(''),
  telefono: z.string().optional().default(''),
  whatsapp: z.string().optional().default(''),
  correoElectronico: z.string().email(),
  urlDocumentoIdentidad: z.string().optional().default(''),
  urlReciboServicio: z.string().optional().default(''),
  urlContratoDisclaimer: z.string().optional().default(''),
  urlComprobanteAceptacion: z.string().optional().default(''),
  fechaCreacion: z.union([z.string(), z.date()]).transform((val) =>
    val instanceof Date ? val.toISOString() : String(val)
  ).optional().default(() => new Date().toISOString()),
  fechaActualizacion: z.union([z.string(), z.date()]).transform((val) =>
    val instanceof Date ? val.toISOString() : String(val)
  ).optional().default(() => new Date().toISOString()),
  estado: z.string().optional().default('activo'),
  role: z.string().optional(),
  kycStatus: z.string().optional(),
  kycNotes: z.string().optional().default(''),
  kycRejectedItems: z.array(z.string()).optional().default([]),
  kycReviewedAt: z.union([z.string(), z.date(), z.null()]).optional(),
  plainPassword: z.string().optional(),
});

export type BackendUserDto = z.infer<typeof BackendUserDtoSchema>;

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
