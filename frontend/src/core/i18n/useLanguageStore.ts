import { create } from 'zustand';

export type AppLanguage = 'es' | 'en';

const STORAGE_KEY = 'tla_language_code';

function getInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'es';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'en' ? 'en' : 'es';
}

export const translations = {
  es: {
    common: {
      pollingHttp: 'Polling HTTP:',
      autoAckNt8: 'Auto-ACK NT8',
      route: 'Ruta:',
      lightMode: 'Modo Claro',
      darkMode: 'Modo Oscuro',
      activeRole: 'Rol Activo:',
      changeRole: 'Cambiar',
      logout: 'Cerrar sesión',
      search: 'Buscar',
      all: 'Todas',
    },
    nav: {
      groupAdmin: 'Panel Admin & Conexión NT8',
      controlSubscriptions: 'Control Suscripciones',
      ninjaLab: 'Laboratorio API NinjaTrader',
      groupSocial: 'Comunidad & Social',
      socialWall: 'Red Social de Ganancias',
      groupTrader: 'Portal del Trader',
      botsCatalog: 'Catálogo de Bots',
      botDetail: 'Detalle Técnico de Bot',
      myLicenses: 'Mis Suscripciones / Licencias',
      billing: 'Pagos y Facturación',
      profile: 'Perfil de Usuario',
      groupAuth: 'Vistas de Autenticación',
      login: 'Login',
      register: 'Registro',
      recoverPassword: 'Recuperar Contraseña',
    },
    adminSubs: {
      title: 'Control Remoto de Suscripciones NinjaTrader 8',
      badgePolling: 'Polling HTTP Activo',
      subtitle:
        'Activa o desactiva licencias en tiempo real. Los cambios se aplican y confirman (ACK) en el ciclo de Polling HTTP de cada terminal NinjaTrader.',
      globalKillSwitch: 'Kill-Switch Global (Apagar Todas)',
      enableAll: 'Habilitar Todas las Instancias',
      kpiAuthorizedTitle: 'Suscripciones Autorizadas',
      kpiAuthorizedSub: 'Permiso remoto de trading en ON',
      kpiTerminalsTitle: 'Terminales NT8 Operando',
      kpiTerminalsSub: 'Confirmadas en último ciclo de Polling',
      kpiPendingTitle: 'Sincronización Pendiente',
      kpiPendingSubActive: 'Esperando próximo Heartbeat de NT8...',
      kpiPendingSubIdle: '100% de terminales sincronizadas (ACK)',
      kpiPnlTitle: 'PnL Diario Consolidado',
      kpiPnlSub: 'Reportado por telemetría de clientes',
      searchPlaceholder:
        'Buscar por trader, licencia NT8, cuenta Apex/Topstep o futuro...',
      filterAll: 'Todas',
      filterEnabled: 'Activas (ON)',
      filterDisabled: 'Apagadas (OFF)',
      filterPending: 'Sincronizando ACK',
      colTrader: 'Trader & Cuenta NT8',
      colLicense: 'Licencia & Hardware ID',
      colStrategy: 'Estrategia & Mercado',
      colStatus: 'Estado en NinjaTrader',
      colLastPoll: 'Último Poll HTTP',
      colActions: 'Interruptor Remoto & Pruebas',
      statusLive: 'OPERANDO EN VIVO',
      statusPaused: 'DETENIDO POR ADMIN',
      statusBlocked: 'BLOQUEO SEGURIDAD',
      statusOffline: 'SIN CONEXIÓN',
      forcePollBtn: 'Forzar Poll NT8',
      testApiBtn: 'Probar API',
      auditTitle:
        'Bitácora de Auditoría — Comandos Remotos & Heartbeats NinjaTrader',
      auditCount: 'eventos registrados',
    },
    remoteSwitch: {
      syncing: 'SINCRONIZANDO POLLING...',
      on: 'ENCENDIDO (ON)',
      off: 'APAGADO REMOTO (OFF)',
    },
    ninjaLab: {
      title: 'Laboratorio de Pruebas — Apagado/Encendido Remoto NinjaTrader 8',
      badge: 'Simulador C# AddOn ↔ API',
      subtitle:
        'Prueba el protocolo de Polling HTTP seguro con firma HMAC-SHA256 y verifica cómo responde NinjaTrader cuando apagas o enciendes una suscripción remotamente.',
      licenseSelectLabel: 'Licencia en Prueba:',
      step1Title: 'Paso 1: Cambia el Estado Remoto en el Panel Web',
      step2Btn: 'Paso 2: Disparar Ciclo de Polling desde NinjaTrader',
      emulatorTitle: 'Emulador de Instancia NinjaTrader 8 (Cliente C#)',
      scenariosLabel: 'Escenarios Rápidos de Prueba de Seguridad y Apagado:',
      scenario1: '1. Poll Legítimo',
      scenario2: '2. PC No Autorizada',
      scenario3: '3. Firma HMAC Falsa',
      sendBtn: 'Enviar Heartbeat HTTP a la API y Verificar Respuesta',
      responseTitle: 'Respuesta del Servidor & Acción en NinjaTrader 8',
      emptyProbeTitle: 'Aún no has disparado un paquete manual en esta sesión',
      emptyProbeSub:
        'Haz clic en "Paso 2: Disparar Ciclo de Polling" o elige uno de los 3 escenarios rápidos para inspeccionar el payload JSON de ida y vuelta.',
    },
    social: {
      title: 'Comunidad de Traders — Testimonios y Ganancias',
      badge: 'Sincronizado con NinjaTrader 8',
      subtitle:
        'Muro social de resultados verificados por API de NinjaTrader y testimonios de operativa de nuestra comunidad.',
      enableModeration: 'Activar Moderación Admin',
      moderationActive: 'Modo Moderador Admin',
      newPostBtn: 'Publicar Ganancia / Testimonio',
      closeFormBtn: 'Cerrar Formulario',
      kpiSharedProfits: 'Ganancias Compartidas en el Muro',
      kpiVerifiedReports: 'Reportes Verificados por API NT8',
      kpiModerationQueue: 'Cola de Moderación Admin',
      filterAll: 'Todos los Testimonios',
      filterVerified: 'Verificados por API NT8',
      filterPinned: 'Destacados por Admin',
      verifiedBadge: 'PnL Verificado API NT8',
      screenshotBadge: 'Captura Comunidad',
      commentPlaceholder: 'Escribe una felicitación o comentario...',
    },
    catalog: {
      title: 'Catálogo de Bots para NinjaTrader 8',
      badge: 'Compatibles con Prop Firms',
      subtitle:
        'Estrategias automatizadas en C# NinjaScript con validación remota de licencia y protección de drawdown diario.',
      allMarkets: 'Todos los Mercados',
      viewDetails: 'Ver Detalle del Bot',
      perMonth: '/ mes',
      addBotButton: 'Crear Nuevo Bot',
      createModalTitle: 'Publicar Nuevo Bot en el Catálogo',
      createModalSubtitle:
        'Registra los parámetros técnicos del bot, reglas de riesgo y licencia para NinjaTrader 8.',
      botCreatedSuccess: '¡Bot publicado exitosamente en el catálogo!',
    },
    account: {
      licensesTitle: 'Mis Suscripciones y Licencias NinjaTrader 8',
      licensesSubtitle:
        'Gestiona tus claves de licencia, vinculación de PC (Machine ID) y descarga el instalador NinjaScript (.zip).',
      downloadAddon: 'Descargar Add-On NinjaTrader 8 (.zip)',
      billingTitle: 'Historial de Pagos y Facturación',
      billingSubtitle:
        'Consulta tus recibos de suscripción, método de pago activo y próximas renovaciones automáticas.',
      profileTitle: 'Perfil de Usuario y Configuración Técnica',
      profileSubtitle:
        'Administra tus datos personales, alias en la red social de ganancias y configuración de tu terminal NinjaTrader 8.',
      saveProfile: 'Guardar Cambios del Perfil',
      statusActive: 'LICENCIA ACTIVA',
      statusSuspended: 'SUSPENDIDA',
      linkedAccount: 'Cuenta vinculada',
      market: 'Mercado',
      licenseKeyLabel: 'Clave de licencia',
      copy: 'Copiar',
      linkedPc: 'PC vinculada',
      pcPending: 'Se vinculará en el primer uso',
      lastConnection: 'Última conexión',
      expires: 'Vence',
      unbindBtn: 'Cambiar de PC',
      paymentMethod: 'Método de pago principal',
      autoRenew: 'Renovación automática activa',
      nextBilling: 'Próximo cobro',
      estimated: 'Monto estimado',
      totalBilled: 'Total facturado (2026)',
      invoicesPaid: 'facturas pagadas',
      colInvoice: 'Factura',
      colDate: 'Fecha',
      colConcept: 'Concepto',
      colMethod: 'Método',
      colAmount: 'Monto',
      colStatus: 'Estado',
      colReceipt: 'Recibo',
      paid: 'PAGADO',
      memberSince: 'Miembro desde',
      fullName: 'Nombre completo',
      email: 'Correo electrónico',
      socialHandle: 'Usuario en la comunidad',
      defaultMachineId: 'Machine ID principal (NinjaTrader 8)',
    },
    adminTable: {
      account: 'Cuenta:',
      unbound: 'SIN VINCULAR (Auto-Bind)',
      today: 'hoy',
      latency: 'Latencia:',
      loading: 'Cargando telemetría de suscripciones...',
      empty: 'No se encontraron suscripciones con el filtro seleccionado.',
    },
    toast: {
      licenseCopied: 'Clave de licencia copiada',
      licenseCopiedDesc:
        'Pégala en los parámetros de tu estrategia en NinjaTrader 8.',
      downloadStarted: 'Descarga iniciada',
      downloadStartedDesc: 'TradingLifeAcademy_AddOn_v4.2.1_NT8.zip',
      subscriptionOff: 'Orden de apagado enviada',
      subscriptionOn: 'Orden de encendido enviada',
      pendingAckDesc: 'Se confirmará en el próximo ciclo de NinjaTrader.',
      killSwitchExecuted: 'Kill-Switch Global ejecutado',
      enableAllExecuted: 'Reactivación global enviada',
      hwidReset: 'PC desvinculada correctamente',
      hwidResetDesc:
        'La licencia se vinculará al próximo equipo que se conecte.',
      postPublished: 'Testimonio publicado',
      postPublishedDesc: 'Ya es visible en el muro de la comunidad.',
      profileSaved: 'Perfil actualizado correctamente',
      invoiceDownload: 'Descargando factura PDF',
      actionError: 'No se pudo completar la acción',
    },
    dialog: {
      cancel: 'Cancelar',
      reasonLabel: 'Motivo (quedará registrado en la bitácora)',
      reasonPlaceholder:
        'Ej. Publicación de CPI, mantenimiento del servidor...',
      reasonRequired: 'Debes indicar un motivo para continuar.',
      quickReasons: [
        'Noticia de alto impacto (CPI / FOMC)',
        'Mantenimiento del servidor',
        'Volatilidad extrema del mercado',
      ],
      killTitle: '¿Apagar TODAS las instancias de NinjaTrader?',
      killDesc:
        'Todas las estrategias activas recibirán la orden de cerrar posiciones y detenerse en su próximo ciclo de conexión.',
      killConfirm: 'Sí, apagar todas',
      enableTitle: '¿Reactivar todas las instancias?',
      enableDesc:
        'Todas las licencias volverán a tener permiso de operar en su próximo ciclo de conexión.',
      enableConfirm: 'Sí, reactivar todas',
      unbindTitle: '¿Desvincular esta PC?',
      unbindDesc:
        'NinjaTrader dejará de operar en el equipo actual. La licencia se vinculará al próximo equipo que se conecte.',
      unbindConfirm: 'Sí, desvincular',
    },
    installGuide: {
      title: 'Instala tu bot en 3 pasos',
      subtitle: 'Sigue esta guía rápida para empezar a operar en NinjaTrader 8.',
      step1Title: 'Descarga el Add-On',
      step1Desc:
        'Pulsa "Descargar Add-On" y guarda el archivo .zip (no lo descomprimas).',
      step2Title: 'Importa en NinjaTrader 8',
      step2Desc: 'Abre NinjaTrader y ve a Tools → Import → NinjaScript Add-On.',
      step3Title: 'Pega tu clave de licencia',
      step3Desc:
        'Copia tu LicenseKey y pégala en los parámetros de la estrategia.',
    },
  },
  en: {
    common: {
      pollingHttp: 'HTTP Polling:',
      autoAckNt8: 'Auto-ACK NT8',
      route: 'Route:',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      activeRole: 'Active Role:',
      changeRole: 'Switch',
      logout: 'Sign out',
      search: 'Search',
      all: 'All',
    },
    nav: {
      groupAdmin: 'Admin Panel & NT8 Bridge',
      controlSubscriptions: 'Subscription Control',
      ninjaLab: 'NinjaTrader API Lab',
      groupSocial: 'Community & Social',
      socialWall: 'Verified Profits Wall',
      groupTrader: 'Trader Portal',
      botsCatalog: 'Trading Bots Catalog',
      botDetail: 'Bot Technical Specs',
      myLicenses: 'My Licenses & Keys',
      billing: 'Billing & Invoices',
      profile: 'User Profile',
      groupAuth: 'Authentication Views',
      login: 'Sign In',
      register: 'Sign Up',
      recoverPassword: 'Password Recovery',
    },
    adminSubs: {
      title: 'NinjaTrader 8 Remote Subscription Control',
      badgePolling: 'HTTP Polling Active',
      subtitle:
        'Enable or disable remote licenses in real time. Changes are enforced and acknowledged (ACK) on the next NinjaTrader HTTP Polling cycle.',
      globalKillSwitch: 'Global Kill-Switch (Disable All)',
      enableAll: 'Enable All Instances',
      kpiAuthorizedTitle: 'Authorized Subscriptions',
      kpiAuthorizedSub: 'Remote trading permission ON',
      kpiTerminalsTitle: 'Active NT8 Terminals',
      kpiTerminalsSub: 'Confirmed on latest Polling cycle',
      kpiPendingTitle: 'Pending Synchronization',
      kpiPendingSubActive: 'Waiting for next NT8 Heartbeat...',
      kpiPendingSubIdle: '100% of terminals synchronized (ACK)',
      kpiPnlTitle: 'Consolidated Daily PnL',
      kpiPnlSub: 'Reported via client telemetry',
      searchPlaceholder:
        'Search by trader, NT8 license, Apex/Topstep account or futures contract...',
      filterAll: 'All',
      filterEnabled: 'Enabled (ON)',
      filterDisabled: 'Disabled (OFF)',
      filterPending: 'Syncing ACK',
      colTrader: 'Trader & NT8 Account',
      colLicense: 'License & Hardware ID',
      colStrategy: 'Strategy & Market',
      colStatus: 'NinjaTrader Status',
      colLastPoll: 'Last HTTP Poll',
      colActions: 'Remote Switch & Testing',
      statusLive: 'LIVE TRADING',
      statusPaused: 'STOPPED BY ADMIN',
      statusBlocked: 'SECURITY BLOCKED',
      statusOffline: 'OFFLINE',
      forcePollBtn: 'Force NT8 Poll',
      testApiBtn: 'Test API',
      auditTitle: 'Audit Log — Remote Commands & NinjaTrader Heartbeats',
      auditCount: 'recorded events',
    },
    remoteSwitch: {
      syncing: 'SYNCING POLL...',
      on: 'ENABLED (ON)',
      off: 'REMOTE OFF (KILL)',
    },
    ninjaLab: {
      title: 'Testing Lab — NinjaTrader 8 Remote On/Off Switch',
      badge: 'C# AddOn ↔ API Simulator',
      subtitle:
        'Test the HMAC-SHA256 signed HTTP Polling protocol and verify how NinjaTrader responds when you remotely enable or disable a subscription.',
      licenseSelectLabel: 'Target License:',
      step1Title: 'Step 1: Toggle Remote State in Web Panel',
      step2Btn: 'Step 2: Trigger Polling Cycle from NinjaTrader',
      emulatorTitle: 'NinjaTrader 8 Instance Emulator (C# Client)',
      scenariosLabel: 'Quick Security & Kill-Switch Test Scenarios:',
      scenario1: '1. Legitimate Poll',
      scenario2: '2. Cloned PC (HWID)',
      scenario3: '3. Invalid HMAC Sig',
      sendBtn: 'Send HTTP Heartbeat to API & Verify Response',
      responseTitle: 'Server Response & Action Executed in NinjaTrader 8',
      emptyProbeTitle: 'No manual heartbeat probe triggered yet',
      emptyProbeSub:
        'Click "Step 2: Trigger Polling Cycle" or choose one of the 3 quick scenarios to inspect the round-trip JSON payload.',
    },
    social: {
      title: 'Traders Community — Testimonials & Verified Profits',
      badge: 'Synced with NinjaTrader 8',
      subtitle:
        'Social feed of API-verified NinjaTrader session results and community trading testimonials.',
      enableModeration: 'Enable Admin Moderation',
      moderationActive: 'Admin Moderator Mode',
      newPostBtn: 'Post Profit / Testimonial',
      closeFormBtn: 'Close Form',
      kpiSharedProfits: 'Shared Community Profits',
      kpiVerifiedReports: 'NT8 API-Verified Reports',
      kpiModerationQueue: 'Admin Moderation Queue',
      filterAll: 'All Testimonials',
      filterVerified: 'NT8 API Verified',
      filterPinned: 'Featured by Admin',
      verifiedBadge: 'NT8 API Verified PnL',
      screenshotBadge: 'Community Screenshot',
      commentPlaceholder: 'Write a comment or congratulation...',
    },
    catalog: {
      title: 'NinjaTrader 8 Automated Bots Catalog',
      badge: 'Prop-Firm Ready',
      subtitle:
        'Automated C# NinjaScript strategies with remote license enforcement and built-in daily drawdown protection.',
      allMarkets: 'All Markets',
      viewDetails: 'View Bot Specs',
      perMonth: '/ month',
      addBotButton: 'Add New Bot',
      createModalTitle: 'Publish New Bot to Catalog',
      createModalSubtitle:
        'Register the technical bot parameters, risk rules, and NinjaTrader 8 license.',
      botCreatedSuccess: 'Bot successfully published to catalog!',
    },
    account: {
      licensesTitle: 'My NinjaTrader 8 Subscriptions & Licenses',
      licensesSubtitle:
        'Manage your license keys, PC hardware binding (Machine ID), and download the NinjaScript (.zip) installer.',
      downloadAddon: 'Download NinjaTrader 8 Add-On (.zip)',
      billingTitle: 'Billing & Payment History',
      billingSubtitle:
        'Review your subscription invoices, active payment method, and upcoming automatic renewals.',
      profileTitle: 'User Profile & Technical Settings',
      profileSubtitle:
        'Manage your personal details, social wall handle, and default NinjaTrader 8 workstation settings.',
      saveProfile: 'Save Profile Changes',
      statusActive: 'ACTIVE LICENSE',
      statusSuspended: 'SUSPENDED',
      linkedAccount: 'Linked account',
      market: 'Market',
      licenseKeyLabel: 'License key',
      copy: 'Copy',
      linkedPc: 'Linked PC',
      pcPending: 'Will be linked on first use',
      lastConnection: 'Last connection',
      expires: 'Expires',
      unbindBtn: 'Change PC',
      paymentMethod: 'Primary payment method',
      autoRenew: 'Auto-renewal enabled',
      nextBilling: 'Next charge',
      estimated: 'Estimated amount',
      totalBilled: 'Total billed (2026)',
      invoicesPaid: 'invoices paid',
      colInvoice: 'Invoice',
      colDate: 'Date',
      colConcept: 'Description',
      colMethod: 'Method',
      colAmount: 'Amount',
      colStatus: 'Status',
      colReceipt: 'Receipt',
      paid: 'PAID',
      memberSince: 'Member since',
      fullName: 'Full name',
      email: 'Email address',
      socialHandle: 'Community handle',
      defaultMachineId: 'Primary Machine ID (NinjaTrader 8)',
    },
    adminTable: {
      account: 'Account:',
      unbound: 'UNBOUND (Auto-Bind)',
      today: 'today',
      latency: 'Latency:',
      loading: 'Loading subscription telemetry...',
      empty: 'No subscriptions match the selected filter.',
    },
    toast: {
      licenseCopied: 'License key copied',
      licenseCopiedDesc: 'Paste it into your NinjaTrader 8 strategy parameters.',
      downloadStarted: 'Download started',
      downloadStartedDesc: 'TradingLifeAcademy_AddOn_v4.2.1_NT8.zip',
      subscriptionOff: 'Shutdown command sent',
      subscriptionOn: 'Enable command sent',
      pendingAckDesc: 'Will be confirmed on the next NinjaTrader cycle.',
      killSwitchExecuted: 'Global Kill-Switch executed',
      enableAllExecuted: 'Global re-enable sent',
      hwidReset: 'PC unlinked successfully',
      hwidResetDesc: 'The license will bind to the next machine that connects.',
      postPublished: 'Testimonial published',
      postPublishedDesc: 'It is now visible on the community wall.',
      profileSaved: 'Profile updated successfully',
      invoiceDownload: 'Downloading PDF invoice',
      actionError: 'The action could not be completed',
    },
    dialog: {
      cancel: 'Cancel',
      reasonLabel: 'Reason (will be stored in the audit log)',
      reasonPlaceholder: 'e.g. CPI release, server maintenance...',
      reasonRequired: 'Please provide a reason to continue.',
      quickReasons: [
        'High-impact news (CPI / FOMC)',
        'Server maintenance',
        'Extreme market volatility',
      ],
      killTitle: 'Shut down ALL NinjaTrader instances?',
      killDesc:
        'Every active strategy will be ordered to flatten positions and stop on its next connection cycle.',
      killConfirm: 'Yes, shut down all',
      enableTitle: 'Re-enable all instances?',
      enableDesc:
        'All licenses will regain trading permission on their next connection cycle.',
      enableConfirm: 'Yes, re-enable all',
      unbindTitle: 'Unlink this PC?',
      unbindDesc:
        'NinjaTrader will stop trading on the current machine. The license will bind to the next machine that connects.',
      unbindConfirm: 'Yes, unlink',
    },
    installGuide: {
      title: 'Install your bot in 3 steps',
      subtitle: 'Follow this quick guide to start trading on NinjaTrader 8.',
      step1Title: 'Download the Add-On',
      step1Desc:
        'Click "Download Add-On" and save the .zip file (do not unzip it).',
      step2Title: 'Import into NinjaTrader 8',
      step2Desc: 'Open NinjaTrader and go to Tools → Import → NinjaScript Add-On.',
      step3Title: 'Paste your license key',
      step3Desc: 'Copy your LicenseKey and paste it into the strategy parameters.',
    },
  },
} as const;

interface LanguageState {
  lang: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
}

const initialLang = getInitialLanguage();
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: initialLang,
  setLanguage: (lang) =>
    set(() => {
      window.localStorage.setItem(STORAGE_KEY, lang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
      return { lang };
    }),
  toggleLanguage: () =>
    set((state) => {
      const next: AppLanguage = state.lang === 'es' ? 'en' : 'es';
      window.localStorage.setItem(STORAGE_KEY, next);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = next;
      }
      return { lang: next };
    }),
}));

export function useI18n() {
  const { lang, setLanguage, toggleLanguage } = useLanguageStore();
  return {
    lang,
    setLanguage,
    toggleLanguage,
    t: translations[lang],
  };
}
