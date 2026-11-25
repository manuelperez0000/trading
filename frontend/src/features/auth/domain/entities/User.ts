export type UserRole = 'ADMIN' | 'TRADER';

export interface User {
  id: string;
  fullName: string;
  email: string;
  handle: string;
  role: UserRole;
  ninjaVersion: string;
  defaultMachineId: string;
  memberSince: string;
  // Campos planos del modelo User en el backend Express / PostgreSQL
  direccion: string;
  telefono: string;
  whatsapp: string;
  urlDocumentoIdentidad: string;
  urlReciboServicio: string;
  urlContratoDisclaimer: string;
  urlComprobanteAceptacion: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  estado: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  requestedRole?: UserRole;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  direccion?: string;
  telefono?: string;
  whatsapp?: string;
  urlDocumentoIdentidad?: string;
  urlReciboServicio?: string;
  urlContratoDisclaimer?: string;
  urlComprobanteAceptacion?: string;
  defaultMachineId?: string;
}

/**
 * Verifica si el usuario ha completado todos los datos obligatorios de su perfil:
 * - Datos de contacto: direccion, telefono, whatsapp
 * - Documentación: urlDocumentoIdentidad, urlReciboServicio, urlContratoDisclaimer
 * (Para usuarios ADMIN retorna siempre true).
 */
export function isUserProfileComplete(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;

  const requiredFields = [
    user.direccion,
    user.telefono,
    user.whatsapp,
    user.urlDocumentoIdentidad,
    user.urlReciboServicio,
    user.urlContratoDisclaimer,
  ];

  return requiredFields.every((val) => typeof val === 'string' && val.trim().length > 0);
}
