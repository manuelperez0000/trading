import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileSignature,
  FileText,
  MapPin,
  MessageCircle,
  Phone,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { httpClient } from '@core/http/httpClient';
import { toast } from '@shared/ui/toast/toastStore';
import {
  getEffectiveKycReviewDetails,
  saveKycReviewLocally,
  type KycVerificationStatus,
  type User as UserEntity,
} from '@features/auth/domain/entities/User';

interface ClientKycReviewModalProps {
  client: UserEntity | null;
  onClose: () => void;
  onReviewSaved: (
    clientId: string,
    updated: {
      kycStatus: KycVerificationStatus;
      kycNotes: string;
      kycRejectedItems: string[];
    }
  ) => void;
}

const CHECKABLE_KYC_ITEMS = [
  { key: 'urlDocumentoIdentidad', label: 'Documento de Identidad (DNI / Pasaporte)' },
  { key: 'urlReciboServicio', label: 'Recibo de Servicio Público (Domicilio)' },
  { key: 'urlContratoDisclaimer', label: 'Contrato y Disclaimer Firmado' },
  { key: 'direccion', label: 'Dirección Física Declarada' },
  { key: 'telefono', label: 'Teléfono Internacional' },
  { key: 'whatsapp', label: 'WhatsApp Internacional' },
];

const QUICK_REJECTION_TEMPLATES = [
  {
    itemKey: 'urlDocumentoIdentidad',
    text: 'El Documento de Identidad está borroso o ilegible. Por favor sube una foto nítida donde se lean todos los datos.',
  },
  {
    itemKey: 'urlDocumentoIdentidad',
    text: 'El Documento de Identidad adjunto se encuentra vencido. Sube un documento vigente.',
  },
  {
    itemKey: 'urlReciboServicio',
    text: 'El Recibo de Servicio Público no coincide con la dirección física declarada en tu perfil.',
  },
  {
    itemKey: 'urlReciboServicio',
    text: 'El Recibo de Servicio tiene una antigüedad mayor a 3 meses. Adjunta un comprobante reciente.',
  },
  {
    itemKey: 'urlContratoDisclaimer',
    text: 'El Contrato y Disclaimer no registra una firma electrónica válida con tu identificación.',
  },
];

export function buildCleanWhatsAppNumber(rawPhone?: string): string {
  if (!rawPhone) return '';
  return rawPhone.replace(/[^\d]/g, '');
}

