export type UserRole = 'ADMIN' | 'TRADER';

export type KycVerificationStatus =
  | 'INCOMPLETO'
  | 'EN_REVISION'
  | 'OBSERVADO'
  | 'VERIFICADO';

export interface KycReviewRecord {
  kycStatus: KycVerificationStatus;
  kycNotes: string;
  kycRejectedItems: string[];
  kycReviewedAt: string;
}

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
  // Campos de auditoría y revisión KYC por el Administrador
  kycStatus?: KycVerificationStatus;
  kycNotes?: string;
  kycRejectedItems?: string[];
  kycReviewedAt?: string;
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

const KYC_REVIEWS_STORAGE_KEY = 'tla_kyc_reviews_v1';

export function getSavedKycReview(
  userId?: string,
  email?: string
): KycReviewRecord | null {
  try {
    const raw = localStorage.getItem(KYC_REVIEWS_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, KycReviewRecord>;
    if (userId && map[`id:${userId}`]) return map[`id:${userId}`];
    if (email && map[`email:${email.toLowerCase()}`]) {
      return map[`email:${email.toLowerCase()}`];
    }
    return null;
  } catch {
    return null;
  }
}

export function saveKycReviewLocally(
  user: { id: string; email: string },
  review: KycReviewRecord
): void {
  try {
    const raw = localStorage.getItem(KYC_REVIEWS_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, KycReviewRecord>) : {};
    if (user.id) map[`id:${user.id}`] = review;
    if (user.email) map[`email:${user.email.toLowerCase()}`] = review;
    localStorage.setItem(KYC_REVIEWS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

/**
 * Verifica si el usuario ya cargó los 6 campos requeridos (3 de contacto + 3 documentos).
 */
export function hasAllRequiredKycDocuments(
  user: User | null | undefined
): boolean {
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

  return requiredFields.every(
    (val) => typeof val === 'string' && val.trim().length > 0
  );
}

/**
 * Obtiene el estado real de verificación KYC del cliente:
 * - INCOMPLETO: Le faltan datos o documentos por subir.
 * - EN_REVISION: Ya envió todos sus documentos y está esperando revisión del Administrador.
 * - OBSERVADO: El Administrador detectó inconsistencias y envió un mensaje con lo que debe corregir.
 * - VERIFICADO: El Administrador aprobó sus documentos.
 */
export function getEffectiveKycStatus(
  user: User | null | undefined
): KycVerificationStatus {
  if (!user) return 'INCOMPLETO';
  if (user.role === 'ADMIN') return 'VERIFICADO';

  const savedReview = getSavedKycReview(user.id, user.email);
  const rawStatus = (
    savedReview?.kycStatus ||
    user.kycStatus ||
    user.estado ||
    ''
  )
    .toString()
    .trim()
    .toUpperCase();

  if (rawStatus === 'VERIFICADO' || rawStatus === 'APROBADO') {
    return 'VERIFICADO';
  }
  if (rawStatus === 'OBSERVADO' || rawStatus === 'RECHAZADO') {
    return 'OBSERVADO';
  }

  const allDocsFilled = hasAllRequiredKycDocuments(user);
  if (!allDocsFilled) {
    return 'INCOMPLETO';
  }

  return 'EN_REVISION';
}

export function getEffectiveKycReviewDetails(user: User | null | undefined): {
  status: KycVerificationStatus;
  notes: string;
  rejectedItems: string[];
  reviewedAt: string | null;
} {
  if (!user) {
    return {
      status: 'INCOMPLETO',
      notes: '',
      rejectedItems: [],
      reviewedAt: null,
    };
  }
  const saved = getSavedKycReview(user.id, user.email);
  const status = getEffectiveKycStatus(user);
  return {
    status,
    notes: saved?.kycNotes ?? user.kycNotes ?? '',
    rejectedItems: saved?.kycRejectedItems ?? user.kycRejectedItems ?? [],
    reviewedAt: saved?.kycReviewedAt ?? user.kycReviewedAt ?? null,
  };
}

/**
 * Un cliente solo tiene su perfil completamente habilitado para operar cuando
 * el Administrador lo ha revisado y marcado como VERIFICADO (o si su rol es ADMIN).
 */
export function isUserProfileComplete(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return getEffectiveKycStatus(user) === 'VERIFICADO';
}
