import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Globe,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { LanguageSwitcherButton } from '@shared/ui/LanguageSwitcherButton';
import { ThemeToggleButton } from '@shared/ui/ThemeToggleButton';
import { useI18n } from '@core/i18n/useLanguageStore';
import { useThemeStore } from '@core/theme/useThemeStore';
import { useAuthStore } from '@features/auth/application/useAuthStore';

export const LandingNavbar: React.FC = () => {
  const { t, lang, toggleLanguage } = useI18n();
  const { theme, setTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const isLandingRoot = location.pathname === '/' || location.pathname === '/landing' || location.pathname === '/home';
  const dashboardPath = user.role === 'ADMIN' ? '/admin/subscriptions' : '/dashboard';
  const dashboardLabel =
    user.role === 'ADMIN'
      ? lang === 'es'
        ? 'Consola Admin'
        : 'Admin Console'
      : lang === 'es'
        ? 'Mi Panel'
        : 'My Dashboard';

  const navLinks = [
    { href: isLandingRoot ? '#bots' : '/#bots', label: lang === 'es' ? 'Bots Automatizados' : 'Automated Bots' },
    { href: isLandingRoot ? '#prop-firms' : '/#prop-firms', label: lang === 'es' ? 'Fondeo y Cuentas Reales' : 'Funded & Live Accounts' },
    { href: isLandingRoot ? '#how-it-works' : '/#how-it-works', label: lang === 'es' ? 'Cómo Funciona' : 'How it Works' },
    { href: isLandingRoot ? '#pricing' : '/#pricing', label: lang === 'es' ? 'Suscripciones' : 'Subscriptions' },
    { href: isLandingRoot ? '#faq' : '/#faq', label: 'FAQ' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md shadow-lg shadow-black/20">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex h-18 items-center justify-between">
          {/* Logo & Marca Oficial TLA */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <img
              src="/tla-logo.jpg"
              alt="Trading Life Academy"
              className="h-10 w-10 shrink-0 rounded-xl object-cover border-2 border-amber-500/50 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                Trading Life Academy
              </span>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                Learn • Trade • Grow
              </span>
            </div>
          </Link>

          {/* Enlaces de Navegación Centrales */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/catalog"
              className={`text-xs font-bold transition-colors ${location.pathname.startsWith('/catalog')
                  ? 'text-amber-400 underline underline-offset-4'
                  : 'text-emerald-400 hover:text-amber-300'
                }`}
            >
              {lang === 'es' ? 'Catálogo de Bots' : 'Bots Catalog'}
            </Link>
          </nav>

          {/* Acciones según Estado de Autenticación */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
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

                    {/* Opciones del Menú en Landing: Ir al Panel, Configuración y Cerrar Sesión */}
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate(dashboardPath);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                        <span>{dashboardLabel}</span>
                      </button>

                      {/* Opción Configuración (Idioma y Tema Claro/Oscuro) */}
                      <div className="rounded-xl border border-transparent">
                        <button
                          type="button"
                          onClick={() => setIsConfigOpen((prev) => !prev)}
                          className={`flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${isConfigOpen
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
                            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isConfigOpen ? 'rotate-180 text-sky-400' : ''
                              }`}
                          />
                        </button>

                        {isConfigOpen && (
                          <div className="mt-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 space-y-3">
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
                                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${lang === 'es'
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
                                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${lang === 'en'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                    }`}
                                >
                                  English (EN)
                                </button>
                              </div>
                            </div>

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
                                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${theme === 'dark'
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
                                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${theme === 'light'
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
                          navigate('/');
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
            ) : (
              <>
                <LanguageSwitcherButton />
                <ThemeToggleButton />

                <Link to="/auth/login">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <LogIn className="h-3.5 w-3.5" />
                    {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                  </Button>
                </Link>

                <Link to="/catalog">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs shadow-md shadow-amber-500/20"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {lang === 'es' ? 'Explorar Catálogo de Bots' : 'Explore Bots Catalog'}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcherButton />
            <ThemeToggleButton />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Drawer Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950 p-4 space-y-3 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-amber-400"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-amber-400 hover:bg-slate-900"
              >
                {lang === 'es' ? 'Catálogo de Bots' : 'Bots Catalog'}
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" className="w-full justify-center">
                      <LayoutDashboard className="h-4 w-4" />
                      {dashboardLabel}
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {lang === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="md" className="w-full justify-center">
                      <LogIn className="h-4 w-4" />
                      {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                    </Button>
                  </Link>
                  <Link to="/catalog" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" className="w-full justify-center">
                      <Sparkles className="h-4 w-4" />
                      {lang === 'es' ? 'Explorar Catálogo de Bots' : 'Explore Bots Catalog'}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <div className="h-18 w-full shrink-0" aria-hidden="true" />
    </>
  );
};
