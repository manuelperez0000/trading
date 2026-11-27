import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Globe,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareShare,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Terminal,
  User,
  Users,
  X,
} from 'lucide-react';
import { useI18n } from '@core/i18n/useLanguageStore';
import { useThemeStore } from '@core/theme/useThemeStore';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import { getEffectiveKycStatus } from '@features/auth/domain/entities/User';
import { LandingNavbar } from '@features/landing/presentation/components/LandingNavbar';
import { LandingFooter } from '@features/landing/presentation/components/LandingFooter';
import {
  usePollingControlStore,
  useSimulateNinjaHeartbeatMutation,
  useSubscriptionsPolling,
} from '@features/subscriptions/application/hooks/useSubscriptionsPolling';

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
  badgeCount?: number;
  adminOnly?: boolean;
  traderOnly?: boolean;
}

interface NavGroupConfig {
  groupTitle: string;
  adminOnly?: boolean;
  traderOnly?: boolean;
  items: NavItemConfig[];
}

export const PlatformShellLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, toggleLanguage } = useI18n();
  const { theme, setTheme } = useThemeStore();
  const {
    isAuthenticated,
    user,
    logout,
    isSimulatingClient,
    returnToAdminFromSimulation,
  } = useAuthStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { autoSimulateNinjaPolls } = usePollingControlStore();

  const { data: subscriptions = [] } = useSubscriptionsPolling();
  const simulateHeartbeatMutation = useSimulateNinjaHeartbeatMutation();

  useEffect(() => {
    if (!autoSimulateNinjaPolls) return;

    const timer = setInterval(() => {
      const pendingSubs = subscriptions.filter(
        (s) => s.syncState === 'PENDING_ACK'
      );

      if (pendingSubs.length > 0) {
        pendingSubs.forEach((sub) => {
          simulateHeartbeatMutation.mutate({
            licenseKey: sub.licenseKey,
            machineId: sub.boundMachineId ?? 'WIN11-AUTO-BIND-NT8',
            strategyName: sub.activeStrategyName,
            accountName: sub.ninjaAccountName,
            instrument: sub.instrument,
            currentSessionPnlUsd: sub.dailyPnlUsd,
            tamperHmacSignature: false,
            simulatedLatencyMs: Math.floor(28 + Math.random() * 25),
          });
        });
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [autoSimulateNinjaPolls, subscriptions]);

  const pendingSyncCount = subscriptions.filter(
    (s) => s.syncState === 'PENDING_ACK'
  ).length;

  const isAdmin = user.role === 'ADMIN';

  // Menú lateral exclusivo para el Dashboard de Administración
  const adminNavGroups: NavGroupConfig[] = [
    {
      groupTitle: lang === 'es' ? 'Gestión & Operaciones' : 'Management & Operations',
      items: [
        {
          to: '/admin/subscriptions',
          label: lang === 'es' ? 'Control de Suscripciones' : 'Subscriptions Control',
          icon: <KeyRound className="h-4 w-4 shrink-0 text-amber-400" />,
          badgeCount: pendingSyncCount > 0 ? pendingSyncCount : undefined,
        },
        {
          to: '/admin/clients',
          label: lang === 'es' ? 'Directorio de Clientes' : 'Clients Directory',
          icon: <Users className="h-4 w-4 shrink-0 text-sky-400" />,
        },
        {
          to: '/admin/plans',
          label: lang === 'es' ? 'Planes de Membresía' : 'Membership Plans',
          icon: <Layers className="h-4 w-4 shrink-0 text-emerald-400" />,
        },
        {
          to: '/catalog',
          label: lang === 'es' ? 'Gestión de Bots' : 'Bots Management',
          icon: <Bot className="h-4 w-4 shrink-0 text-amber-300" />,
        },
      ],
    },
    {
      groupTitle: lang === 'es' ? 'Telemetría & Comunidad' : 'Telemetry & Community',
      items: [
        {
          to: '/admin/ninja-lab',
          label: t.nav.ninjaLab,
          icon: <Terminal className="h-4 w-4 shrink-0" />,
        },
        {
          to: '/social',
          label: lang === 'es' ? 'Moderación Muro Social' : 'Social Wall Moderation',
          icon: <MessageSquareShare className="h-4 w-4 shrink-0" />,
        },
      ],
    },
    {
      groupTitle: lang === 'es' ? 'Portal Público' : 'Public Portal',
      items: [
        {
          to: '/',
          label: lang === 'es' ? 'Ver Landing Page' : 'View Landing Page',
          icon: <Globe className="h-4 w-4 shrink-0 text-amber-400" />,
        },
      ],
    },
  ];

  // Menú lateral exclusivo para el Dashboard de Clientes / Traders
  const clientNavGroups: NavGroupConfig[] = [
    {
      groupTitle: lang === 'es' ? 'Mi Panel de Cliente' : 'My Client Dashboard',
      items: [
        {
          to: '/dashboard',
          label: lang === 'es' ? 'Resumen de Mi Cuenta' : 'Account Overview',
          icon: <LayoutDashboard className="h-4 w-4 shrink-0 text-emerald-400" />,
        },
        {
          to: '/my-bots',
          label: lang === 'es' ? 'Mis Bots (Descargas NT8)' : 'My Bots (NT8 Downloads)',
          icon: <Download className="h-4 w-4 shrink-0 text-emerald-400" />,
        },
        {
          to: '/my-subscriptions',
          label: t.nav.myLicenses,
          icon: <KeyRound className="h-4 w-4 shrink-0 text-sky-400" />,
        },
      ],
    },
    {
      groupTitle: lang === 'es' ? 'Pagos & Comunidad' : 'Billing & Community',
      items: [
        {
          to: '/billing',
          label: t.nav.billing,
          icon: <CreditCard className="h-4 w-4 shrink-0" />,
        },
        {
          to: '/social',
          label: t.nav.socialWall,
          icon: <MessageSquareShare className="h-4 w-4 shrink-0" />,
        },
      ],
    },
    {
      groupTitle: lang === 'es' ? 'Portal Público' : 'Public Portal',
      items: [
        {
          to: '/',
          label: lang === 'es' ? 'Ver Landing Page' : 'View Landing Page',
          icon: <Globe className="h-4 w-4 shrink-0 text-amber-400" />,
        },
      ],
    },
  ];

  const navGroups: NavGroupConfig[] = isAdmin ? adminNavGroups : clientNavGroups;

  const isItemActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    if (to === '/catalog') return location.pathname === '/catalog';
    if (to === '/my-bots') {
      return (
        location.pathname.startsWith('/my-bots') ||
        (!isAdmin && location.pathname.startsWith('/catalog/'))
      );
    }
    if (to === '/admin/clients') {
      return (
        location.pathname.startsWith('/admin/clients') ||
        location.pathname.startsWith('/admin/clientes')
      );
    }
    return location.pathname.startsWith(to);
  };

  // Breadcrumb legible (Grupo › Módulo) en lugar de mostrar la URL técnica
  const activeCrumb = (() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (isItemActive(item.to)) {
          return { group: group.groupTitle, label: item.label };
        }
      }
    }
    if (location.pathname.startsWith('/catalog/')) {
      const catalogGroupTitle =
        user.role === 'ADMIN'
          ? lang === 'es'
            ? 'Catálogo del Sistema'
            : 'System Catalog'
          : t.nav.groupTrader;
      return { group: catalogGroupTitle, label: t.nav.botDetail };
    }
    return { group: 'Trading Life Academy', label: '' };
  })();

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div
          className={`flex border-b border-slate-800/80 ${
            isSidebarCollapsed && !isMobile
              ? 'flex-col items-center justify-center gap-2.5 px-2 py-3.5'
              : 'items-center justify-between px-4 py-4'
          }`}
        >
          <Link
            to="/"
            className={`flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-opacity ${
              isSidebarCollapsed && !isMobile
                ? 'justify-center shrink-0'
                : 'overflow-hidden'
            }`}
            title={
              lang === 'es'
                ? 'Ir al Portal Público / Landing Page'
                : 'Go to Public Portal / Landing Page'
            }
          >
            <img
              src="/tla-logo.jpg"
              alt="Trading Life Academy"
              className="h-10 w-10 min-w-10 min-h-10 aspect-square shrink-0 rounded-xl object-cover border border-amber-500/50 shadow-md shadow-amber-500/20 group-hover:border-amber-400 transition-colors"
            />
            {(!isSidebarCollapsed || isMobile) && (
              <div className="truncate">
                <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                  Trading Life Academy
                </div>
                <div
                  className={`text-[10px] font-bold tracking-wider uppercase ${
                    isAdmin ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {isAdmin
                    ? lang === 'es'
                      ? 'Consola de Administración'
                      : 'Admin Console'
                    : lang === 'es'
                    ? 'Portal del Cliente'
                    : 'Client Portal'}
                </div>
              </div>
            )}
          </Link>

          {!isMobile ? (
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className={`rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer shrink-0 ${
                isSidebarCollapsed ? 'w-10 flex items-center justify-center border border-slate-800/80 bg-slate-900/80' : ''
              }`}
              title={
                isSidebarCollapsed
                  ? lang === 'es'
                    ? 'Expandir menú'
                    : 'Expand menu'
                  : lang === 'es'
                  ? 'Contraer menú'
                  : 'Collapse menu'
              }
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-5 px-3 py-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          {navGroups.map((group) => {
            if (group.adminOnly && user.role !== 'ADMIN') return null;
            if (group.traderOnly && user.role === 'ADMIN') return null;

            const visibleItems = group.items.filter((item) => {
              if (item.adminOnly && user.role !== 'ADMIN') return false;
              if (item.traderOnly && user.role === 'ADMIN') return false;
              return true;
            });
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.groupTitle} className="space-y-1">
                {(!isSidebarCollapsed || isMobile) && (
                  <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {group.groupTitle}
                  </div>
                )}

                {visibleItems.map((item) => {
                  const isActiveRoute = isItemActive(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={() =>
                        `flex items-center ${
                          isSidebarCollapsed && !isMobile
                            ? 'justify-center px-2 py-2.5'
                            : 'justify-between gap-2.5 px-3 py-2.5'
                        } rounded-xl text-xs font-medium transition-all ${
                          isActiveRoute
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold shadow-xs shadow-amber-500/10'
                            : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100 border border-transparent'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3 truncate">
                        {item.icon}
                        {(!isSidebarCollapsed || isMobile) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {item.badgeCount !== undefined &&
                        (!isSidebarCollapsed || isMobile) && (
                          <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-[#020617]">
                            {item.badgeCount}
                          </span>
                        )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Rutas que se pueden explorar públicamente sin haber iniciado sesión
  const isPubliclyBrowsableRoute =
    location.pathname === '/catalog' ||
    location.pathname.startsWith('/catalog/') ||
    location.pathname === '/social';

  // Si el usuario NO está autenticado e intenta entrar a una ruta privada (Licencias, Facturación, Perfil, Admin), exigir Login
  if (!isAuthenticated && !isPubliclyBrowsableRoute) {
    const redirectTarget = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?redirect=${redirectTarget}`} replace />;
  }

  // Separación estricta de Dashboards por Rol:
  // 1) Un Cliente NO puede acceder a rutas de Administración (/admin/*)
  if (isAuthenticated && !isAdmin && location.pathname.startsWith('/admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  // 2) Un Administrador que visite rutas exclusivas de Cliente (/dashboard, /my-bots, /my-subscriptions, /billing) va a su Consola Admin
  const isClientExclusiveRoute =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/my-bots') ||
    location.pathname.startsWith('/my-subscriptions') ||
    location.pathname.startsWith('/billing');

  if (isAuthenticated && isAdmin && isClientExclusiveRoute) {
    return <Navigate to="/admin/subscriptions" replace />;
  }

  // Onboarding obligatorio: si el cliente aún tiene su perfil INCOMPLETO o fue OBSERVADO para corregir documentos, llevarlo a /profile
  const currentKycStatus = getEffectiveKycStatus(user);
  const requiresImmediateProfileCompletion =
    currentKycStatus === 'INCOMPLETO' || currentKycStatus === 'OBSERVADO';

  if (
    isAuthenticated &&
    user?.role !== 'ADMIN' &&
    requiresImmediateProfileCompletion &&
    location.pathname !== '/profile'
  ) {
    return <Navigate to="/profile?onboarding=1" replace />;
  }

  // Si el usuario NO está autenticado y visita el Catálogo o Detalle de Bot, mostrar la Vista Pública limpia (con Navbar y Footer de la Landing)
  if (!isAuthenticated && isPubliclyBrowsableRoute) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <LandingNavbar />
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200 flex flex-wrap items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            {lang === 'es'
              ? 'Modo Exploración Pública: Puedes revisar todos los bots y sus especificaciones. Para suscribirte o comprar un bot se te solicitará iniciar sesión.'
              : 'Public Exploration Mode: You can browse all bots and technical specs. Signing in is required when you choose to subscribe or purchase a bot.'}
          </span>
          <Link
            to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`}
            className="font-bold text-amber-400 underline hover:text-amber-300 ml-1"
          >
            {lang === 'es' ? 'Iniciar Sesión →' : 'Sign In →'}
          </Link>
        </div>
        <main className="flex-1 w-full px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100 flex">
      <aside
        className={`hidden lg:flex lg:flex-col lg:shrink-0 border-r border-slate-800/90 bg-slate-900/60 backdrop-blur-md transition-all duration-200 h-full ${
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <aside className="relative z-10 w-72 bg-slate-900 border-r border-slate-800 h-full">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {isSimulatingClient && (
          <div className="bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-amber-500/20 border-b border-amber-500/40 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <strong>Modo Prueba de Cliente Activo:</strong> Estás viendo la plataforma como{' '}
                <strong className="text-white">{user.fullName}</strong> ({user.email}).
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                returnToAdminFromSimulation();
                navigate('/admin/clients');
              }}
              className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-extrabold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
            >
              ← Volver a Consola de Administrador
            </button>
          </div>
        )}
        <header className="shrink-0 z-30 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>

              <nav
                aria-label="breadcrumb"
                className="flex items-center gap-1.5 text-xs min-w-0"
              >
                {location.pathname.startsWith('/catalog/') ? (
                  <Link
                    to="/catalog"
                    className="hidden sm:inline truncate text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {t.nav.botsCatalog}
                  </Link>
                ) : (
                  <span className="hidden sm:inline truncate text-slate-500">
                    {activeCrumb.group}
                  </span>
                )}
                {activeCrumb.label && (
                  <>
                    <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-slate-600" />
                    <span className="truncate font-semibold text-slate-100">
                      {activeCrumb.label}
                    </span>
                  </>
                )}
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Menú Desplegable del Usuario: Solo el icono con las iniciales */}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-xs font-extrabold text-slate-950 shadow-md shadow-amber-500/20 hover:scale-105 transition-transform cursor-pointer"
                  title={`${user.fullName} (${user.email})`}
                >
                  {(user.fullName || 'US').slice(0, 2).toUpperCase()}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md z-50 space-y-2.5 animate-fade-in">
                    {/* Tarjeta con Rol Activo, Iniciales, Nombre y Correo */}
                    <div className="space-y-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center justify-between rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px]">
                        <span className="text-slate-400">{t.common.activeRole}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {user.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 px-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 text-xs font-extrabold text-slate-950 shadow-sm shadow-amber-500/20">
                          {(user.fullName || 'US').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate min-w-0">
                          <div className="truncate text-xs font-bold text-white">
                            {user.fullName}
                          </div>
                          <div className="truncate text-[11px] text-slate-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Opciones del Menú: Ver Perfil, Configuración y Cerrar Sesión */}
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        <User className="h-4 w-4 text-amber-400" />
                        <span>{lang === 'es' ? 'Ver Perfil' : 'View Profile'}</span>
                      </button>

                      {/* Opción Configuración (Despliega Idioma y Tema Claro/Oscuro) */}
                      <div className="rounded-xl border border-transparent">
                        <button
                          type="button"
                          onClick={() => setIsConfigOpen((prev) => !prev)}
                          className={`flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                            isConfigOpen
                              ? 'bg-slate-800/90 text-sky-300'
                              : 'text-slate-200 hover:bg-slate-800/80 hover:text-sky-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Settings className="h-4 w-4 text-sky-400" />
                            <span>
                              {lang === 'es' ? 'Configuración' : 'Settings'}
                            </span>
                          </div>
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                              isConfigOpen ? 'rotate-180 text-sky-400' : ''
                            }`}
                          />
                        </button>

                        {isConfigOpen && (
                          <div className="mt-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 space-y-3">
                            {/* Selector de Idioma */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                                <span>{lang === 'es' ? 'Idioma' : 'Language'}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (lang !== 'es') toggleLanguage();
                                  }}
                                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                                    lang === 'es'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                  }`}
                                >
                                  Español (ES)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (lang !== 'en') toggleLanguage();
                                  }}
                                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                                    lang === 'en'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                  }`}
                                >
                                  English (EN)
                                </button>
                              </div>
                            </div>

                            {/* Selector de Tema Claro / Oscuro */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                                {theme === 'dark' ? (
                                  <Moon className="h-3.5 w-3.5 text-sky-400" />
                                ) : (
                                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                                )}
                                <span>
                                  {lang === 'es' ? 'Tema Visual' : 'Appearance'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setTheme('dark')}
                                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                                    theme === 'dark'
                                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                  }`}
                                >
                                  <Moon className="h-3 w-3" />
                                  <span>{lang === 'es' ? 'Oscuro' : 'Dark'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTheme('light')}
                                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                                    theme === 'light'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                  }`}
                                >
                                  <Sun className="h-3 w-3" />
                                  <span>{lang === 'es' ? 'Claro' : 'Light'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/auth/login');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-rose-400" />
                        <span>{lang === 'es' ? 'Cerrar Sesión' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