export const ClientKycReviewModal: React.FC<ClientKycReviewModalProps> = ({
  client,
  onClose,
  onReviewSaved,
}) => {
  const [notes, setNotes] = useState('');
  const [rejectedItems, setRejectedItems] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!client) return;
    const details = getEffectiveKycReviewDetails(client);
    setNotes(details.notes || '');
    setRejectedItems(details.rejectedItems || []);
  }, [client]);

  if (!client) return null;

  const currentReview = getEffectiveKycReviewDetails(client);
  const cleanWhatsApp = buildCleanWhatsAppNumber(
    client.whatsapp || client.telefono
  );

  const toggleRejectedItem = (key: string) => {
    setRejectedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleApplyTemplate = (template: { itemKey: string; text: string }) => {
    if (!rejectedItems.includes(template.itemKey)) {
      setRejectedItems((prev) => [...prev, template.itemKey]);
    }
    setNotes((prev) =>
      prev.trim().length > 0 ? `${prev.trim()}\n• ${template.text}` : `• ${template.text}`
    );
  };

  const openWhatsAppNotification = (
    status: KycVerificationStatus,
    customNotes: string,
    flaggedKeys: string[]
  ) => {
    if (!cleanWhatsApp) {
      toast.warning(
        'Cliente sin número de WhatsApp válido',
        'El mensaje quedó guardado en su perfil de la plataforma, pero el cliente no tiene un número válido para abrir WhatsApp.'
      );
      return;
    }

    const flaggedLabels = flaggedKeys
      .map((k) => CHECKABLE_KYC_ITEMS.find((i) => i.key === k)?.label || k)
      .join(', ');

    const message =
      status === 'VERIFICADO'
        ? `Hola ${client.fullName}, te saludamos de *Trading Life Academy*. ✅ Hemos revisado tu perfil y documentación y todo cumple con las reglas. Tu cuenta ya ha sido *APROBADA y VERIFICADA*. Ya puedes ingresar a tu panel de cliente.`
        : `Hola ${client.fullName}, te saludamos de *Trading Life Academy*. ⚠️ Hemos revisado los documentos de tu perfil y necesitamos que actualices lo siguiente para aprobar tu cuenta:\n\n${
            flaggedLabels ? `*Elementos a corregir:* ${flaggedLabels}\n` : ''
          }*Observación del Administrador:*\n${customNotes.trim()}\n\nPor favor ingresa a tu perfil en la plataforma, corrige lo indicado y envíalo nuevamente a revisión.`;

    const waUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
      message
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSaveDecision = async (
    nextStatus: KycVerificationStatus,
    sendViaWhatsApp: boolean
  ) => {
    if (nextStatus === 'OBSERVADO' && notes.trim().length === 0) {
      toast.danger(
        'Escribe el motivo de la observación',
        'Debes indicar al cliente qué documento o dato está mal para que pueda actualizar su perfil.'
      );
      return;
    }

    const finalNotes = nextStatus === 'VERIFICADO' ? '' : notes.trim();
    const finalRejected = nextStatus === 'VERIFICADO' ? [] : rejectedItems;

    setIsSaving(true);
    try {
      // Guardar localmente para persistencia inmediata
      saveKycReviewLocally(
        { id: client.id, email: client.email },
        {
          kycStatus: nextStatus,
          kycNotes: finalNotes,
          kycRejectedItems: finalRejected,
          kycReviewedAt: new Date().toISOString(),
        }
      );

      // Intentar sincronizar con el backend Express/PostgreSQL si está disponible
      try {
        await httpClient.patch(`/users/${client.id}/kyc-review`, {
          kycStatus: nextStatus,
          kycNotes: finalNotes,
          kycRejectedItems: finalRejected,
          estado:
            nextStatus === 'VERIFICADO'
              ? 'verificado'
              : nextStatus === 'OBSERVADO'
              ? 'observado'
              : 'en_revision',
        });
      } catch {
        // Fallback local ya aplicado
      }

      onReviewSaved(client.id, {
        kycStatus: nextStatus,
        kycNotes: finalNotes,
        kycRejectedItems: finalRejected,
      });

      if (nextStatus === 'VERIFICADO') {
        toast.success(
          '¡Cliente Verificado y Aprobado!',
          `El perfil de ${client.fullName} cumple con las reglas y ha sido habilitado.`
        );
      } else {
        toast.warning(
          'Observación enviada al cliente',
          `Se notificó a ${client.fullName} qué elementos debe corregir en su perfil.`
        );
      }

      if (sendViaWhatsApp) {
        openWhatsAppNotification(nextStatus, finalNotes, finalRejected);
      }

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const docs = [
    {
      key: 'urlDocumentoIdentidad',
      title: '1. Documento de Identidad (DNI / Cédula / Pasaporte)',
      url: client.urlDocumentoIdentidad,
    },
    {
      key: 'urlReciboServicio',
      title: '2. Recibo de Servicio Público (Comprobante de Domicilio)',
      url: client.urlReciboServicio,
    },
    {
      key: 'urlContratoDisclaimer',
      title: '3. Contrato de Licencia y Disclaimer Firmado',
      url: client.urlContratoDisclaimer,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Revisión de Expediente y Documentación: {client.fullName}
                </h2>
                {currentReview.status === 'VERIFICADO' ? (
                  <Badge variant="emerald">Verificado</Badge>
                ) : currentReview.status === 'OBSERVADO' ? (
                  <Badge variant="rose">Con Observaciones</Badge>
                ) : currentReview.status === 'EN_REVISION' ? (
                  <Badge variant="sky" pulse>
                    Pendiente de Revisión
                  </Badge>
                ) : (
                  <Badge variant="amber">Perfil Incompleto</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Evalúa si los datos de contacto y los 3 documentos del cliente cumplen con las reglas de Trading Life Academy.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido Desplazable */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* 1. Ficha de Datos de Contacto del Cliente */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Datos Personales y de Contacto Enviados
              </span>
              {cleanWhatsApp && (
                <a
                  href={`https://wa.me/${cleanWhatsApp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Abrir Chat de WhatsApp ({client.whatsapp || client.telefono})
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-lg border border-slate-800/90 bg-slate-900/60 p-3 space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>Dirección Física:</span>
                </div>
                <div className="font-semibold text-white">
                  {client.direccion || (
                    <span className="text-rose-400 italic">No suministrada</span>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800/90 bg-slate-900/60 p-3 space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-sky-400" />
                  <span>Teléfono Internacional:</span>
                </div>
                <div className="font-mono font-semibold text-white">
                  {client.telefono || (
                    <span className="text-rose-400 italic">No suministrado</span>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800/90 bg-slate-900/60 p-3 space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>WhatsApp Internacional:</span>
                </div>
                <div className="font-mono font-semibold text-emerald-300">
                  {client.whatsapp || (
                    <span className="text-rose-400 italic">No suministrado</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Tarjetas de Inspección de los 3 Documentos */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Documentos Cargados por el Cliente (Haz clic para inspeccionar o marca si tiene error)
            </h3>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {docs.map((doc) => {
                const hasUrl = Boolean(doc.url && doc.url.trim().length > 0);
                const isFlagged = rejectedItems.includes(doc.key);
                const isImage =
                  hasUrl &&
                  /\.(png|jpe?g|gif|webp)$/i.test(doc.url.split('?')[0]);

                return (
                  <div
                    key={doc.key}
                    className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                      isFlagged
                        ? 'border-rose-500 bg-rose-950/20'
                        : hasUrl
                        ? 'border-slate-800 bg-slate-950/80'
                        : 'border-amber-500/40 bg-amber-950/10'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-white leading-snug">
                          {doc.title}
                        </span>
                        {hasUrl ? (
                          <Badge variant={isFlagged ? 'rose' : 'emerald'}>
                            {isFlagged ? 'Observado' : 'Cargado'}
                          </Badge>
                        ) : (
                          <Badge variant="amber">Faltante</Badge>
                        )}
                      </div>

                      {hasUrl ? (
                        <div className="space-y-2">
                          {isImage ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block overflow-hidden rounded-lg border border-slate-800 bg-slate-900 h-28"
                            >
                              <img
                                src={doc.url}
                                alt={doc.title}
                                className="h-full w-full object-cover hover:scale-105 transition-transform"
                              />
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-[11px] text-slate-300 font-mono truncate">
                              {doc.key === 'urlContratoDisclaimer' ? (
                                <FileSignature className="h-4 w-4 text-amber-400 shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-sky-400 shrink-0" />
                              )}
                              <span className="truncate">{doc.url}</span>
                            </div>
                          )}

                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 underline"
                          >
                            <span>Abrir documento completo</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-amber-300/90 italic py-4">
                          El cliente aún no ha subido este documento.
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRejectedItem(doc.key)}
                      className={`w-full rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        isFlagged
                          ? 'border-rose-500 bg-rose-500/20 text-rose-200'
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-rose-500/50 hover:text-rose-300'
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {isFlagged
                        ? 'Marcado para corrección'
                        : 'Marcar documento con error'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Sección para Indicar Qué Está Mal y Enviar Mensaje al Cliente */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  ¿Algún documento o dato no cumple con las reglas?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Selecciona qué elementos están mal y escribe las instrucciones para que el cliente actualice su perfil.
                </p>
              </div>
            </div>

            {/* Selector de elementos observados */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">
                Elementos que el cliente debe corregir (se desbloquearán en su perfil):
              </span>
              <div className="flex flex-wrap gap-2">
                {CHECKABLE_KYC_ITEMS.map((item) => {
                  const active = rejectedItems.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleRejectedItem(item.key)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                        active
                          ? 'border-rose-500 bg-rose-500/20 text-rose-200 font-semibold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {active ? '✗ ' : '+ '}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plantillas rápidas de corrección */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">
                Motivos frecuentes (clic para insertar en el mensaje):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REJECTION_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200 hover:bg-amber-500/20 transition-colors cursor-pointer text-left"
                  >
                    + {tpl.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Área de texto del mensaje al cliente */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mensaje de Observación para el Cliente (lo verá en su perfil y se enviará por WhatsApp):
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Hola, revisamos tu perfil pero la foto del documento de identidad se ve borrosa y el recibo de servicio no muestra la dirección completa. Por favor súbelos nuevamente..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pie del Modal con Acciones de Aprobación o Rechazo + WhatsApp */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={isSaving}
              onClick={() => handleSaveDecision('OBSERVADO', false)}
              className="border-rose-500/40 text-rose-300 hover:bg-rose-500/15 text-xs"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Guardar Observación en Plataforma
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isSaving}
              onClick={() => handleSaveDecision('OBSERVADO', true)}
              className="text-xs gap-1.5"
            >
              <MessageCircle className="h-4 w-4" />
              Solicitar Corrección + Enviar WhatsApp
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={() => handleSaveDecision('VERIFICADO', false)}
              className="text-xs gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" />
              Aprobar Documentos (Verificar)
            </Button>

            {cleanWhatsApp && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                isLoading={isSaving}
                onClick={() => handleSaveDecision('VERIFICADO', true)}
                className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/15 text-xs gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Aprobar + Avisar por WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
