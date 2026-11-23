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
      throw new Error('El correo electrónico es obligatorio.');
    }
    if (!credentials.password) {
      throw new Error('La contraseña es obligatoria.');
    }
    return this.repository.login(credentials);
  }
}

export class RegisterUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  public async execute(input: RegisterInput): Promise<AuthSession> {
    if (!input.fullName.trim()) {
      throw new Error('El nombre completo es obligatorio.');
    }
    if (!input.email.trim()) {
      throw new Error('El correo electrónico es obligatorio.');
    }
    if (!input.password || new TextEncoder().encode(input.password).length < 8) {
      throw new Error('La contraseña debe tener al menos 8 bytes UTF-8.');
    }
    if (new TextEncoder().encode(input.password).length > 72) {
      throw new Error('La contraseña no puede superar 72 bytes UTF-8.');
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

export class ListUsersUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  public async execute(): Promise<User[]> {
    return this.repository.listUsers();
  }
}

export class RecoverPasswordUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  public async execute(email: string): Promise<{ success: boolean; message: string }> {
    if (!email.trim()) {
      throw new Error('Introduce un correo válido.');
    }
    return this.repository.recoverPassword(email);
  }
}

export class ResetPasswordUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  public async execute(params: {
    token: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const byteLen = new TextEncoder().encode(params.newPassword).length;
    if (!params.token.trim() || byteLen < 8 || byteLen > 72) {
      throw new Error(
        'El token es obligatorio y la contraseña debe tener entre 8 y 72 bytes.'
      );
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
