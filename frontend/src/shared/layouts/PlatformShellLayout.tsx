import React, { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  ChevronLeft,
  ChevronRight,
  Cpu,
  CreditCard,
  Globe,
  KeyRound,
  LogIn,
  LogOut,
  Menu,
  MessageSquareShare,
  Radio,
  ShieldCheck,
  Sliders,
  Terminal,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { useI18n } from '@core/i18n/useLanguageStore';
import { ThemeToggleButton } from '@shared/ui/ThemeToggleButton';
import { LanguageSwitcherButton } from '@shared/ui/LanguageSwitcherButton';
import { useAuthStore } from '@features/auth/application/useAuthStore';
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
}

interface NavGroupConfig {
  groupTitle: string;
  items: NavItemConfig[];
}

export const PlatformShellLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const { isAuthenticated, user, logout, switchRolePreview } = useAuthStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const {
    panelPollIntervalMs,
    autoSimulateNinjaPolls,
    ninjaPollCycleCount,
    setPanelPollIntervalMs,
    setAutoSimulateNinjaPolls,
  } = usePollingControlStore();

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

  const navGroups: NavGroupConfig[] = [
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
    {
      groupTitle: t.nav.groupAdmin,
      items: [
        {
          to: '/admin/subscriptions',
          label: t.nav.controlSubscriptions,
          icon: <Cpu className="h-4 w-4 shrink-0" />,
          badgeCount: pendingSyncCount > 0 ? pendingSyncCount : undefined,
          adminOnly: true,
        },
        {
          to: '/admin/ninja-lab',
          label: t.nav.ninjaLab,
          icon: <Terminal className="h-4 w-4 shrink-0" />,
          adminOnly: true,
        },
      ],
    },
    {
      groupTitle: t.nav.groupSocial,
      items: [
        {
          to: '/social',
          label: t.nav.socialWall,
          icon: <MessageSquareShare className="h-4 w-4 shrink-0" />,
        },
      ],
    },
    {
      groupTitle: t.nav.groupTrader,
      items: [
        {
          to: '/catalog',
          label: t.nav.botsCatalog,
          icon: <Bot className="h-4 w-4 shrink-0" />,
        },
        {
          to: '/catalog/bot-quantum-orderflow-v4',
          label: t.nav.botDetail,
          icon: <Sliders className="h-4 w-4 shrink-0" />,
        },
        {
          to: '/my-subscriptions',
          label: t.nav.myLicenses,
          icon: <KeyRound className="h-4 w-4 shrink-0" />,
        },
        {
          to: '/billing',
          label: t.nav.billing,
          icon: <CreditCard className="h-4 w-4 shrink-0" />,
        },
        {
          to: '/profile',
          label: t.nav.profile,
          icon: <User className="h-4 w-4 shrink-0" />,
        },
      ],
    },
    {
      groupTitle: t.nav.groupAuth,
      items: [
        {
          to: '/auth/login',
          label: t.nav.login,
          icon: <LogIn className="h-4 w-4 shrink-0" />,
          adminOnly: true,
        },
        {
          to: '/auth/register',
          label: t.nav.register,
          icon: <UserPlus className="h-4 w-4 shrink-0" />,
          adminOnly: true,
        },
        {
          to: '/auth/recover-password',
          label: t.nav.recoverPassword,
          icon: <KeyRound className="h-4 w-4 shrink-0" />,
          adminOnly: true,
        },
      ],
    },
  ];

  const isItemActive = (to: string) =>
    to === '/catalog'
      ? location.pathname === '/catalog'
      : location.pathname.startsWith(to);

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
      return { group: t.nav.groupTrader, label: t.nav.botDetail };
    }
    return { group: 'Trading Life Academy', label: '' };
  })();

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 overflow-hidden group cursor-pointer hover:opacity-90 transition-opacity"
            title={lang === 'es' ? 'Ir al Portal Público / Landing Page' : 'Go to Public Portal / Landing Page'}
          >
            <img
              src="/tla-logo.jpg"
              alt="Trading Life Academy"
              className="h-9 w-9 shrink-0 rounded-xl object-cover border border-amber-500/50 shadow-md shadow-amber-500/20 group-hover:border-amber-400 transition-colors"
            />
            {(!isSidebarCollapsed || isMobile) && (
              <div className="truncate">
                <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                  Trading Life Academy
                </div>
                <div className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
                  Learn • Trade • Grow
                </div>
              </div>
            )}
          </Link>

          {!isMobile ? (
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
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
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-5 px-3 py-4 overflow-y-auto max-h-[calc(100vh-170px)]">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.adminOnly || user.role === 'ADMIN'
            );
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
                        `flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
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

      <div className="border-t border-slate-800/80 p-3 space-y-2 bg-slate-950/60">
        {(!isSidebarCollapsed || isMobile) && (
          <div className="flex items-center justify-between rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px]">
            <span className="text-slate-400">{t.common.activeRole}</span>
            <button
              type="button"
              onClick={() =>
                switchRolePreview(user.role === 'ADMIN' ? 'TRADER' : 'ADMIN')
              }
              className="font-mono font-bold text-emerald-400 hover:underline cursor-pointer"
            >
              {user.role} ({t.common.changeRole})
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <Link
            to="/profile"
            className="flex items-center gap-2.5 overflow-hidden group cursor-pointer hover:opacity-90 transition-opacity flex-1 min-w-0"
            title="Ver mi Perfil de Usuario"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 text-xs font-bold text-slate-950 shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
            {(!isSidebarCollapsed || isMobile) && (
              <div className="truncate">
                <div className="truncate text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                  {user.fullName}
                </div>
                <div className="truncate text-[10px] text-slate-400">
                  {user.email}
                </div>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/auth/login');
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-300 cursor-pointer"
            title={t.common.logout}
          >
            <LogOut className="h-4 w-4" />
          </button>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside
        className={`hidden lg:flex lg:flex-col lg:shrink-0 border-r border-slate-800/90 bg-slate-900/60 backdrop-blur-md transition-all duration-200 ${
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

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 py-3 sm:px-6">
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
              {/* Controles técnicos visibles solo para Administradores */}
              {user.role === 'ADMIN' && (
                <>
                  {/* Indicador de conexión en vivo a la API REST */}
                  <div
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-300"
                    title="Conectado directamente a la API REST (Backend Express / PostgreSQL)"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>API REST v1</span>
                  </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5">
                <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-slate-400">{t.common.pollingHttp}</span>
                <select
                  value={panelPollIntervalMs}
                  onChange={(e) =>
                    setPanelPollIntervalMs(Number(e.target.value))
                  }
                  className="bg-transparent font-mono font-semibold text-emerald-300 focus:outline-none cursor-pointer"
                >
                  <option value={1500} className="bg-slate-900">
                    1.5s
                  </option>
                  <option value={2500} className="bg-slate-900">
                    2.5s
                  </option>
                  <option value={5000} className="bg-slate-900">
                    5.0s
                  </option>
                </select>
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSimulateNinjaPolls}
                  onChange={(e) => setAutoSimulateNinjaPolls(e.target.checked)}
                  className="rounded border-slate-700"
                />
                <Activity className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-slate-300 tabular-nums">
                  {t.common.autoAckNt8} (#{ninjaPollCycleCount})
                </span>
              </label>

                </>
              )}

              <LanguageSwitcherButton />
              <ThemeToggleButton />

              <button
                type="button"
                onClick={() => {
                  logout();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 cursor-pointer transition-colors"
                title="Cerrar sesión para ver el catálogo en modo público (sin menú lateral)"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{lang === 'es' ? 'Cerrar Sesión' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
