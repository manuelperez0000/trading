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
  recoverPassword(email: string): Promise<{ success: boolean; message: string }>;
  resetPassword(params: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }>;
  logout(): Promise<void>;
}
