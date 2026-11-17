import { env, type DataSourceMode } from '@core/config/env';

// Suscripciones y NinjaTrader Bridge
import type { ISubscriptionRepository } from '@features/subscriptions/domain/repositories/SubscriptionRepository';
import { MockSimulatorSubscriptionRepository } from '@features/subscriptions/infrastructure/repositories/MockSimulatorSubscriptionRepository';
import { HttpSubscriptionRepository } from '@features/subscriptions/infrastructure/repositories/HttpSubscriptionRepository';
import {
  GlobalKillSwitchUseCase,
  ResetMachineIdUseCase,
  SimulateNinjaHeartbeatUseCase,
  ToggleRemoteSubscriptionUseCase,
} from '@features/subscriptions/application/use-cases/subscriptionUseCases';

// Muro Social
import type { ISocialWallRepository } from '@features/social-wall/domain/repositories/SocialWallRepository';
import { MockSocialWallRepository } from '@features/social-wall/infrastructure/repositories/MockSocialWallRepository';
import { HttpSocialWallRepository } from '@features/social-wall/infrastructure/repositories/HttpSocialWallRepository';
import {
  CreateSocialPostUseCase,
  ModerateSocialPostUseCase,
} from '@features/social-wall/application/use-cases/socialWallUseCases';

// Autenticación y Usuarios
import type { IAuthRepository } from '@features/auth/domain/repositories/AuthRepository';
import { MockAuthRepository } from '@features/auth/infrastructure/repositories/MockAuthRepository';
import { HttpAuthRepository } from '@features/auth/infrastructure/repositories/HttpAuthRepository';
import {
  GetCurrentUserUseCase,
  LoginUseCase,
  LogoutUseCase,
  RecoverPasswordUseCase,
  RegisterUseCase,
  ResetPasswordUseCase,
} from '@features/auth/application/use-cases/authUseCases';

// Catálogo de Bots
import type { IBotRepository } from '@features/bots-catalog/domain/repositories/BotRepository';
import { MockBotRepository } from '@features/bots-catalog/infrastructure/repositories/MockBotRepository';
import { HttpBotRepository } from '@features/bots-catalog/infrastructure/repositories/HttpBotRepository';
import {
  CreateBotUseCase,
  GetBotDetailUseCase,
  GetBotsUseCase,
  LinkBotToLicenseUseCase,
} from '@features/bots-catalog/application/use-cases/botUseCases';

// Facturación y Cuenta de Usuario
import type { IAccountRepository } from '@features/account/domain/repositories/AccountRepository';
import { MockAccountRepository } from '@features/account/infrastructure/repositories/MockAccountRepository';
import { HttpAccountRepository } from '@features/account/infrastructure/repositories/HttpAccountRepository';
import {
  DownloadInvoicePdfUseCase,
  GetBillingSummaryUseCase,
  GetInvoicesUseCase,
  GetUserProfileUseCase,
  UpdateUserProfileUseCase,
} from '@features/account/application/use-cases/accountUseCases';

/**
 * Composition Root & Inyección de Dependencias (Clean Architecture).
 *
 * Mantiene desacopladas las capas de Presentación y Aplicación respecto a la
 * tecnología de almacenamiento (Simulador en memoria / Backend REST en Express).
 *
 * Para activar el backend real cuando esté desplegado:
 * Cambiar VITE_DATA_SOURCE_MODE=REMOTE_API en el archivo .env o en runtime.
 */
class AppDependencyContainer {
  public currentMode: DataSourceMode;

  // Repositorios (Puertos del Dominio)
  public subscriptionRepository!: ISubscriptionRepository;
  public socialWallRepository!: ISocialWallRepository;
  public authRepository!: IAuthRepository;
  public botRepository!: IBotRepository;
  public accountRepository!: IAccountRepository;

  // Casos de Uso: Suscripciones y Control Remoto NinjaTrader
  public toggleRemoteSubscriptionUseCase!: ToggleRemoteSubscriptionUseCase;
  public globalKillSwitchUseCase!: GlobalKillSwitchUseCase;
  public resetMachineIdUseCase!: ResetMachineIdUseCase;
  public simulateNinjaHeartbeatUseCase!: SimulateNinjaHeartbeatUseCase;

  // Casos de Uso: Muro Social
  public createSocialPostUseCase!: CreateSocialPostUseCase;
  public moderateSocialPostUseCase!: ModerateSocialPostUseCase;

