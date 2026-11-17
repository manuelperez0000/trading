import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { useI18n } from '@core/i18n/useLanguageStore';

export const LandingFooter: React.FC = () => {
  const { lang } = useI18n();

  return (
    <footer className="relative border-t border-slate-800 bg-slate-950 pt-16 pb-12 overflow-hidden">
      {/* Resplandor inferior */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-amber-500/10 to-transparent blur-[140px]" />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Banner Final de Conversión */}
        <div className="relative rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12 text-center shadow-2xl shadow-amber-500/10 max-w-5xl mx-auto overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <Badge variant="amber" pulse>
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              {lang === 'es' ? 'Licencias Limitadas por Servidor' : 'Limited Licenses per Cluster'}
            </Badge>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lang === 'es' ? (
                <>
                  Deja de Quemar Cuentas de Fondeo y{' '}
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    Automatiza tu Disciplina Hoy
                  </span>
                </>
              ) : (
                <>
                  Stop Blowing Evaluations and{' '}
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    Automate Your Edge Today
                  </span>
                </>
              )}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {lang === 'es'
                ? 'Únete a traders institucionales y minoristas que operan con algoritmos de Order Flow certificados en NinjaTrader 8 con protección de Drawdown garantizada.'
                : 'Join elite retail and prop traders executing certified Order Flow strategies on NinjaTrader 8 with hard-coded risk protection.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/catalog">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto text-sm font-bold shadow-xl shadow-amber-500/30"
                >
                  <Bot className="h-4 w-4" />
                  {lang === 'es' ? 'Ver Catálogo y Activar mi Bot' : 'Browse Catalog & Activate Bot'}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>

              <Link to="/auth/register">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm">
                  {lang === 'es' ? 'Crear Cuenta Gratis' : 'Create Free Account'}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Columnas del Footer */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 pt-4 border-t border-slate-900">
          {/* Logo y descripción */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/tla-logo.jpg"
                alt="Trading Life Academy"
                className="h-9 w-9 rounded-xl object-cover border border-amber-500/50 shadow-md shadow-amber-500/20"
              />
              <div>
                <div className="text-sm font-bold text-white">Trading Life Academy</div>
                <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                  Learn • Trade • Grow
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'es'
                ? 'Ecosistema de trading algorítmico, desarrollo en C# NinjaScript y automatización de cuentas de fondeo en NinjaTrader 8.'
                : 'Algorithmic trading ecosystem, C# NinjaScript development, and prop-firm evaluation automation for NinjaTrader 8.'}
            </p>
          </div>

          {/* Enlaces Plataforma */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {lang === 'es' ? 'Plataforma' : 'Platform'}
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/catalog" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Catálogo de Bots' : 'Bot Catalog'}
                </Link>
              </li>
              <li>
                <Link to="/admin/ninja-lab" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Laboratorio API NinjaTrader' : 'NinjaTrader API Lab'}
                </Link>
              </li>
              <li>
                <Link to="/social" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Muro Social de Ganancias' : 'Verified Profits Wall'}
                </Link>
              </li>
              <li>
                <Link to="/admin/subscriptions" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Control de Suscripciones' : 'Subscription Control'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlaces de Cuenta */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {lang === 'es' ? 'Portal del Trader' : 'Trader Portal'}
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/auth/login" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Registro de Cuenta' : 'Register Account'}
                </Link>
              </li>
              <li>
                <Link to="/my-subscriptions" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Mis Licencias NinjaTrader' : 'My Licenses & Keys'}
                </Link>
              </li>
              <li>
                <Link to="/billing" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Facturación y Recibos' : 'Billing & Receipts'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Seguridad y Soporte */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {lang === 'es' ? 'Seguridad & Red' : 'Security & Network'}
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>HMAC-SHA256 Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-400">
                <Lock className="h-4 w-4" />
                <span>MachineID Hardware Lock</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Servidores alojados en AWS con redundancia y latencia &lt; 50ms para brokers CME.
              </p>
            </div>
          </div>
        </div>

        {/* Descargo Legal y Normativo CFTC 4.41 */}
        <div className="pt-8 border-t border-slate-900 space-y-4 text-[10px] text-slate-500 leading-relaxed">
          <p>
            <strong>AVISO DE RIESGO DE LA CFTC (REGLA 4.41):</strong> El comercio de futuros y opciones conlleva un riesgo sustancial de pérdida y no es adecuado para todos los inversionistas. El rendimiento pasado, ya sea real o simulado mediante pruebas históricas (backtesting), no es indicativo de resultados futuros. Los resultados de rendimiento hipotéticos tienen muchas limitaciones inherentes y no garantizan que ninguna cuenta obtendrá ganancias similares a las mostradas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-slate-600">
            <div>
              © 2026 Trading Life Academy (TLA). Todos los derechos reservados. NinjaTrader® es una marca registrada de NinjaTrader Group, LLC.
            </div>
            <div className="flex items-center gap-4">
              <span>Términos de Servicio</span>
              <span>Política de Privacidad</span>
              <span>Descargo de Riesgo</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
