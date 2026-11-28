import { z } from 'zod';

/**
 * Esquema plano del Usuario según `toPublicUser` en `backend/models/User.js`.
 */
export const BackendUserDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  nombreCompleto: z.string().nullish().transform((v) => v ?? ''),
  direccion: z.string().nullish().transform((v) => v ?? ''),
  telefono: z.string().nullish().transform((v) => v ?? ''),
  whatsapp: z.string().nullish().transform((v) => v ?? ''),
  correoElectronico: z.string(),
  urlDocumentoIdentidad: z.string().nullish().transform((v) => v ?? ''),
  urlReciboServicio: z.string().nullish().transform((v) => v ?? ''),
  urlContratoDisclaimer: z.string().nullish().transform((v) => v ?? ''),
  urlComprobanteAceptacion: z.string().nullish().transform((v) => v ?? ''),
  fechaCreacion: z.union([z.string(), z.date(), z.null()]).transform((val) =>
    val instanceof Date ? val.toISOString() : val ? String(val) : new Date().toISOString()
  ).optional().default(() => new Date().toISOString()),
  fechaActualizacion: z.union([z.string(), z.date(), z.null()]).transform((val) =>
    val instanceof Date ? val.toISOString() : val ? String(val) : new Date().toISOString()
  ).optional().default(() => new Date().toISOString()),
  estado: z.string().nullish().transform((v) => v ?? 'activo'),
  role: z.string().nullish().transform((v) => v ?? undefined),
  kycStatus: z.string().nullish().transform((v) => v ?? undefined),
  kycNotes: z.string().nullish().transform((v) => v ?? ''),
  kycRejectedItems: z.array(z.string()).nullish().transform((v) => v ?? []),
  kycReviewedAt: z.union([z.string(), z.date(), z.null()]).optional(),
  plainPassword: z.string().nullish().transform((v) => v ?? undefined),
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