  // Casos de Uso: Autenticación
  public loginUseCase!: LoginUseCase;
  public registerUseCase!: RegisterUseCase;
  public getCurrentUserUseCase!: GetCurrentUserUseCase;
  public recoverPasswordUseCase!: RecoverPasswordUseCase;
  public resetPasswordUseCase!: ResetPasswordUseCase;
  public logoutUseCase!: LogoutUseCase;

  // Casos de Uso: Catálogo de Bots
  public getBotsUseCase!: GetBotsUseCase;
  public createBotUseCase!: CreateBotUseCase;
  public getBotDetailUseCase!: GetBotDetailUseCase;
  public linkBotToLicenseUseCase!: LinkBotToLicenseUseCase;

  // Casos de Uso: Facturación y Cuenta
  public getBillingSummaryUseCase!: GetBillingSummaryUseCase;
  public getInvoicesUseCase!: GetInvoicesUseCase;
  public getUserProfileUseCase!: GetUserProfileUseCase;
  public updateUserProfileUseCase!: UpdateUserProfileUseCase;
  public downloadInvoicePdfUseCase!: DownloadInvoicePdfUseCase;

  constructor() {
    this.currentMode = env.dataSourceMode;
    this.initRepositories(this.currentMode);
  }

  public initRepositories(mode: DataSourceMode): void {
    this.currentMode = mode;
    const isRemote = mode === 'REMOTE_API';

    // 1. Instanciar adaptadores de infraestructura correspondientes
    this.subscriptionRepository = isRemote
      ? new HttpSubscriptionRepository()
      : new MockSimulatorSubscriptionRepository();

    this.socialWallRepository = isRemote
      ? new HttpSocialWallRepository()
      : new MockSocialWallRepository();

    this.authRepository = isRemote
      ? new HttpAuthRepository()
      : new MockAuthRepository();

    this.botRepository = isRemote
      ? new HttpBotRepository()
      : new MockBotRepository();

    this.accountRepository = isRemote
      ? new HttpAccountRepository()
      : new MockAccountRepository();

    // 2. Inyectar repositorios a los casos de uso
    this.toggleRemoteSubscriptionUseCase = new ToggleRemoteSubscriptionUseCase(
      this.subscriptionRepository
    );
    this.globalKillSwitchUseCase = new GlobalKillSwitchUseCase(
      this.subscriptionRepository
    );
    this.resetMachineIdUseCase = new ResetMachineIdUseCase(
      this.subscriptionRepository
    );
    this.simulateNinjaHeartbeatUseCase = new SimulateNinjaHeartbeatUseCase(
      this.subscriptionRepository
    );

    this.createSocialPostUseCase = new CreateSocialPostUseCase(
      this.socialWallRepository
    );
    this.moderateSocialPostUseCase = new ModerateSocialPostUseCase(
      this.socialWallRepository
    );

    this.loginUseCase = new LoginUseCase(this.authRepository);
    this.registerUseCase = new RegisterUseCase(this.authRepository);
    this.getCurrentUserUseCase = new GetCurrentUserUseCase(this.authRepository);
    this.recoverPasswordUseCase = new RecoverPasswordUseCase(this.authRepository);
    this.resetPasswordUseCase = new ResetPasswordUseCase(this.authRepository);
    this.logoutUseCase = new LogoutUseCase(this.authRepository);

    this.getBotsUseCase = new GetBotsUseCase(this.botRepository);
    this.createBotUseCase = new CreateBotUseCase(this.botRepository);
    this.getBotDetailUseCase = new GetBotDetailUseCase(this.botRepository);
    this.linkBotToLicenseUseCase = new LinkBotToLicenseUseCase(this.botRepository);

    this.getBillingSummaryUseCase = new GetBillingSummaryUseCase(
      this.accountRepository
    );
    this.getInvoicesUseCase = new GetInvoicesUseCase(this.accountRepository);
    this.getUserProfileUseCase = new GetUserProfileUseCase(
      this.accountRepository
    );
    this.updateUserProfileUseCase = new UpdateUserProfileUseCase(
      this.accountRepository
    );
    this.downloadInvoicePdfUseCase = new DownloadInvoicePdfUseCase(
      this.accountRepository
    );
  }

  public switchMode(mode: DataSourceMode): void {
    this.initRepositories(mode);
  }
}

export const container = new AppDependencyContainer();
