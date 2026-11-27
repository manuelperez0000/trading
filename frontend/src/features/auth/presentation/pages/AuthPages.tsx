import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Badge } from '@shared/ui/Badge';
import { ThemeToggleButton } from '@shared/ui/ThemeToggleButton';
import { LanguageSwitcherButton } from '@shared/ui/LanguageSwitcherButton';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import { isUserProfileComplete } from '@features/auth/domain/entities/User';
import { InternationalPhoneInput } from '@shared/ui/InternationalPhoneInput';
import { container } from '@app/di/container';
import { toast } from '@shared/ui/toast/toastStore';

const AuthShell: React.FC<{
  title: string;
  subtitle: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, maxWidthClass = 'max-w-md', children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageSwitcherButton />
        <ThemeToggleButton />
      </div>
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />

      <div className={`w-full ${maxWidthClass} space-y-5 relative z-10`}>
        <div className="flex flex-col items-center text-center">
          <Link to="/">
            <img
              src="/tla-logo.jpg"
              alt="Trading Life Academy"
              className="h-20 w-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl shadow-amber-500/20 mb-3 hover:scale-105 transition-transform"
            />
          </Link>
          <Badge variant="amber">Trading Life Academy • Portal Educativo</Badge>
          <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase mt-1.5">
            Learn • Trade • Grow
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        {/* Aviso Anti-Phishing de Transparencia Exigido por Proveedores de Dominio */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-[11px] text-emerald-300 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Aviso de Seguridad Anti-Phishing:</strong> Este portal es exclusivo para estudiantes de Trading Life Academy. Nunca solicitamos ni almacenamos contraseñas de brokers ni credenciales de plataformas de terceros.
          </span>
        </div>

        <Card className="p-6 border-slate-800 bg-slate-900/80">{children}</Card>
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const explicitRedirect = searchParams.get('redirect');
  const redirectTo = explicitRedirect || '/dashboard';
  const hasPurchaseRedirect = Boolean(explicitRedirect);

  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loggedUser = await login({ email, password });
      toast.success(
        'Inicio de sesión exitoso',
        `Bienvenido ${loggedUser.fullName} (${loggedUser.role === 'ADMIN' ? 'Administrador' : 'Cliente / Estudiante'}).`
      );
      if (loggedUser.role === 'ADMIN') {
        const adminTarget =
          explicitRedirect && !explicitRedirect.startsWith('/dashboard')
            ? explicitRedirect
            : '/admin/subscriptions';
        navigate(adminTarget);
      } else if (!isUserProfileComplete(loggedUser)) {
        navigate('/profile?onboarding=1');
      } else {
        const clientTarget =
          explicitRedirect && !explicitRedirect.startsWith('/admin')
            ? explicitRedirect
            : '/dashboard';
        navigate(clientTarget);
      }
    } catch (err) {
      console.log(err);
      toast.danger(
        'Error al iniciar sesión',
        err instanceof Error ? err.message : 'Correo o contraseña incorrectos.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const registerUrl = hasPurchaseRedirect
    ? `/auth/register?redirect=${encodeURIComponent(redirectTo)}`
    : '/auth/register';

  return (
    <AuthShell
      title="Acceso al Portal de Clientes y Estudiantes"
      subtitle="Ingresa con tus credenciales para adquirir suscripciones de bots, gestionar tu LicenseKey o descargar el AddOn de NinjaTrader 8."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {hasPurchaseRedirect && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
            <strong>Autenticación requerida:</strong> Inicia sesión para continuar con tu compra o acceder a la sección solicitada. Al ingresar volverás automáticamente donde estabas.
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@correo.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-400">
              Contraseña del Portal
            </label>
            <Link
              to="/auth/recover-password"
              className="text-xs text-emerald-400 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entre 8 y 72 caracteres"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Iniciar Sesión
        </Button>

        <div className="pt-1 text-center text-xs text-slate-400">
          ¿Aún no tienes cuenta?{' '}
          <Link
            to={registerUrl}
            className="font-semibold text-emerald-400 hover:underline"
          >
            Crear cuenta para suscribirme
          </Link>
        </div>
      </form>
    </AuthShell>
  );
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/catalog';
  const hasPurchaseRedirect = Boolean(searchParams.get('redirect'));

  const { register } = useAuthStore();

  // Campos obligatorios en backend/routes/users.js
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Campos de contacto opcionales (sin recolección de documentos sensibles en formulario público)
  const [showOptionalContact, setShowOptionalContact] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const createdUser = await register({
        fullName,
        email,
        password,
        direccion,
        telefono,
        whatsapp,
      });
      toast.success(
        'Cuenta creada exitosamente',
        `Bienvenido ${createdUser.fullName}. Por favor completa los datos de tu perfil.`
      );
      navigate('/profile?onboarding=1');
    } catch (err) {
      console.error(err);
      toast.danger(
        'Error en el registro',
        err instanceof Error ? err.message : 'No se pudo registrar el usuario.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loginUrl = hasPurchaseRedirect
    ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
    : '/auth/login';

  const inputClass =
    'w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white focus:border-emerald-500 focus:outline-none';

  return (
    <AuthShell
      title="Registro de Cuenta de Estudiante"
      subtitle="Crea tu cuenta para acceder al material educativo y herramientas de software."
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Ana Pérez"
                maxLength={120}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="estudiante@correo.com"
                maxLength={320}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Contraseña Nueva *
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                maxLength={72}
                className={inputClass}
                required
              />
            </div>
          </div>
        </div>

        {/* Acordeón opcional solo para teléfono y dirección de contacto */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowOptionalContact((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-300 hover:text-amber-300 cursor-pointer"
          >
            <span>Datos de Contacto Adicionales (Opcionales)</span>
            {showOptionalContact ? (
              <ChevronUp className="h-4 w-4 text-amber-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {showOptionalContact && (
            <div className="border-t border-slate-800 p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle 123, Ciudad"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Teléfono Internacional
                  </label>
                  <InternationalPhoneInput value={telefono} onChange={setTelefono} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    WhatsApp Internacional
                  </label>
                  <InternationalPhoneInput value={whatsapp} onChange={setWhatsapp} accent="emerald" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Selecciona tu país de la lista para añadir automáticamente el prefijo internacional correspondiente.
              </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Completar Registro
        </Button>

        <div className="pt-2 text-center text-xs text-slate-400">
          ¿Ya tienes una cuenta activa?{' '}
          <Link
            to={loginUrl}
            className="font-semibold text-emerald-400 hover:underline"
          >
            Iniciar Sesión
          </Link>
        </div>
      </form>
    </AuthShell>
  );
};

export const PasswordRecoveryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') ?? '';

  const [step, setStep] = useState<'REQUEST_TOKEN' | 'RESET_PASSWORD' | 'DONE'>(
    urlToken ? 'RESET_PASSWORD' : 'REQUEST_TOKEN'
  );
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState('');
  const [serverNotice, setServerNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
      setStep('RESET_PASSWORD');
    }
  }, [urlToken]);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await container.recoverPasswordUseCase.execute(email);
      setServerNotice(res.message);
      setStep('RESET_PASSWORD');
      toast.info('Solicitud procesada', res.message);
    } catch (err) {
      toast.danger(
        'Error al solicitar recuperación',
        err instanceof Error ? err.message : 'No se pudo procesar la solicitud.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await container.resetPasswordUseCase.execute({
        token,
        newPassword,
      });
      setStep('DONE');
      toast.success('Contraseña actualizada', res.message);
    } catch (err) {
      toast.danger(
        'Error al restablecer contraseña',
        err instanceof Error ? err.message : 'El token no es válido o ha expirado.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Recuperación de Contraseña del Portal"
      subtitle="Restablece tu clave de acceso de estudiante de Trading Life Academy."
    >
      {step !== 'DONE' && (
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-950 p-1 border border-slate-800 mb-4 text-xs">
          <button
            type="button"
            onClick={() => setStep('REQUEST_TOKEN')}
            className={`rounded-md py-1.5 font-semibold cursor-pointer transition-colors ${
              step === 'REQUEST_TOKEN'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Solicitar Enlace
          </button>
          <button
            type="button"
            onClick={() => setStep('RESET_PASSWORD')}
            className={`rounded-md py-1.5 font-semibold cursor-pointer transition-colors ${
              step === 'RESET_PASSWORD'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Restablecer con Token
          </button>
        </div>
      )}

      {step === 'REQUEST_TOKEN' && (
        <form onSubmit={handleRequestToken} className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Ingresa tu correo electrónico registrado. Te enviaremos un enlace con un token temporal válido por 1 hora para actualizar tu clave.
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Correo Electrónico Registrado
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="estudiante@correo.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Solicitar Recuperación
          </Button>
          <div className="text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver a Iniciar Sesión
            </Link>
          </div>
        </form>
      )}

      {step === 'RESET_PASSWORD' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {serverNotice && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              {serverNotice}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Token de Recuperación (<code className="text-amber-300">token</code> recibido por correo)
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Pega aquí el token del enlace de recuperación"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nueva Contraseña (<code className="text-amber-300">password</code>, 8 a 72 bytes UTF-8)
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña segura (mín. 8 caracteres)"
                minLength={8}
                maxLength={72}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Restablecer Contraseña
          </Button>
          <div className="text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver a Iniciar Sesión
            </Link>
          </div>
        </form>
      )}

      {step === 'DONE' && (
        <div className="space-y-4 text-center py-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">
            ¡Contraseña Actualizada con Éxito!
          </h3>
          <p className="text-xs text-slate-400">
            El token de recuperación ha sido consumido e invalidado. Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          <Link to="/auth/login" className="block">
            <Button variant="primary" size="lg" className="w-full">
              Ir a Iniciar Sesión
            </Button>
          </Link>
        </div>
      )}
    </AuthShell>
  );
};
