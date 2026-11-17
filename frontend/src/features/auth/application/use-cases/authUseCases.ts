import type {
  AuthSession,
  LoginCredentials,
  RegisterInput,
  User,
} from '@features/auth/domain/entities/User';
import type { IAuthRepository } from '@features/auth/domain/repositories/AuthRepository';

export class LoginUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  public async execute(credentials: LoginCredentials): Promise<AuthSession> {
    if (!credentials.email.trim()) {
      throw new Error('El correo electrónico es requerido.');
    }
    return this.repository.login(credentials);
  }
}

export class RegisterUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  public async execute(input: RegisterInput): Promise<AuthSession> {
    if (!input.fullName.trim()) {
      throw new Error('El nombre completo es requerido.');
    }
    if (!input.email.trim()) {
      throw new Error('El correo electrónico es requerido.');
    }
    return this.repository.register(input);
  }
}

export class GetCurrentUserUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  public async execute(): Promise<User | null> {
    return this.repository.getCurrentUser();
  }
}

export class RecoverPasswordUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  public async execute(email: string): Promise<{ success: boolean; message: string }> {
    if (!email.trim()) {
      throw new Error('El correo electrónico es requerido.');
    }
    return this.repository.recoverPassword(email);
  }
}

export class ResetPasswordUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  public async execute(params: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    if (!params.code.trim() || params.newPassword.length < 6) {
      throw new Error('Código inválido o contraseña menor a 6 caracteres.');
    }
    return this.repository.resetPassword(params);
  }
}

export class LogoutUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  public async execute(): Promise<void> {
    return this.repository.logout();
  }
}
