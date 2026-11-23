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
