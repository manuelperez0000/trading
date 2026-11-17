import { create } from 'zustand';
import type { User, UserRole, LoginCredentials, RegisterInput } from '@features/auth/domain/entities/User';
import { container } from '@app/di/container';

interface AuthState {
  isAuthenticated: boolean;
  user: User;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  switchRolePreview: (role: UserRole) => void;
  updateProfile: (partial: Partial<User>) => void;
}

const DEFAULT_USER: User = {
  id: 'usr-001',
  fullName: 'Carlos Figuera',
  email: 'carlos@tradinglifeacademy.com',
  handle: '@carlos_tla',
  role: 'ADMIN',
  ninjaVersion: 'NinjaTrader 8.1.3.1 (64-bit)',
  defaultMachineId: 'WIN11-TRD-9F82A1C0',
  memberSince: 'Enero 2026',
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  user: DEFAULT_USER,

  login: async (credentials) => {
    const session = await container.loginUseCase.execute(credentials);
    set({ isAuthenticated: true, user: session.user });
    return session.user;
  },

  register: async (input) => {
    const session = await container.registerUseCase.execute(input);
    set({ isAuthenticated: true, user: session.user });
    return session.user;
  },

  logout: async () => {
    await container.logoutUseCase.execute();
    set({ isAuthenticated: false });
  },

  switchRolePreview: (role) =>
    set((state) => ({
      user: { ...state.user, role },
    })),

  updateProfile: (partial) =>
    set((state) => ({
      user: { ...state.user, ...partial },
    })),
}));
