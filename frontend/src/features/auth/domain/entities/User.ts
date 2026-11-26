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

function createMockDocSvgDataUrl(params: {
  title: string;
  subtitle: string;
  holderName: string;
  detailLine1: string;
  detailLine2: string;
  stampText: string;
  accentColor: string;
  isBlurry?: boolean;
}): string {
  const blurFilter = params.isBlurry
    ? '<filter id="b"><feGaussianBlur stdDeviation="2.4" /></filter>'
    : '';
  const filterAttr = params.isBlurry ? 'filter="url(#b)"' : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="380" viewBox="0 0 640 380">
    <defs>${blurFilter}</defs>
    <rect width="640" height="380" rx="18" fill="#0f172a"/>
    <rect x="12" y="12" width="616" height="356" rx="14" fill="#1e293b" stroke="${params.accentColor}" stroke-width="2"/>
    <rect x="28" y="28" width="584" height="54" rx="10" fill="#020617"/>
    <text x="46" y="54" fill="${params.accentColor}" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${params.title}</text>
    <text x="46" y="72" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11">${params.subtitle}</text>
    <g ${filterAttr}>
      <rect x="36" y="104" width="120" height="145" rx="10" fill="#0f172a" stroke="#334155"/>
      <circle cx="96" cy="155" r="26" fill="#334155"/>
      <path d="M58 228 C58 195 134 195 134 228 Z" fill="#334155"/>
      <text x="180" y="128" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11">TITULAR / CLIENTE:</text>
      <text x="180" y="150" fill="#f8fafc" font-family="Arial, sans-serif" font-size="18" font-weight="bold">${params.holderName}</text>
      <text x="180" y="185" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="13">${params.detailLine1}</text>
      <text x="180" y="212" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="13">${params.detailLine2}</text>
      <rect x="180" y="235" width="230" height="32" rx="6" fill="#020617" stroke="${params.accentColor}"/>
      <text x="194" y="256" fill="${params.accentColor}" font-family="monospace" font-size="12" font-weight="bold">${params.stampText}</text>
    </g>
    <text x="36" y="340" fill="#64748b" font-family="monospace" font-size="11">TRADING LIFE ACADEMY • EXPEDIENTE KYC DIGITAL DE PRUEBA</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_DEMO_TEST_CLIENTS: User[] = [
  {
    id: '101',
    fullName: 'Valeria Mendoza',
    email: 'valeria.mendoza@gmail.com',
    handle: '@valeria_nq',
    role: 'TRADER',
    ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
    defaultMachineId: 'WIN11-VAL-8821A',
    memberSince: '26/11/2026',
    direccion: 'Av. Libertador 450, Edif. Torre Financiera, Caracas, Venezuela',
    telefono: '+58 412-5551234',
    whatsapp: '+58 412-5551234',
    urlDocumentoIdentidad: createMockDocSvgDataUrl({
      title: 'DOCUMENTO NACIONAL DE IDENTIDAD (DNI)',
      subtitle: 'República Bolivariana de Venezuela • Cédula de Identidad',
      holderName: 'VALERIA MENDOZA',
      detailLine1: 'ID / Cédula: V-24.881.920 • Fecha Nac: 14/05/1995',
      detailLine2: 'Emisión: 2023 • Vencimiento: 2033 (VIGENTE)',
      stampText: 'DOC-ID VERIFICABLE #V24881920',
      accentColor: '#10b981',
    }),
    urlReciboServicio: createMockDocSvgDataUrl({
      title: 'RECIBO DE SERVICIO PÚBLICO (ELECTRICIDAD)',
      subtitle: 'Comprobante de Domicilio • Factura Mensual Noviembre 2026',
      holderName: 'VALERIA MENDOZA',
      detailLine1: 'Dirección: Av. Libertador 450, Edif. Torre Financiera, Caracas',
      detailLine2: 'Fecha de Facturación: 10/11/2026 (< 3 meses)',
      stampText: 'DOMICILIO COINCIDENTE',
      accentColor: '#38bdf8',
    }),
    urlContratoDisclaimer: createMockDocSvgDataUrl({
      title: 'CONTRATO DE LICENCIA Y DISCLAIMER DE RIESGO',
      subtitle: 'Trading Life Academy • Firma Electrónica Registrada',
      holderName: 'VALERIA MENDOZA',
      detailLine1: 'Identificación Firmante: V-24.881.920',
      detailLine2: 'Aceptación íntegra de cláusulas Non-Custodial SaaS',
      stampText: 'FIRMA: TLA-SIG-101-998A',
      accentColor: '#f59e0b',
    }),
    urlComprobanteAceptacion: '',
    fechaCreacion: '2026-11-26T10:00:00.000Z',
    fechaActualizacion: '2026-11-26T10:30:00.000Z',
    estado: 'en_revision',
    kycStatus: 'EN_REVISION',
  },
  {
    id: '102',
    fullName: 'Mateo Silva',
    email: 'mateo.silva.fx@gmail.com',
    handle: '@mateo_med',
    role: 'TRADER',
    ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
    defaultMachineId: 'WIN11-MAT-3391D',
    memberSince: '26/11/2026',
    direccion: 'Cra. 43A #1-50, El Poblado, Medellín, Colombia',
    telefono: '+57 300-8812345',
    whatsapp: '+57 300-8812345',
    urlDocumentoIdentidad: createMockDocSvgDataUrl({
      title: 'CÉDULA DE CIUDADANÍA • COLOMBIA',
      subtitle: 'República de Colombia • Identificación Oficial',
      holderName: 'MATEO SILVA',
      detailLine1: 'Nro. Documento: CC 1.037.654.321',
      detailLine2: 'Lugar de Expedición: Medellín, Antioquia (VIGENTE)',
      stampText: 'ID-COL-1037654321',
      accentColor: '#10b981',
    }),
    urlReciboServicio: createMockDocSvgDataUrl({
      title: 'FACTURA DE SERVICIOS PÚBLICOS EPM',
      subtitle: 'Empresas Públicas de Medellín • Comprobante Residencial',
      holderName: 'MATEO SILVA',
      detailLine1: 'Dirección: Cra. 43A #1-50, El Poblado, Medellín',
      detailLine2: 'Periodo Facturado: Noviembre 2026',
      stampText: 'EPM-FACT-2026-11',
      accentColor: '#38bdf8',
    }),
    urlContratoDisclaimer: createMockDocSvgDataUrl({
      title: 'CONTRATO DE LICENCIA Y DISCLAIMER DE RIESGO',
      subtitle: 'Trading Life Academy • Firma Electrónica Registrada',
      holderName: 'MATEO SILVA',
      detailLine1: 'Identificación Firmante: CC 1.037.654.321',
      detailLine2: 'Aceptación íntegra de cláusulas Non-Custodial SaaS',
      stampText: 'FIRMA: TLA-SIG-102-774B',
      accentColor: '#f59e0b',
    }),
    urlComprobanteAceptacion: '',
    fechaCreacion: '2026-11-26T11:00:00.000Z',
    fechaActualizacion: '2026-11-26T11:15:00.000Z',
    estado: 'en_revision',
    kycStatus: 'EN_REVISION',
  },
  {
    id: '103',
    fullName: 'Sofía Alarcón',
    email: 'sofia.alarcon.trd@yahoo.com',
    handle: '@sofia_cl',
    role: 'TRADER',
    ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
    defaultMachineId: 'WIN11-SOF-5120E',
    memberSince: '26/11/2026',
    direccion: 'Av. Apoquindo 4501, Las Condes, Santiago, Chile',
    telefono: '+56 9-8765-4321',
    whatsapp: '+56 9-8765-4321',
    urlDocumentoIdentidad: createMockDocSvgDataUrl({
      title: 'CÉDULA DE IDENTIDAD • CHILE',
      subtitle: 'Servicio de Registro Civil e Identificación',
      holderName: 'SOFÍA ALARCÓN',
      detailLine1: 'RUN: 19.442.810-K • Nacionalidad: Chilena',
      detailLine2: 'Fecha Vencimiento: 18/09/2031 (VIGENTE)',
      stampText: 'RUN-19442810K',
      accentColor: '#10b981',
    }),
    urlReciboServicio: createMockDocSvgDataUrl({
      title: 'BOLETA DE SUMINISTRO ELÉCTRICO ENEL',
      subtitle: 'Comprobante de Domicilio • Las Condes, Santiago',
      holderName: 'SOFÍA ALARCÓN',
      detailLine1: 'Dirección: Av. Apoquindo 4501, Las Condes, Santiago',
      detailLine2: 'Emisión: 05/11/2026 (Vigente)',
      stampText: 'ENEL-CL-88921',
      accentColor: '#38bdf8',
    }),
    urlContratoDisclaimer: createMockDocSvgDataUrl({
      title: 'CONTRATO DE LICENCIA Y DISCLAIMER DE RIESGO',
      subtitle: 'Trading Life Academy • Firma Electrónica Registrada',
      holderName: 'SOFÍA ALARCÓN',
      detailLine1: 'Identificación Firmante: RUN 19.442.810-K',
      detailLine2: 'Aceptación íntegra de cláusulas Non-Custodial SaaS',
      stampText: 'FIRMA: TLA-SIG-103-552C',
      accentColor: '#f59e0b',
    }),
    urlComprobanteAceptacion: '',
    fechaCreacion: '2026-11-26T11:20:00.000Z',
    fechaActualizacion: '2026-11-26T11:40:00.000Z',
    estado: 'en_revision',
    kycStatus: 'EN_REVISION',
  },
  {
    id: '104',
    fullName: 'Lucas Fernández',
    email: 'lucas.fernandez.nq@gmail.com',
    handle: '@lucas_madrid',
    role: 'TRADER',
    ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
    defaultMachineId: 'WIN11-LUC-9012F',
    memberSince: '25/11/2026',
    direccion: 'Calle de Serrano 88, Salamanca, 28006 Madrid, España',
    telefono: '+34 612-345-678',
    whatsapp: '+34 612-345-678',
    urlDocumentoIdentidad: createMockDocSvgDataUrl({
      title: 'DOCUMENTO NACIONAL DE IDENTIDAD • ESPAÑA',
      subtitle: 'Reino de España • DNI Electrónico',
      holderName: 'LUCAS FERNÁNDEZ',
      detailLine1: 'DNI: 51889234-Z • Madrid, España',
      detailLine2: 'Validez hasta: 12/04/2032',
      stampText: 'DNI-ES-51889234Z',
      accentColor: '#10b981',
    }),
    urlReciboServicio: createMockDocSvgDataUrl({
      title: 'FACTURA IBERDROLA CLIENTES • ESPAÑA',
      subtitle: 'Recibo de Suministro Eléctrico y Domicilio',
      holderName: 'LUCAS FERNÁNDEZ',
      detailLine1: 'Dirección en Recibo: Calle Gran Vía 12, Madrid (NO COINCIDE)',
      detailLine2: 'Fecha Emisión: Mayo 2025 (ANTIGÜEDAD > 3 MESES)',
      stampText: 'DIRECCIÓN DISTINTA A PERFIL',
      accentColor: '#f43f5e',
    }),
    urlContratoDisclaimer: createMockDocSvgDataUrl({
      title: 'CONTRATO DE LICENCIA Y DISCLAIMER DE RIESGO',
      subtitle: 'Trading Life Academy • Firma Electrónica Registrada',
      holderName: 'LUCAS FERNÁNDEZ',
      detailLine1: 'Identificación Firmante: 51889234-Z',
      detailLine2: 'Aceptación íntegra de cláusulas Non-Custodial SaaS',
      stampText: 'FIRMA: TLA-SIG-104-119D',
      accentColor: '#f59e0b',
    }),
    urlComprobanteAceptacion: '',
    fechaCreacion: '2026-11-25T16:00:00.000Z',
    fechaActualizacion: '2026-11-26T09:00:00.000Z',
    estado: 'en_revision',
    kycStatus: 'EN_REVISION',
  },
  {
    id: '105',
    fullName: 'Andrés Felipe Ríos',
    email: 'andres.rios.trader@outlook.com',
    handle: '@andres_es',
    role: 'TRADER',
    ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
    defaultMachineId: 'WIN11-AND-1940B',
    memberSince: '24/11/2026',
    direccion: 'Calle 93 #14-20, Chicó, Bogotá, Colombia',
    telefono: '+57 310-4449876',
    whatsapp: '+57 310-4449876',
    urlDocumentoIdentidad: createMockDocSvgDataUrl({
      title: 'DOCUMENTO DE IDENTIDAD (CAPTURA BORROSA)',
      subtitle: 'Imagen con baja resolución / Desenfoque detectado',
      holderName: 'ANDRÉS FELIPE RÍOS',
      detailLine1: 'ID: 1.020.458.912 (BORROSO / ILEGIBLE)',
      detailLine2: 'Se requiere nueva captura nítida',
      stampText: 'OBSERVADO: IMAGEN BORROSA',
      accentColor: '#f43f5e',
      isBlurry: true,
    }),
    urlReciboServicio: createMockDocSvgDataUrl({
      title: 'RECIBO DE ENERGÍA ENEL CODENSA',
      subtitle: 'Comprobante de Domicilio • Bogotá, Colombia',
      holderName: 'ANDRÉS FELIPE RÍOS',
      detailLine1: 'Dirección: Calle 93 #14-20, Chicó, Bogotá',
      detailLine2: 'Fecha: Noviembre 2026 (Válido)',
      stampText: 'RECIBO VÁLIDO',
      accentColor: '#38bdf8',
    }),
    urlContratoDisclaimer: createMockDocSvgDataUrl({
      title: 'CONTRATO DE LICENCIA Y DISCLAIMER DE RIESGO',
      subtitle: 'Trading Life Academy • Firma Electrónica Registrada',
      holderName: 'ANDRÉS FELIPE RÍOS',
      detailLine1: 'Identificación Firmante: 1.020.458.912',
      detailLine2: 'Aceptación íntegra de cláusulas Non-Custodial SaaS',
      stampText: 'FIRMA: TLA-SIG-105-441E',
      accentColor: '#f59e0b',
    }),
    urlComprobanteAceptacion: '',
    fechaCreacion: '2026-11-24T15:00:00.000Z',
    fechaActualizacion: '2026-11-25T18:00:00.000Z',
    estado: 'observado',
    kycStatus: 'OBSERVADO',
    kycNotes:
      'La foto del Documento de Identidad se ve borrosa e ilegible. Por favor sube una foto nítida donde se lean claramente tu nombre y número de identificación.',
    kycRejectedItems: ['urlDocumentoIdentidad'],
  },
  {
    id: '106',
    fullName: 'Camila Vargas',
    email: 'camila.vargas.futures@gmail.com',
    handle: '@camila_lima',
    role: 'TRADER',
    ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
    defaultMachineId: 'WIN11-CAM-6632G',
    memberSince: '23/11/2026',
    direccion: 'Av. José Larco 1232, Miraflores, Lima, Perú',
    telefono: '+51 987-654-321',
    whatsapp: '+51 987-654-321',
    urlDocumentoIdentidad: createMockDocSvgDataUrl({
      title: 'DOCUMENTO NACIONAL DE IDENTIDAD (RENIEC • PERÚ)',
      subtitle: 'República del Perú • DNI Vigente',
      holderName: 'CAMILA VARGAS',
      detailLine1: 'DNI: 72891045 • Lima, Perú',
      detailLine2: 'Vencimiento: 2030 (Válido)',
      stampText: 'RENIEC-PE-72891045',
      accentColor: '#10b981',
    }),
    urlReciboServicio: createMockDocSvgDataUrl({
      title: 'RECIBO DE LUZ DEL SUR • LIMA (DIRECCIÓN DISTINTA)',
      subtitle: 'Recibo con dirección diferente a la declarada',
      holderName: 'CAMILA VARGAS',
      detailLine1: 'Dirección en recibo: Jr. Cusco 410, Cercado (NO COINCIDE)',
      detailLine2: 'Antigüedad: Abril 2025 (VENCIDO > 3 MESES)',
      stampText: 'OBSERVADO: NO COINCIDE',
      accentColor: '#f43f5e',
    }),
    urlContratoDisclaimer: createMockDocSvgDataUrl({
      title: 'CONTRATO DE LICENCIA Y DISCLAIMER DE RIESGO',
      subtitle: 'Trading Life Academy • Firma Electrónica Registrada',
      holderName: 'CAMILA VARGAS',
      detailLine1: 'Identificación Firmante: 72891045',
      detailLine2: 'Aceptación íntegra de cláusulas Non-Custodial SaaS',
      stampText: 'FIRMA: TLA-SIG-106-309F',
      accentColor: '#f59e0b',
    }),
    urlComprobanteAceptacion: '',
    fechaCreacion: '2026-11-23T12:00:00.000Z',
    fechaActualizacion: '2026-11-25T10:00:00.000Z',
    estado: 'observado',
    kycStatus: 'OBSERVADO',
    kycNotes:
      'El Recibo de Servicio Público no coincide con la dirección de Miraflores declarada en tu perfil y tiene más de 3 meses de antigüedad. Por favor actualiza el recibo o corrige tu dirección.',
    kycRejectedItems: ['urlReciboServicio', 'direccion'],
  },
  {
    id: '107',
    fullName: 'Javier Morales',
    email: 'jmorales.quant@gmail.com',
    handle: '@javier_mnq',
    role: 'TRADER',
    ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
    defaultMachineId: 'WIN11-JAV-7712C',
    memberSince: '15/10/2026',
    direccion: 'Paseo de la Reforma 222, Juárez, CDMX, México',
    telefono: '+52 55-1234-5678',
    whatsapp: '+52 55-1234-5678',
    urlDocumentoIdentidad: createMockDocSvgDataUrl({
      title: 'CREDENCIAL PARA VOTAR INE • MÉXICO',
      subtitle: 'Instituto Nacional Electoral • Identificación Oficial',
      holderName: 'JAVIER MORALES',
      detailLine1: 'Clave Elector: MRLJAV90081209H200',
      detailLine2: 'Vigencia: 2024 - 2034 (APROBADO)',
      stampText: 'KYC APROBADO POR ADMIN',
      accentColor: '#10b981',
    }),
    urlReciboServicio: createMockDocSvgDataUrl({
      title: 'RECIBO CFE SUMINISTRADOR DE SERVICIOS • MÉXICO',
      subtitle: 'Comisión Federal de Electricidad • CDMX',
      holderName: 'JAVIER MORALES',
      detailLine1: 'Dirección: Paseo de la Reforma 222, CDMX',
      detailLine2: 'Periodo: Noviembre 2026 (APROBADO)',
      stampText: 'DOMICILIO VERIFICADO',
      accentColor: '#10b981',
    }),
    urlContratoDisclaimer: createMockDocSvgDataUrl({
      title: 'CONTRATO DE LICENCIA Y DISCLAIMER DE RIESGO',
      subtitle: 'Trading Life Academy • Firma Electrónica Verificada',
      holderName: 'JAVIER MORALES',
      detailLine1: 'Identificación Firmante: MRLJAV90081209H200',
      detailLine2: 'Contrato validado y archivado',
      stampText: 'FIRMA VERIFICADA: TLA-SIG-107',
      accentColor: '#10b981',
    }),
    urlComprobanteAceptacion: '',
    fechaCreacion: '2026-10-15T14:00:00.000Z',
    fechaActualizacion: '2026-11-10T14:00:00.000Z',
    estado: 'verificado',
    kycStatus: 'VERIFICADO',
  },
  {
    id: '108',
    fullName: 'Diego Herrera',
    email: 'diego.herrera.prop@gmail.com',
    handle: '@diego_baires',
    role: 'TRADER',
    ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
    defaultMachineId: 'WIN11-DIE-4109H',
    memberSince: '02/11/2026',
    direccion: 'Av. del Libertador 6200, Palermo, Buenos Aires, Argentina',
    telefono: '+54 9-11-2345-6789',
    whatsapp: '+54 9-11-2345-6789',
    urlDocumentoIdentidad: createMockDocSvgDataUrl({
      title: 'DNI REPÚBLICA ARGENTINA • RENAPER',
      subtitle: 'Documento Nacional de Identidad Mercosur',
      holderName: 'DIEGO HERRERA',
      detailLine1: 'DNI: 38.912.440 • Buenos Aires, Argentina',
      detailLine2: 'Vencimiento: 2034 (APROBADO)',
      stampText: 'KYC APROBADO POR ADMIN',
      accentColor: '#10b981',
    }),
    urlReciboServicio: createMockDocSvgDataUrl({
      title: 'FACTURA EDENOR S.A. • BUENOS AIRES',
      subtitle: 'Comprobante de Domicilio • Palermo, CABA',
      holderName: 'DIEGO HERRERA',
      detailLine1: 'Dirección: Av. del Libertador 6200, CABA',
      detailLine2: 'Emisión: Noviembre 2026 (APROBADO)',
      stampText: 'DOMICILIO VERIFICADO',
      accentColor: '#10b981',
    }),
    urlContratoDisclaimer: createMockDocSvgDataUrl({
      title: 'CONTRATO DE LICENCIA Y DISCLAIMER DE RIESGO',
      subtitle: 'Trading Life Academy • Firma Electrónica Verificada',
      holderName: 'DIEGO HERRERA',
      detailLine1: 'Identificación Firmante: DNI 38.912.440',
      detailLine2: 'Contrato validado y archivado',
      stampText: 'FIRMA VERIFICADA: TLA-SIG-108',
      accentColor: '#10b981',
    }),
    urlComprobanteAceptacion: '',
    fechaCreacion: '2026-11-02T11:00:00.000Z',
    fechaActualizacion: '2026-11-05T16:00:00.000Z',
    estado: 'verificado',
    kycStatus: 'VERIFICADO',
  },
  {
    id: '109',
    fullName: 'Sebastián Castro',
    email: 'sebastian.castro@hotmail.com',
    handle: '@sebas_pty',
    role: 'TRADER',
    ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
    defaultMachineId: 'WIN11-SEB-2094J',
    memberSince: '26/11/2026',
    direccion: 'Calle 50, PH Global Plaza, Ciudad de Panamá, Panamá',
    telefono: '+507 6123-4567',
    whatsapp: '+507 6123-4567',
    urlDocumentoIdentidad: createMockDocSvgDataUrl({
      title: 'CÉDULA DE IDENTIDAD PERSONAL • PANAMÁ',
      subtitle: 'Tribunal Electoral de Panamá',
      holderName: 'SEBASTIÁN CASTRO',
      detailLine1: 'Cédula: 8-892-1450 • Ciudad de Panamá',
      detailLine2: 'Vigencia: 2031 (Cargado)',
      stampText: 'ID-PTY-88921450',
      accentColor: '#38bdf8',
    }),
    urlReciboServicio: '',
    urlContratoDisclaimer: '',
    urlComprobanteAceptacion: '',
    fechaCreacion: '2026-11-26T08:00:00.000Z',
    fechaActualizacion: '2026-11-26T08:15:00.000Z',
    estado: 'incompleto',
    kycStatus: 'INCOMPLETO',
  },
  {
    id: '110',
    fullName: 'Elena Navarro',
    email: 'elena.navarro.es@gmail.com',
    handle: '@elena_quito',
    role: 'TRADER',
    ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
    defaultMachineId: 'WIN11-ELE-7741K',
    memberSince: '26/11/2026',
    direccion: '',
    telefono: '+593 99-123-4567',
    whatsapp: '+593 99-123-4567',
    urlDocumentoIdentidad: '',
    urlReciboServicio: '',
    urlContratoDisclaimer: '',
    urlComprobanteAceptacion: '',
    fechaCreacion: '2026-11-26T12:00:00.000Z',
    fechaActualizacion: '2026-11-26T12:00:00.000Z',
    estado: 'incompleto',
    kycStatus: 'INCOMPLETO',
  },
];

const TEST_CLIENTS_STORAGE_KEY = 'tla_demo_test_clients_v1';

export function getStoredTestClients(): User[] {
  try {
    const raw = localStorage.getItem(TEST_CLIENTS_STORAGE_KEY);
    if (!raw) return INITIAL_DEMO_TEST_CLIENTS;
    const customList = JSON.parse(raw) as User[];
    const customEmails = new Set(customList.map((u) => u.email.toLowerCase()));
    const merged = [
      ...customList,
      ...INITIAL_DEMO_TEST_CLIENTS.filter(
        (d) => !customEmails.has(d.email.toLowerCase())
      ),
    ];
    return merged;
  } catch {
    return INITIAL_DEMO_TEST_CLIENTS;
  }
}

export function createNewTestClient(params: {
  fullName: string;
  email: string;
  whatsapp: string;
  direccion: string;
  presetStatus: KycVerificationStatus;
  kycNotes?: string;
}): User {
  const cleanName = params.fullName.trim();
  const cleanEmail = params.email.trim().toLowerCase();
  const id = String(Date.now()).slice(-5);
  const includeDocs = params.presetStatus !== 'INCOMPLETO';

  const newClient: User = {
    id,
    fullName: cleanName,
    email: cleanEmail,
    handle: `@${cleanEmail.split('@')[0].replace(/[^a-z0-9_]/gi, '')}`,
    role: 'TRADER',
    ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
    defaultMachineId: `WIN11-TST-${id}`,
    memberSince: new Date().toLocaleDateString(),
    direccion: params.direccion.trim() || 'Av. Principal 500, Edif. Central',
    telefono: params.whatsapp.trim(),
    whatsapp: params.whatsapp.trim(),
    urlDocumentoIdentidad: includeDocs
      ? createMockDocSvgDataUrl({
          title: 'DOCUMENTO DE IDENTIDAD OFICIAL',
          subtitle: 'Expediente Digital de Prueba • TLA',
          holderName: cleanName.toUpperCase(),
          detailLine1: `Documento ID: DOC-${id}-2026`,
          detailLine2: 'Estado: Documento Adjunto para Auditoría',
          stampText: `ID-${id}`,
          accentColor:
            params.presetStatus === 'OBSERVADO' ? '#f43f5e' : '#10b981',
          isBlurry: params.presetStatus === 'OBSERVADO',
        })
      : '',
    urlReciboServicio: includeDocs
      ? createMockDocSvgDataUrl({
          title: 'RECIBO DE SERVICIO PÚBLICO (DOMICILIO)',
          subtitle: 'Comprobante Residencial • TLA',
          holderName: cleanName.toUpperCase(),
          detailLine1: `Dirección: ${params.direccion.trim() || 'Av. Principal 500'}`,
          detailLine2: 'Emisión: Noviembre 2026',
          stampText: `RECIBO-${id}`,
          accentColor: '#38bdf8',
        })
      : '',
    urlContratoDisclaimer: includeDocs
      ? createMockDocSvgDataUrl({
          title: 'CONTRATO DE LICENCIA Y DISCLAIMER DE RIESGO',
          subtitle: 'Firma Electrónica Registrada • TLA',
          holderName: cleanName.toUpperCase(),
          detailLine1: `Firmante: ${cleanName}`,
          detailLine2: 'Aceptación de términos Non-Custodial SaaS',
          stampText: `TLA-SIG-${id}`,
          accentColor: '#f59e0b',
        })
      : '',
    urlComprobanteAceptacion: '',
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    estado: params.presetStatus.toLowerCase(),
    kycStatus: params.presetStatus,
    kycNotes:
      params.presetStatus === 'OBSERVADO'
        ? params.kycNotes ||
          'El documento de identidad presenta baja nitidez. Por favor adjunta una nueva captura.'
        : '',
    kycRejectedItems:
      params.presetStatus === 'OBSERVADO' ? ['urlDocumentoIdentidad'] : [],
  };

  try {
    const current = getStoredTestClients();
    const updated = [
      newClient,
      ...current.filter((u) => u.email.toLowerCase() !== cleanEmail),
    ];
    localStorage.setItem(TEST_CLIENTS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }

  saveKycReviewLocally(
    { id: newClient.id, email: newClient.email },
    {
      kycStatus: newClient.kycStatus || 'EN_REVISION',
      kycNotes: newClient.kycNotes || '',
      kycRejectedItems: newClient.kycRejectedItems || [],
      kycReviewedAt: new Date().toISOString(),
    }
  );

  return newClient;
}
