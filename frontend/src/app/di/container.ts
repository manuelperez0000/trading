// Suscripciones y NinjaTrader Bridge
import type { ISubscriptionRepository } from '@features/subscriptions/domain/repositories/SubscriptionRepository';
import { HttpSubscriptionRepository } from '@features/subscriptions/infrastructure/repositories/HttpSubscriptionRepository';
import type { ISubscriptionPlanRepository } from '@features/subscriptions/domain/repositories/SubscriptionPlanRepository';
import { HttpSubscriptionPlanRepository } from '@features/subscriptions/infrastructure/repositories/HttpSubscriptionPlanRepository';
import {
  GlobalKillSwitchUseCase,
  ResetMachineIdUseCase,
  SimulateNinjaHeartbeatUseCase,
  ToggleRemoteSubscriptionUseCase,
} from '@features/subscriptions/application/use-cases/subscriptionUseCases';
import {
  CreateSubscriptionPlanUseCase,
  DeleteSubscriptionPlanUseCase,
  GetSubscriptionPlansUseCase,
  ToggleSubscriptionPlanStatusUseCase,
  UpdateSubscriptionPlanUseCase,
} from '@features/subscriptions/application/use-cases/planUseCases';

// Muro Social
import type { ISocialWallRepository } from '@features/social-wall/domain/repositories/SocialWallRepository';
import { HttpSocialWallRepository } from '@features/social-wall/infrastructure/repositories/HttpSocialWallRepository';
import {
  CreateSocialPostUseCase,
  ModerateSocialPostUseCase,
} from '@features/social-wall/application/use-cases/socialWallUseCases';

// Autenticación y Usuarios
import type { IAuthRepository } from '@features/auth/domain/repositories/AuthRepository';
import { HttpAuthRepository } from '@features/auth/infrastructure/repositories/HttpAuthRepository';
import {
  GetCurrentUserUseCase,
  ListUsersUseCase,
  LoginUseCase,
  LogoutUseCase,
  RecoverPasswordUseCase,
  RegisterUseCase,
  ResetPasswordUseCase,
} from '@features/auth/application/use-cases/authUseCases';

// Catálogo de Bots
import type { IBotRepository } from '@features/bots-catalog/domain/repositories/BotRepository';
import { HttpBotRepository } from '@features/bots-catalog/infrastructure/repositories/HttpBotRepository';
import {
  CreateBotUseCase,
  DeleteBotUseCase,
  GetBotDetailUseCase,
  GetBotsUseCase,
  LinkBotToLicenseUseCase,
  UpdateBotUseCase,
} from '@features/bots-catalog/application/use-cases/botUseCases';

// Facturación y Cuenta de Usuario
import type { IAccountRepository } from '@features/account/domain/repositories/AccountRepository';
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
 * Configurado exclusivamente para conexión directa a la API REST del backend en Express.
 */
class AppDependencyContainer {
  // Repositorios HTTP conectados a la API REST de Express
  public subscriptionRepository: ISubscriptionRepository;
  public subscriptionPlanRepository: ISubscriptionPlanRepository;
  public socialWallRepository: ISocialWallRepository;
  public authRepository: IAuthRepository;
  public botRepository: IBotRepository;
  public accountRepository: IAccountRepository;

  // Casos de Uso: Suscripciones y Control Remoto NinjaTrader
  public toggleRemoteSubscriptionUseCase: ToggleRemoteSubscriptionUseCase;
  public globalKillSwitchUseCase: GlobalKillSwitchUseCase;
  public resetMachineIdUseCase: ResetMachineIdUseCase;
  public simulateNinjaHeartbeatUseCase: SimulateNinjaHeartbeatUseCase;

  // Casos de Uso: Planes y Membresías
  public getSubscriptionPlansUseCase: GetSubscriptionPlansUseCase;
  public createSubscriptionPlanUseCase: CreateSubscriptionPlanUseCase;
  public updateSubscriptionPlanUseCase: UpdateSubscriptionPlanUseCase;
  public deleteSubscriptionPlanUseCase: DeleteSubscriptionPlanUseCase;
  public toggleSubscriptionPlanStatusUseCase: ToggleSubscriptionPlanStatusUseCase;

  // Casos de Uso: Muro Social
  public createSocialPostUseCase: CreateSocialPostUseCase;
  public moderateSocialPostUseCase: ModerateSocialPostUseCase;

  // Casos de Uso: Autenticación
  public loginUseCase: LoginUseCase;
  public registerUseCase: RegisterUseCase;
  public getCurrentUserUseCase: GetCurrentUserUseCase;
  public listUsersUseCase: ListUsersUseCase;
  public recoverPasswordUseCase: RecoverPasswordUseCase;
  public resetPasswordUseCase: ResetPasswordUseCase;
  public logoutUseCase: LogoutUseCase;

  // Casos de Uso: Catálogo de Bots
  public getBotsUseCase: GetBotsUseCase;
  public createBotUseCase: CreateBotUseCase;
  public updateBotUseCase: UpdateBotUseCase;
  public deleteBotUseCase: DeleteBotUseCase;
  public getBotDetailUseCase: GetBotDetailUseCase;
  public linkBotToLicenseUseCase: LinkBotToLicenseUseCase;

  // Casos de Uso: Facturación y Cuenta
  public getBillingSummaryUseCase: GetBillingSummaryUseCase;
  public getInvoicesUseCase: GetInvoicesUseCase;
  public getUserProfileUseCase: GetUserProfileUseCase;
  public updateUserProfileUseCase: UpdateUserProfileUseCase;
  public downloadInvoicePdfUseCase: DownloadInvoicePdfUseCase;

  constructor() {
    // 1. Instanciar adaptadores HTTP que conectan a la API REST
    this.subscriptionRepository = new HttpSubscriptionRepository();
    this.subscriptionPlanRepository = new HttpSubscriptionPlanRepository();
    this.socialWallRepository = new HttpSocialWallRepository();
    this.authRepository = new HttpAuthRepository();
    this.botRepository = new HttpBotRepository();
    this.accountRepository = new HttpAccountRepository();

    // 2. Inyectar dependencias a los casos de uso
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

    // Planes y Membresías
    this.getSubscriptionPlansUseCase = new GetSubscriptionPlansUseCase(
      this.subscriptionPlanRepository
    );
    this.createSubscriptionPlanUseCase = new CreateSubscriptionPlanUseCase(
      this.subscriptionPlanRepository
    );
    this.updateSubscriptionPlanUseCase = new UpdateSubscriptionPlanUseCase(
      this.subscriptionPlanRepository
    );
    this.deleteSubscriptionPlanUseCase = new DeleteSubscriptionPlanUseCase(
      this.subscriptionPlanRepository
    );
    this.toggleSubscriptionPlanStatusUseCase = new ToggleSubscriptionPlanStatusUseCase(
      this.subscriptionPlanRepository
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
    this.listUsersUseCase = new ListUsersUseCase(this.authRepository);
    this.recoverPasswordUseCase = new RecoverPasswordUseCase(this.authRepository);
    this.resetPasswordUseCase = new ResetPasswordUseCase(this.authRepository);
    this.logoutUseCase = new LogoutUseCase(this.authRepository);

    this.getBotsUseCase = new GetBotsUseCase(this.botRepository);
    this.createBotUseCase = new CreateBotUseCase(this.botRepository);
    this.updateBotUseCase = new UpdateBotUseCase(this.botRepository);
    this.deleteBotUseCase = new DeleteBotUseCase(this.botRepository);
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
}

export const container = new AppDependencyContainer();
