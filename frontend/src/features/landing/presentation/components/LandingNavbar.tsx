import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogIn, LogOut, Menu, Sparkles, User, X } from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { LanguageSwitcherButton } from '@shared/ui/LanguageSwitcherButton';
import { ThemeToggleButton } from '@shared/ui/ThemeToggleButton';
import { useI18n } from '@core/i18n/useLanguageStore';
import { useAuthStore } from '@features/auth/application/useAuthStore';

export const LandingNavbar: React.FC = () => {
  const { lang } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLandingRoot = location.pathname === '/' || location.pathname === '/landing' || location.pathname === '/home';

  const navLinks = [
    { href: isLandingRoot ? '#bots' : '/#bots', label: lang === 'es' ? 'Bots Automatizados' : 'Automated Bots' },
    { href: isLandingRoot ? '#prop-firms' : '/#prop-firms', label: lang === 'es' ? 'Fondeo y Cuentas Reales' : 'Funded & Live Accounts' },
    { href: isLandingRoot ? '#how-it-works' : '/#how-it-works', label: lang === 'es' ? 'Cómo Funciona' : 'How it Works' },
    { href: isLandingRoot ? '#pricing' : '/#pricing', label: lang === 'es' ? 'Suscripciones' : 'Subscriptions' },
    { href: isLandingRoot ? '#faq' : '/#faq', label: 'FAQ' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
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
            className={`text-xs font-bold transition-colors ${
              location.pathname.startsWith('/catalog')
                ? 'text-amber-400 underline underline-offset-4'
                : 'text-emerald-400 hover:text-amber-300'
            }`}
          >
            {lang === 'es' ? 'Catálogo de Bots' : 'Bots Catalog'}
          </Link>
        </nav>

        {/* Acciones según Estado de Autenticación */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcherButton />
          <ThemeToggleButton />

          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <Button variant="secondary" size="sm" className="text-xs">
                  <User className="h-3.5 w-3.5 text-amber-400" />
                  <span>{user.fullName.split(' ')[0]}</span>
                </Button>
              </Link>
              <Link to="/my-subscriptions">
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs shadow-md shadow-amber-500/20"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  {lang === 'es' ? 'Mi Panel' : 'My Dashboard'}
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-rose-400 cursor-pointer"
                title={lang === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
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
                <Link to="/my-subscriptions" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full justify-center">
                    <LayoutDashboard className="h-4 w-4" />
                    {lang === 'es' ? 'Ir a Mi Panel' : 'Go to My Dashboard'}
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
  );
};
