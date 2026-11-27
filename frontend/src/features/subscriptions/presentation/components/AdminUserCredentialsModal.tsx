import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Save,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { httpClient } from '@core/http/httpClient';
import { toast } from '@shared/ui/toast/toastStore';
import { useAuthStore } from '@features/auth/application/useAuthStore';
import {
  resolveUserCredentials,
  saveUserCredentialLocally,
  type User as UserEntity,
} from '@features/auth/domain/entities/User';

interface AdminUserCredentialsModalProps {
  open: boolean;
  users: UserEntity[];
  focusedUser?: UserEntity | null;
  onClose: () => void;
  onPasswordUpdated?: (userId: string, newPassword: string) => void;
}

export const AdminUserCredentialsModal: React.FC<
  AdminUserCredentialsModalProps
> = ({ open, users, focusedUser, onClose, onPasswordUpdated }) => {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllPasswords, setShowAllPasswords] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [viewAllInModal, setViewAllInModal] = useState(false);
  const [credentialsTick, setCredentialsTick] = useState(0);

  // Protección estricta: solo accesible y visible en sesión de Administrador (role === 'ADMIN')
  const isStrictAdmin = isAuthenticated && currentUser.role === 'ADMIN';

  const displayedUsers = useMemo(() => {
    void credentialsTick;
    const sourceList =
      focusedUser && !viewAllInModal ? [focusedUser] : users;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sourceList;

    return sourceList.filter((u) => {
      const creds = resolveUserCredentials(u);
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        creds.username.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    });
  }, [users, focusedUser, viewAllInModal, searchQuery, credentialsTick]);

  if (!open || !isStrictAdmin) {
    return null;
  }

  const isPasswordVisible = (userId: string) =>
    showAllPasswords || Boolean(revealedIds[userId]);

  const toggleRevealSingle = (userId: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [userId]: !isPasswordVisible(userId),
    }));
  };

  const handleCopyText = (label: string, value: string) => {
    navigator.clipboard?.writeText(value);
    toast.success(`${label} copiado al portapapeles`, value);
  };

  const handleStartEditPassword = (target: UserEntity) => {
    const creds = resolveUserCredentials(target);
    setEditingUserId(target.id);
    setNewPasswordInput(creds.password);
  };

  const handleSaveNewPassword = async (target: UserEntity) => {
    const cleanPass = newPasswordInput.trim();
    if (cleanPass.length < 6) {
      toast.danger(
        'Contraseña muy corta',
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    setIsSavingPassword(true);
    try {
      saveUserCredentialLocally({
        userId: target.id,
        email: target.email,
        username: target.handle,
        password: cleanPass,
      });

      try {
        await httpClient.patch(`/users/${target.id}/credentials`, {
          password: cleanPass,
        });
      } catch {
        // Fallback local ya almacenado en la bóveda de credenciales del Admin
      }

      onPasswordUpdated?.(target.id, cleanPass);
      setCredentialsTick((t) => t + 1);
      setEditingUserId(null);
      toast.success(
        'Contraseña actualizada',
        `Nueva contraseña asignada para ${target.fullName} (${target.email}).`
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Cabecera del Modal Protegido para Admin */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-6 py-4 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {focusedUser && !viewAllInModal
                    ? `Credenciales de Acceso — ${focusedUser.fullName}`
                    : 'Bóveda de Usuarios y Contraseñas (Solo Administrador)'}
                </h2>
                <Badge variant="amber">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Rol Exclusivo: ADMIN
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Consulta, copia o actualiza el usuario (correo / handle) y la contraseña de acceso de las cuentas registradas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {focusedUser && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setViewAllInModal((prev) => !prev)}
                className="text-xs gap-1.5 border-sky-500/30 text-sky-300"
              >
                <Users className="h-3.5 w-3.5" />
                {viewAllInModal
                  ? `Ver solo a ${focusedUser.fullName}`
                  : `Ver todos los usuarios (${users.length})`}
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              title="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Barra de Búsqueda y Control Global de Visibilidad */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/50 px-6 py-3">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, correo electrónico, @usuario o ID..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowAllPasswords((prev) => !prev)}
              className="text-xs gap-1.5"
            >
              {showAllPasswords ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                  Ocultar Contraseñas
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-emerald-400" />
                  Mostrar Todas las Contraseñas
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabla de Credenciales de Usuarios */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Cliente / Rol</th>
                  <th className="py-3 px-4">Usuario (Correo / Username)</th>
                  <th className="py-3 px-4">Contraseña de Acceso</th>
                  <th className="py-3 px-4 text-right">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {displayedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-slate-400"
                    >
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((u) => {
                    const creds = resolveUserCredentials(u);
                    const visible = isPasswordVisible(u.id);
                    const isEditing = editingUserId === u.id;

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {u.fullName}
                            </span>
                            <Badge
                              variant={u.role === 'ADMIN' ? 'amber' : 'sky'}
                            >
                              {u.role}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: #{u.id} • Handle: {creds.username}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <code className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 font-mono text-xs text-sky-300 font-semibold">
                              {creds.email}
                            </code>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText('Usuario (Correo)', creds.email)
                              }
                              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:border-sky-500/40 hover:text-sky-300 cursor-pointer"
                              title="Copiar correo de usuario"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newPasswordInput}
                                onChange={(e) =>
                                  setNewPasswordInput(e.target.value)
                                }
                                placeholder="Nueva contraseña..."
                                className="w-44 rounded-lg border border-amber-500/50 bg-slate-900 px-2.5 py-1 font-mono text-xs text-white focus:outline-none"
                                autoFocus
                              />
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                isLoading={isSavingPassword}
                                onClick={() => handleSaveNewPassword(u)}
                                className="text-xs px-2.5 py-1"
                              >
                                <Save className="h-3.5 w-3.5" />
                                Guardar
                              </Button>
                              <button
                                type="button"
                                onClick={() => setEditingUserId(null)}
                                className="text-xs text-slate-400 hover:text-white cursor-pointer px-1"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <code className="rounded-lg border border-amber-500/30 bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-amber-300">
                                {visible ? creds.password : '••••••••••••'}
                              </code>
                              <button
                                type="button"
                                onClick={() => toggleRevealSingle(u.id)}
                                className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white cursor-pointer"
                                title={
                                  visible
                                    ? 'Ocultar contraseña'
                                    : 'Mostrar contraseña'
                                }
                              >
                                {visible ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText('Contraseña', creds.password)
                                }
                                className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:border-amber-500/40 hover:text-amber-300 cursor-pointer"
                                title="Copiar contraseña"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleCopyText(
                                  'Credenciales completas',
                                  `Usuario: ${creds.email} | Contraseña: ${creds.password}`
                                )
                              }
                              className="text-xs gap-1"
                            >
                              <Copy className="h-3 w-3" />
                              Copiar Ambos
                            </Button>
                            {!isEditing && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleStartEditPassword(u)}
                                className="text-xs gap-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/15"
                              >
                                <Edit3 className="h-3 w-3" />
                                Editar Clave
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950 px-6 py-3.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            <span>
              Vista confidencial protegida para sesión activa de Administrador ({currentUser.email}).
            </span>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
