import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Badge } from '@shared/ui/Badge';
import { ThemeToggleButton } from '@shared/ui/ThemeToggleButton';
import { LanguageSwitcherButton } from '@shared/ui/LanguageSwitcherButton';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import { container } from '@app/di/container';
import { toast } from '@shared/ui/toast/toastStore';

const AuthShell: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageSwitcherButton />
        <ThemeToggleButton />
      </div>
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <img
            src="/tla-logo.jpg"
            alt="Trading Life Academy"
            className="h-20 w-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl shadow-amber-500/20 mb-3"
          />
          <Badge variant="amber">Trading Life Academy • NinjaTrader 8</Badge>
          <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase mt-1.5">
            Learn • Trade • Grow
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        <Card className="p-6 border-slate-800 bg-slate-900/80">{children}</Card>
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('carlos@tradinglifeacademy.com');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState<'ADMIN' | 'TRADER'>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password, requestedRole: role });
      toast.success('Sesión iniciada', `Bienvenido al panel como ${role}.`);
      navigate('/catalog');
    } catch (err) {
      toast.danger('Error al iniciar sesión', err instanceof Error ? err.message : 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Iniciar Sesión en la Plataforma"
      subtitle="Accede a tus bots de NinjaTrader 8, licencias remotas y comunidad verificada."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-400">
              Contraseña
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
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Modo de Acceso (Simulación de Rol)
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'TRADER')}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-emerald-300"
          >
            <option value="ADMIN">
              Administrador (Panel Control Remoto + Portal Trader)
            </option>
            <option value="TRADER">
              Trader / Cliente (Catálogo, Licencias, Facturación y Comunidad)
            </option>
          </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Entrar al Panel
        </Button>

        <div className="pt-2 text-center text-xs text-slate-400">
          ¿Aún no tienes cuenta?{' '}
          <Link
            to="/auth/register"
            className="font-semibold text-emerald-400 hover:underline"
          >
            Crear cuenta de Trader
          </Link>
        </div>
      </form>
    </AuthShell>
  );
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [machineId, setMachineId] = useState('WIN11-TRD-9F82A1C0');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({
        fullName: fullName.trim() || 'Nuevo Trader',
        email,
        password,
        defaultMachineId: machineId.trim(),
      });
      toast.success('Cuenta creada', 'Bienvenido a Trading Life Academy.');
      navigate('/catalog');
    } catch (err) {
      toast.danger('Error en el registro', err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Registro de Nuevo Trader"
      subtitle="Crea tu cuenta para adquirir bots automatizados y vincular tu licencia de NinjaTrader 8."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Nombre Completo
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Alejandro Mendoza"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

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
              placeholder="trader@correo.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Machine ID de NinjaTrader 8 (Opcional — puedes vincularlo luego)
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Contraseña Segura
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
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
          Completar Registro
        </Button>

        <div className="pt-2 text-center text-xs text-slate-400">
          ¿Ya tienes una cuenta activa?{' '}
          <Link
            to="/auth/login"
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
  const [step, setStep] = useState<'REQUEST_TOKEN' | 'RESET_PASSWORD' | 'DONE'>(
    'REQUEST_TOKEN'
  );
  const [email, setEmail] = useState('carlos@tradinglifeacademy.com');
  const [code, setCode] = useState('849201');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await container.recoverPasswordUseCase.execute(email);
      setStep('RESET_PASSWORD');
      toast.info('Código enviado', `Revisa tu correo ${email}`);
    } catch (err) {
      toast.danger('Error', err instanceof Error ? err.message : 'No se pudo enviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await container.resetPasswordUseCase.execute({ email, code, newPassword });
      setStep('DONE');
      toast.success('Contraseña actualizada', 'Ya puedes iniciar sesión con tu nueva contraseña.');
    } catch (err) {
      toast.danger('Error', err instanceof Error ? err.message : 'Código inválido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Recuperación y Cambio de Contraseña"
      subtitle="Restablece el acceso seguro a tu cuenta y licencias de NinjaTrader."
    >
      {step === 'REQUEST_TOKEN' && (
        <form onSubmit={handleRequestToken} className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Ingresa el correo asociado a tu cuenta. Te enviaremos un código de seguridad de 6 dígitos para autorizar el cambio de contraseña.
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Correo Electrónico Registrado
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Enviar Código de Recuperación
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
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            Código enviado a <strong>{email}</strong>.
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Código de Verificación (6 dígitos)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-emerald-300"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Confirmar Cambio de Contraseña
          </Button>
        </form>
      )}

      {step === 'DONE' && (
        <div className="space-y-4 text-center py-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">
            ¡Contraseña Actualizada con Éxito!
          </h3>
          <p className="text-xs text-slate-400">
            Tus credenciales han sido renovadas y tus sesiones previas fueron revocadas por seguridad.
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
