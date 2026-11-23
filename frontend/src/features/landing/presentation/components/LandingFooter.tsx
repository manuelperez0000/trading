import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, FileText, Lock, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { useI18n } from '@core/i18n/useLanguageStore';

type LegalDocType = 'TERMS' | 'PRIVACY' | 'RISK' | null;

export const LandingFooter: React.FC = () => {
  const { lang } = useI18n();
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>(null);

  const renderLegalModal = () => {
    if (!activeLegalDoc) return null;

    const docs = {
      TERMS: {
        title: lang === 'es' ? 'Términos de Servicio y Suscripción de Software' : 'Terms of Service & Software Subscription',
        content: [
          lang === 'es'
            ? '1. OBJETO DE LA SUSCRIPCIÓN: Trading Life Academy ("TLA") comercializa licencias de uso de software de automatización técnica (bots) y formación educativa. La suscripción otorga al cliente (sea estudiante de la academia o usuario independiente) una clave de licencia personal para ejecutar el software en su propio equipo.'
            : '1. SUBSCRIPTION SCOPE: Trading Life Academy ("TLA") provides automated technical software licenses (bots) and educational training. The subscription grants the customer (whether an academy student or independent user) a personal license key to run the software on their own hardware.',
          lang === 'es'
            ? '2. SOFTWARE NON-CUSTODIAL (SIN CAPTACIÓN DE CAPITAL): TLA NO es un broker, fondo de inversión ni entidad financiera. El cliente opera exclusivamente en sus propias cuentas de evaluación de fondeo o cuentas reales personales. TLA jamás recibe depósitos para invertir ni tiene acceso a las cuentas de trading del cliente.'
            : '2. NON-CUSTODIAL SOFTWARE (NO CAPITAL CUSTODY): TLA is NOT a broker, investment fund, or financial institution. The customer trades exclusively on their own funded evaluation or personal live accounts. TLA never accepts deposits for investment and never accesses customer trading accounts.',
          lang === 'es'
            ? '3. AUSENCIA DE GARANTÍAS DE RESULTADOS: Aunque los algoritmos integran controles técnicos de límite diario de pérdida (Drawdown Stop), el comercio en mercados financieros conlleva riesgo real. TLA no garantiza la aprobación de evaluaciones externas ni ganancias monetarias específicas.'
            : '3. NO PERFORMANCE GUARANTEES: While the algorithms integrate technical daily loss limit controls (Drawdown Stop), trading financial markets involves real risk. TLA does not guarantee passing external evaluations or specific monetary profits.',
          lang === 'es'
            ? '4. INDEPENDENCIA DE MARCAS: Trading Life Academy es una empresa de desarrollo de software y educación independiente, sin afiliación comercial con ningún broker o empresa de fondeo externa.'
            : '4. TRADEMARK INDEPENDENCE: Trading Life Academy is an independent software development and educational company, with no commercial affiliation with any external broker or prop firm.',
        ],
      },
      PRIVACY: {
        title: lang === 'es' ? 'Política de Privacidad y Seguridad Anti-Phishing' : 'Privacy Policy & Anti-Phishing Security',
        content: [
          lang === 'es'
            ? '1. DATOS DE REGISTRO: Para suscribirse y gestionar las licencias de los bots, el usuario crea una cuenta propia en Trading Life Academy con su nombre, correo electrónico y una contraseña exclusiva para este portal.'
            : '1. REGISTRATION DATA: To subscribe and manage bot licenses, the user creates an account on Trading Life Academy using their name, email address, and a password exclusive to this portal.',
          lang === 'es'
            ? '2. GARANTÍA ANTI-PHISHING: Trading Life Academy NUNCA solicita, recopila ni almacena contraseñas de brokers, credenciales de cuentas de fondeo externas, claves bancarias ni documentos de identidad en sus formularios públicos.'
            : '2. ANTI-PHISHING GUARANTEE: Trading Life Academy NEVER requests, collects, or stores broker passwords, external prop firm credentials, banking logins, or identity documents on its public forms.',
          lang === 'es'
            ? '3. PROTECCIÓN CRIPTOGRÁFICA: Las contraseñas se cifran con bcrypt (12 rondas) y la comunicación entre el bot instalado en la PC del usuario y nuestro servidor de licencias utiliza firmas HMAC-SHA256.'
            : '3. CRYPTOGRAPHIC PROTECTION: Passwords are encrypted with bcrypt (12 rounds), and communication between the bot on the user PC and our license server uses HMAC-SHA256 signatures.',
        ],
      },
      RISK: {
        title: lang === 'es' ? 'Descargo Oficial de Riesgo (Regla CFTC 4.41)' : 'Official Risk Disclosure (CFTC Rule 4.41)',
        content: [
          lang === 'es'
            ? 'ADVERTENCIA DE RIESGO (CFTC REGLA 4.41): La operativa con futuros, divisas y derivados conlleva un riesgo sustancial de pérdida y no es apta para todos los inversionistas. Al operar en una cuenta real usted puede perder parte o la totalidad de su capital. Opere únicamente con capital de riesgo.'
            : 'RISK WARNING (CFTC RULE 4.41): Trading futures, forex, and derivatives involves substantial risk of loss and is not suitable for all investors. When trading a live account you may lose part or all of your capital. Only trade with risk capital.',
          lang === 'es'
            ? 'RESULTADOS DE BACKTESTING E HIPOTÉTICOS: Las métricas de rendimiento mostradas en el catálogo de bots (Win Rate, Profit Factor y Drawdown) provienen de pruebas históricas simuladas (backtesting). El rendimiento pasado no garantiza resultados futuros.'
            : 'BACKTESTING & HYPOTHETICAL RESULTS: Performance metrics displayed in the bot catalog (Win Rate, Profit Factor, and Drawdown) come from simulated historical tests (backtesting). Past performance does not guarantee future results.',
        ],
      },
    };

    const current = docs[activeLegalDoc];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">{current.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveLegalDoc(null)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
            {current.content.map((paragraph, i) => (
              <p key={i} className="rounded-lg bg-slate-950/70 border border-slate-800 p-3">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex justify-end border-t border-slate-800 pt-3">
            <Button variant="primary" size="sm" onClick={() => setActiveLegalDoc(null)}>
              {lang === 'es' ? 'Entendido y Cerrar' : 'Understood & Close'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <footer className="relative border-t border-slate-800 bg-slate-950 pt-16 pb-12 overflow-hidden">
      {renderLegalModal()}

      {/* Resplandor inferior */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-amber-500/10 to-transparent blur-[140px]" />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Banner Final de Conversión Claro y Directo */}
        <div className="relative rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12 text-center shadow-2xl shadow-amber-500/10 max-w-5xl mx-auto overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <Badge variant="amber" pulse>
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              {lang === 'es'
                ? 'Suscripción Inmediata • Para Estudiantes y Cualquier Trader'
                : 'Instant Subscription • For Students & Any Trader'}
            </Badge>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lang === 'es' ? (
                <>
                  Automatiza Hoy tus{' '}
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    Pruebas de Fondeo y Cuentas Reales
                  </span>
                </>
              ) : (
                <>
                  Automate Your{' '}
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    Funded Evaluations & Live Accounts Today
                  </span>
                </>
              )}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {lang === 'es'
                ? 'Elige tu bot, descarga el instalador y pon a trabajar una estrategia cuantitativa con control automático de Drawdown Diario en tu propia cuenta.'
                : 'Choose your bot, download the installer, and put a quantitative strategy with automated Daily Drawdown control to work on your own account.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/catalog">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto text-sm font-bold shadow-xl shadow-amber-500/30"
                >
                  <Bot className="h-4 w-4" />
                  {lang === 'es' ? 'Ver Bots y Suscribirme Ahora' : 'Browse Bots & Subscribe Now'}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>

              <Link to="/auth/register">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm">
                  {lang === 'es' ? 'Crear mi Cuenta en el Portal' : 'Create My Portal Account'}
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
                ? 'Suscripción de bots de trading automatizados para superar cuentas de fondeo y operar cuentas reales, abierto a estudiantes y traders independientes.'
                : 'Subscription automated trading bots for funded evaluations and live accounts, open to academy students and independent traders.'}
            </p>
          </div>

          {/* Enlaces Plataforma */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {lang === 'es' ? 'Bots & Plataforma' : 'Bots & Platform'}
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/catalog" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Catálogo de Bots por Suscripción' : 'Subscription Bot Catalog'}
                </Link>
              </li>
              <li>
                <Link to="/admin/ninja-lab" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Laboratorio de Telemetría API' : 'API Telemetry Lab'}
                </Link>
              </li>
              <li>
                <Link to="/social" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Comunidad de Traders' : 'Trader Community'}
                </Link>
              </li>
              <li>
                <Link to="/admin/subscriptions" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Control Remoto de Suscripciones' : 'Remote Subscription Control'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlaces de Cuenta */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {lang === 'es' ? 'Área de Clientes' : 'Customer Area'}
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/auth/login" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Crear Cuenta Nueva' : 'Create New Account'}
                </Link>
              </li>
              <li>
                <Link to="/my-subscriptions" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Mis Licencias y Descargas' : 'My Licenses & Downloads'}
                </Link>
              </li>
              <li>
                <Link to="/billing" className="hover:text-amber-400 transition-colors">
                  {lang === 'es' ? 'Suscripción y Facturación' : 'Subscription & Billing'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Seguridad y Cumplimiento */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {lang === 'es' ? 'Garantía SaaS & Seguridad' : 'SaaS Guarantee & Security'}
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>{lang === 'es' ? '100% En Tu Propia Cuenta' : '100% Non-Custodial Software'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-400">
                <Lock className="h-4 w-4" />
                <span>{lang === 'es' ? 'Nunca pedimos claves de broker' : 'We never ask for broker passwords'}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                {lang === 'es'
                  ? 'Instalas el bot en tu PC o VPS con tu licencia personal. Tú mantienes el control total de tus cuentas.'
                  : 'Install the bot on your PC or VPS with your personal license. You keep full control of your accounts.'}
              </p>
            </div>
          </div>
        </div>

        {/* Descargo Legal, No Afiliación y Normativa CFTC 4.41 */}
        <div className="pt-8 border-t border-slate-900 space-y-3 text-[11px] text-slate-400 leading-relaxed">
          <p className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-4">
            <strong className="text-amber-300">AVISO LEGAL DE SOFTWARE Y DIVULGACIÓN DE RIESGO (REGLA CFTC 4.41):</strong>{' '}
            Trading Life Academy comercializa exclusivamente suscripciones de software de automatización técnica (bots) y educación para traders. <strong>No somos un broker, asesor de inversiones ni captamos capital de terceros (Software 100% Non-Custodial).</strong> El trading de futuros y derivados en cuentas reales o de evaluación conlleva un riesgo sustancial de pérdida. Las métricas de backtesting mostradas reflejan pruebas históricas del algoritmo y no garantizan resultados futuros.
          </p>
          <p className="text-[10px] text-slate-500">
            <strong>DECLARACIÓN DE USO NOMINATIVO E INDEPENDENCIA:</strong> Las menciones a Lucid Trading, My Funded Futures (MFFU) y Tradeify tienen carácter exclusivamente descriptivo sobre la compatibilidad técnica de las plantillas de gestión de riesgo del software. Trading Life Academy es una entidad independiente sin afiliación comercial ni patrocinio de dichas firmas, y jamás solicita contraseñas de cuentas externas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-slate-500 text-xs">
            <div>
              © 2026 Trading Life Academy (TLA). Todos los derechos reservados.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveLegalDoc('TERMS')}
                className="text-amber-400 hover:underline cursor-pointer font-medium"
              >
                {lang === 'es' ? 'Términos de Servicio (PUA)' : 'Terms of Service (AUP)'}
              </button>
              <button
                type="button"
                onClick={() => setActiveLegalDoc('PRIVACY')}
                className="text-amber-400 hover:underline cursor-pointer font-medium"
              >
                {lang === 'es' ? 'Política de Privacidad y Anti-Phishing' : 'Privacy & Anti-Phishing Policy'}
              </button>
              <button
                type="button"
                onClick={() => setActiveLegalDoc('RISK')}
                className="text-amber-400 hover:underline cursor-pointer font-medium"
              >
                {lang === 'es' ? 'Descargo Completo de Riesgo' : 'Full Risk Disclosure'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
