import type {
  AuthSession,
  LoginCredentials,
  RegisterInput,
  User,
} from '@features/auth/domain/entities/User';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  register(input: RegisterInput): Promise<AuthSession>;
  getCurrentUser(): Promise<User | null>;
  listUsers(): Promise<User[]>;
  recoverPassword(email: string): Promise<{ success: boolean; message: string }>;
  resetPassword(params: {
    token: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }>;
  logout(): Promise<void>;
}
