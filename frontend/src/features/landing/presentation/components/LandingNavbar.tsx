import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Menu, Sparkles, X } from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { LanguageSwitcherButton } from '@shared/ui/LanguageSwitcherButton';
import { ThemeToggleButton } from '@shared/ui/ThemeToggleButton';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingNavbar: React.FC = () => {
  const { lang } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#bots', label: lang === 'es' ? 'Bots Algorítmicos' : 'Trading Bots' },
    { href: '#prop-firms', label: 'Prop Firms' },
    { href: '#how-it-works', label: lang === 'es' ? 'Cómo Funciona' : 'How it Works' },
    { href: '#social-proof', label: lang === 'es' ? 'Resultados' : 'Verified PnL' },
    { href: '#pricing', label: lang === 'es' ? 'Planes' : 'Pricing' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
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

        {/* Enlaces de Navegación Escritorio */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Acciones y Botones */}
        <div className="hidden md:flex items-center gap-3">
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
              {lang === 'es' ? 'Obtener mi Bot' : 'Get Bot Access'}
            </Button>
          </Link>
        </div>

        {/* Botón Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcherButton />
          <ThemeToggleButton />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
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
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full justify-center">
                <LogIn className="h-4 w-4" />
                {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
              </Button>
            </Link>
            <Link to="/catalog" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full justify-center">
                <Sparkles className="h-4 w-4" />
                {lang === 'es' ? 'Explorar Catálogo de Bots' : 'Explore Bots'}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
