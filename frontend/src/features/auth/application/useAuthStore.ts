import { create } from 'zustand';
import type { User, UserRole, LoginCredentials, RegisterInput } from '@features/auth/domain/entities/User';
import { container } from '@app/di/container';

interface AuthState {
  isAuthenticated: boolean;
  user: User;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  loginAsDemoUser: (role?: UserRole) => User;
  refreshCurrentUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  switchRolePreview: (role: UserRole) => void;
  updateProfile: (partial: Partial<User>) => void;
}

const USER_STORAGE_KEY = 'tla_authenticated_user';
const TOKEN_STORAGE_KEY = 'nt_admin_jwt_token';
const SESSION_ACTIVE_KEY = 'tla_explicit_login_v2';
const MIGRATION_CLEANUP_KEY = 'tla_clean_public_init_v2';
const PROFILE_OVERRIDES_KEY = 'tla_user_profile_completed_v1';

function getSavedProfileOverrides(userId: string): Partial<User> {
  try {
    const raw = localStorage.getItem(PROFILE_OVERRIDES_KEY);
    if (!raw) return {};
    const map = JSON.parse(raw) as Record<string, Partial<User>>;
    return map[String(userId)] ?? {};
  } catch {
    return {};
  }
}

function saveProfileOverrides(userId: string, partial: Partial<User>): void {
  try {
    const raw = localStorage.getItem(PROFILE_OVERRIDES_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, Partial<User>>) : {};
    map[String(userId)] = { ...(map[String(userId)] ?? {}), ...partial };
    localStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

function mergeUserWithSavedOverrides(user: User): User {
  const overrides = getSavedProfileOverrides(user.id);
  return {
    ...user,
    direccion: user.direccion || overrides.direccion || '',
    telefono: user.telefono || overrides.telefono || '',
    whatsapp: user.whatsapp || overrides.whatsapp || '',
    urlDocumentoIdentidad:
      user.urlDocumentoIdentidad || overrides.urlDocumentoIdentidad || '',
    urlReciboServicio:
      user.urlReciboServicio || overrides.urlReciboServicio || '',
    urlContratoDisclaimer:
      user.urlContratoDisclaimer || overrides.urlContratoDisclaimer || '',
    urlComprobanteAceptacion:
      user.urlComprobanteAceptacion || overrides.urlComprobanteAceptacion || '',
    kycStatus: overrides.kycStatus || user.kycStatus,
    kycNotes:
      overrides.kycNotes !== undefined ? overrides.kycNotes : user.kycNotes,
    kycRejectedItems:
      overrides.kycRejectedItems || user.kycRejectedItems || [],
    kycReviewedAt: overrides.kycReviewedAt || user.kycReviewedAt,
  };
}

// Limpieza única de sesiones residuales antiguas para garantizar que el usuario inicie como visitante público (sin login)
try {
  if (!localStorage.getItem(MIGRATION_CLEANUP_KEY)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(SESSION_ACTIVE_KEY);
    localStorage.setItem(MIGRATION_CLEANUP_KEY, '1');
  }
} catch {
  // ignore storage errors
}

const DEFAULT_USER: User = {
  id: '1',
  fullName: 'Carlos Figuera',
  email: 'carlos@tradinglifeacademy.com',
  handle: '@carlos_tla',
  role: 'ADMIN',
  ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
  defaultMachineId: 'WIN11-TRD-9F82A1C0',
  memberSince: 'Enero 2026',
  direccion: 'Av. Principal 100',
  telefono: '+1 213-373-4253',
  whatsapp: '+1 213-373-4253',
  urlDocumentoIdentidad: '',
  urlReciboServicio: '',
  urlContratoDisclaimer: '',
  urlComprobanteAceptacion: '',
  fechaCreacion: '2026-01-15T12:00:00.000Z',
  fechaActualizacion: '2026-11-20T12:00:00.000Z',
  estado: 'activo',
};

function getInitialUser(): User {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_USER, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_USER;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Por defecto el visitante entra como público (no autenticado) hasta que inicie sesión explícitamente
  isAuthenticated:
    localStorage.getItem(SESSION_ACTIVE_KEY) === 'true' &&
    Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)),
  user: getInitialUser(),

  login: async (credentials) => {
    const session = await container.loginUseCase.execute(credentials);
    const mergedUser = mergeUserWithSavedOverrides(session.user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mergedUser));
    localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
    set({ isAuthenticated: true, user: mergedUser });
    return mergedUser;
  },

  register: async (input) => {
    const session = await container.registerUseCase.execute(input);
    const mergedUser = mergeUserWithSavedOverrides(session.user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mergedUser));
    localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
    set({ isAuthenticated: true, user: mergedUser });
    return mergedUser;
  },

  loginAsDemoUser: (role = 'TRADER') => {
    const demoUser: User = {
      ...DEFAULT_USER,
      id: role === 'ADMIN' ? '1' : '2',
      fullName: role === 'ADMIN' ? 'Carlos Figuera (Admin)' : 'Ana Pérez (Trader)',
      email:
        role === 'ADMIN'
          ? 'admin@tradinglifeacademy.com'
          : 'ana.perez@tradinglifeacademy.com',
      handle: role === 'ADMIN' ? '@carlos_admin' : '@ana_trader',
      role,
    };
    localStorage.setItem(TOKEN_STORAGE_KEY, 'demo-jwt-session-token');
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoUser));
    localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
    set({ isAuthenticated: true, user: demoUser });
    return demoUser;
  },

  refreshCurrentUser: async () => {
    const remoteUser = await container.getCurrentUserUseCase.execute();
    if (remoteUser) {
      const mergedUser = mergeUserWithSavedOverrides(remoteUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mergedUser));
      localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
      set({ isAuthenticated: true, user: mergedUser });
      return mergedUser;
    }
    return null;
  },

  logout: async () => {
    await container.logoutUseCase.execute();
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(SESSION_ACTIVE_KEY);
    set({ isAuthenticated: false, user: DEFAULT_USER });
  },

  switchRolePreview: (role) =>
    set((state) => {
      const updated = { ...state.user, role };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      return { user: updated };
    }),

  updateProfile: (partial) =>
    set((state) => {
      const updated = { ...state.user, ...partial };
      saveProfileOverrides(updated.id, partial);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      return { user: updated };
    }),
}));

// Garantiza que ante recargas en caliente (Vite HMR) sin sesión explícita activa, el estado sea no autenticado
if (
  typeof window !== 'undefined' &&
  localStorage.getItem(SESSION_ACTIVE_KEY) !== 'true'
) {
  useAuthStore.setState({ isAuthenticated: false });
}
