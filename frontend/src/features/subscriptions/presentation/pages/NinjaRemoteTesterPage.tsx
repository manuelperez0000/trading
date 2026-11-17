import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  KeyRound,
  Play,
  Power,
  Send,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  XCircle,
} from 'lucide-react';
import { env } from '@core/config/env';
import { useI18n } from '@core/i18n/useLanguageStore';
import { computeNinjaHmacSignature } from '@core/crypto/hmacValidator';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { toast } from '@shared/ui/toast/toastStore';
import { RemoteSwitch } from '@shared/ui/RemoteSwitch';
import {
  useSimulateNinjaHeartbeatMutation,
  useSubscriptionsPolling,
  useToggleRemoteSubscriptionMutation,
} from '@features/subscriptions/application/hooks/useSubscriptionsPolling';
import type {
  HeartbeatRequestPayload,
  HeartbeatResponsePayload,
} from '@features/subscriptions/domain/entities/Subscription';

interface NinjaRemoteTesterPageProps {
  initialLicenseKey?: string | null;
}

export const NinjaRemoteTesterPage: React.FC<NinjaRemoteTesterPageProps> = ({
  initialLicenseKey,
}) => {
  const { t } = useI18n();
  const { data: subscriptions = [] } = useSubscriptionsPolling();
  const simulateMutation = useSimulateNinjaHeartbeatMutation();
  const toggleMutation = useToggleRemoteSubscriptionMutation();

  const [selectedLicenseKey, setSelectedLicenseKey] = useState<string>(
    initialLicenseKey || 'NT8-QTM-9921-ALPHA'
  );

  useEffect(() => {
    if (initialLicenseKey) {
      setSelectedLicenseKey(initialLicenseKey);
    }
  }, [initialLicenseKey]);

  const currentSubscription = useMemo(
    () =>
      subscriptions.find((s) => s.licenseKey === selectedLicenseKey) ??
      subscriptions[0],
    [subscriptions, selectedLicenseKey]
  );

  const [customMachineId, setCustomMachineId] = useState<string>(
    'WIN11-TRD-9F82A1C0'
  );
  const [customStrategy, setCustomStrategy] = useState<string>(
    'QuantumOrderFlowScalperV4'
  );
  const [customInstrument, setCustomInstrument] = useState<string>('NQ 12-26');
  const [customPnl, setCustomPnl] = useState<number>(2840.5);
  const [tamperSignature, setTamperSignature] = useState<boolean>(false);

  const [lastExchange, setLastExchange] = useState<{
    requestSent: HeartbeatRequestPayload;
    serverResponse: HeartbeatResponsePayload;
  } | null>(null);

  useEffect(() => {
    if (currentSubscription) {
      setCustomMachineId(
        currentSubscription.boundMachineId ?? 'WIN11-NEW-PC-001'
      );
      setCustomStrategy(currentSubscription.activeStrategyName);
      setCustomInstrument(currentSubscription.instrument);
      setCustomPnl(currentSubscription.dailyPnlUsd);
    }
  }, [currentSubscription?.id]);

  const previewSignature = useMemo(() => {
    if (!currentSubscription) return '';
    if (tamperSignature) return 'sha256=00000000deadbeef00000000tampered';
    return computeNinjaHmacSignature({
      licenseKey: currentSubscription.licenseKey,
      machineId: customMachineId,
      timestampIso: new Date().toISOString().slice(0, 16) + ':00.000Z',
      strategyName: customStrategy,
      accountName: currentSubscription.ninjaAccountName,
    });
  }, [
    currentSubscription,
    customMachineId,
    customStrategy,
    tamperSignature,
  ]);

  const runHeartbeatProbe = async (override?: {
    machineId?: string;
    tamperHmac?: boolean;
  }) => {
    if (!currentSubscription) return;

    const machineIdToUse = override?.machineId ?? customMachineId;
    const tamperToUse = override?.tamperHmac ?? tamperSignature;

    setCustomMachineId(machineIdToUse);
    setTamperSignature(tamperToUse);

    const result = await simulateMutation.mutateAsync({
      licenseKey: currentSubscription.licenseKey,
      machineId: machineIdToUse,
      strategyName: customStrategy,
      accountName: currentSubscription.ninjaAccountName,
      instrument: customInstrument,
      currentSessionPnlUsd: Number(customPnl),
      tamperHmacSignature: tamperToUse,
      simulatedLatencyMs: Math.floor(25 + Math.random() * 28),
    });

    setLastExchange(result);
  };

  if (!currentSubscription) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado del Laboratorio */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t.ninjaLab.title}
            </h1>
            <Badge variant="sky">{t.ninjaLab.badge}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {t.ninjaLab.subtitle}
          </p>
        </div>

        {/* Selector rápido de Licencia */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t.ninjaLab.licenseSelectLabel}
          </label>
          <select
            value={currentSubscription.licenseKey}
            onChange={(e) => setSelectedLicenseKey(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
          >
            {subscriptions.map((sub) => (
              <option key={sub.id} value={sub.licenseKey}>
                {sub.licenseKey} — {sub.traderName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Paso a Paso Interactivo */}
      <Card className="p-5 border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Power className="h-4 w-4" />
              Paso 1: Cambia el Estado Remoto en el Panel Web
            </div>
            <p className="text-sm text-slate-200">
              Trader: <strong>{currentSubscription.traderName}</strong> (
              <span className="font-mono text-sky-300">
                {currentSubscription.ninjaAccountName}
              </span>
              ) • Hardware vinculado:{' '}
              <span className="font-mono text-amber-300">
                {currentSubscription.boundMachineId ?? 'SIN VINCULAR'}
              </span>
            </p>
            <p className="text-xs text-slate-400">
              Nota actual: {currentSubscription.statusNote}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RemoteSwitch
              isEnabled={currentSubscription.remoteEnabled}
              syncState={currentSubscription.syncState}
              onToggle={() =>
                toggleMutation.mutate({
                  subscriptionId: currentSubscription.id,
                  enabled: !currentSubscription.remoteEnabled,
                  reason: 'Prueba desde Laboratorio NinjaTrader',
                })
              }
            />
            <Button
              variant="primary"
              size="md"
              isLoading={simulateMutation.isPending}
              onClick={() =>
                runHeartbeatProbe({
                  machineId:
                    currentSubscription.boundMachineId ?? 'WIN11-TRD-9F82A1C0',
                  tamperHmac: false,
                })
              }
            >
              <Play className="h-4 w-4" />
              Paso 2: Disparar Ciclo de Polling desde NinjaTrader
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid Principal: Emulador de Cliente NT8 (Izquierda) + Respuesta del Servidor (Derecha) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Panel Izquierdo: Configurador del Paquete de NinjaTrader */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-sky-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                Emulador de Instancia NinjaTrader 8 (Cliente C#)
              </h2>
            </div>
            <Badge variant="slate">POST /api/v1/ninja/heartbeat</Badge>
          </div>

          {/* Botones de Escenarios Preconfigurados */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">
              Escenarios Rápidos de Prueba de Seguridad y Apagado:
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  runHeartbeatProbe({
                    machineId:
                      currentSubscription.boundMachineId ??
                      'WIN11-TRD-9F82A1C0',
                    tamperHmac: false,
                  })
                }
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                1. Poll Legítimo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  runHeartbeatProbe({
                    machineId: 'WIN11-CLONED-PC-999',
                    tamperHmac: false,
                  })
                }
              >
                <Cpu className="h-3.5 w-3.5 text-amber-400" />
                2. PC No Autorizada
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  runHeartbeatProbe({
                    machineId:
                      currentSubscription.boundMachineId ??
                      'WIN11-TRD-9F82A1C0',
                    tamperHmac: true,
                  })
                }
              >
                <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                3. Firma HMAC Falsa
              </Button>
            </div>
          </div>

          {/* Parámetros del Paquete */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                MachineID (Hardware Fingerprint)
              </label>
              <input
                type="text"
                value={customMachineId}
                onChange={(e) => setCustomMachineId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Estrategia NinjaScript Activa
              </label>
              <input
                type="text"
                value={customStrategy}
                onChange={(e) => setCustomStrategy(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Instrumento Operado
              </label>
              <input
                type="text"
                value={customInstrument}
                onChange={(e) => setCustomInstrument(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                PnL Sesión Reportado (USD)
              </label>
              <input
                type="number"
                step="0.25"
                value={customPnl}
                onChange={(e) => setCustomPnl(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Firma Criptográfica */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/90 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                Cabecera X-Ninja-Signature (HMAC-SHA256)
              </span>
              <label className="flex items-center gap-1.5 text-xs text-rose-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tamperSignature}
                  onChange={(e) => setTamperSignature(e.target.checked)}
                  className="rounded border-slate-700"
                />
                Corromper firma para test
              </label>
            </div>
            <div className="truncate font-mono text-[11px] text-emerald-400/90">
              {previewSignature}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={simulateMutation.isPending}
            onClick={() => runHeartbeatProbe()}
          >
            <Send className="h-4 w-4" />
            Enviar Heartbeat HTTP a la API y Verificar Respuesta
          </Button>
        </Card>

        {/* Panel Derecho: Inspección de Respuesta y Acción Ejecutada en NinjaTrader */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                Respuesta del Servidor & Acción en NinjaTrader 8
              </h2>
            </div>
            {lastExchange && (
              <Badge
                variant={
                  lastExchange.serverResponse.allowedToTrade
                    ? 'emerald'
                    : 'rose'
                }
                pulse
              >
                {lastExchange.serverResponse.remoteCommand}
              </Badge>
            )}
          </div>

          {!lastExchange ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Terminal className="h-10 w-10 text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-300">
                Aún no has disparado un paquete manual en esta sesión
              </p>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                Haz clic en &ldquo;Paso 2: Disparar Ciclo de Polling&rdquo; o elige uno de los 3 escenarios rápidos para inspeccionar el payload JSON de ida y vuelta.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Semáforo de decisión para la Estrategia C# */}
              <div
                className={`rounded-xl border p-4 ${
                  lastExchange.serverResponse.allowedToTrade
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-rose-500/40 bg-rose-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {lastExchange.serverResponse.allowedToTrade ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">
                      {lastExchange.serverResponse.allowedToTrade
                        ? 'PERMITIDO OPERAR (allowedToTrade = true)'
                        : 'ORDEN DE APAGADO REMOTO (allowedToTrade = false)'}
                    </div>
                    <p className="text-xs text-slate-200">
                      {lastExchange.serverResponse.message}
                    </p>
                    <div className="pt-1 text-[11px] font-mono text-slate-300">
                      Acción C# en NinjaTrader:{' '}
                      <strong>
                        {lastExchange.serverResponse.allowedToTrade
                          ? 'KeepStrategyEnabled() — Continúa procesando OnBarUpdate()'
                          : 'CloseStrategy("RemoteKillSwitch") — Cancela órdenes y aplana posición'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* JSON Enviado y JSON Recibido */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Request JSON enviado por NinjaTrader 8:
                  </span>
                  <pre className="mt-1 max-h-36 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-sky-300">
                    {JSON.stringify(lastExchange.requestSent, null, 2)}
                  </pre>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Response JSON devuelto por el Panel/Backend:
                  </span>
                  <pre className="mt-1 max-h-36 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-emerald-300">
                    {JSON.stringify(
                      {
                        allowedToTrade:
                          lastExchange.serverResponse.allowedToTrade,
                        remoteCommand:
                          lastExchange.serverResponse.remoteCommand,
                        syncStateAfterPoll:
                          lastExchange.serverResponse.syncStateAfterPoll,
                        pollIntervalMs:
                          lastExchange.serverResponse.pollIntervalMs,
                        serverTimestampIso:
                          lastExchange.serverResponse.serverTimestampIso,
                        message: lastExchange.serverResponse.message,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Referencia de Integración C# NinjaScript para el Desarrollador */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contrato de Integración C# para NinjaTrader 8 (Polling HTTP + Kill-Switch)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const codeSnippet = `// Fragmento para tu Estrategia / AddOn en NinjaTrader 8 (C#)
// Endpoint: POST ${env.apiBaseUrl}/ninja/heartbeat (Cada ${env.ninjaHeartbeatIntervalMs / 1000}s)
private async Task PollRemoteLicenseStatusAsync()
{
    string machineId = NinjaTrader.Cbi.License.MachineId; // Hardware ID único de NT8
    string timestamp = DateTime.UtcNow.ToString("o");
    string signature = ComputeHmacSha256($"{LicenseKey}|{machineId}|{timestamp}|{Name}|{Account.Name}", SharedSecret);

    var response = await httpClient.PostAsJsonAsync("${env.apiBaseUrl}/ninja/heartbeat", new {
        licenseKey = this.LicenseKey,
        machineId = machineId,
        strategyName = this.Name,
        accountName = this.Account.Name,
        instrument = this.Instrument.FullName,
        currentSessionPnlUsd = Account.Get(AccountItem.RealizedProfitLoss, Currency.UsDollar),
        timestampIso = timestamp,
        hmacSignature = signature
    });

    var result = await response.Content.ReadFromJsonAsync<HeartbeatResponseDto>();
    if (!result.allowedToTrade || result.remoteCommand == "FLATTEN_AND_DISABLE")
    {
        // Apagado Remoto inmediato ordenado desde el Panel Web Admin
        ExitLong(); ExitShort();
        SetState(State.Terminated);
    }
}`;
                navigator.clipboard?.writeText(codeSnippet);
                toast.success('Código C# Copiado', 'Fragmento listo para pegar en tu estrategia de NinjaScript.');
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar Código C#
            </Button>
            <Badge variant="emerald">Listo para NinjaScript</Badge>
          </div>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed">
{`// Fragmento para tu Estrategia / AddOn en NinjaTrader 8 (C#)
// Endpoint: POST ${env.apiBaseUrl}/ninja/heartbeat (Cada ${env.ninjaHeartbeatIntervalMs / 1000}s)
private async Task PollRemoteLicenseStatusAsync()
{
    string machineId = NinjaTrader.Cbi.License.MachineId; // Hardware ID único de NT8
    string timestamp = DateTime.UtcNow.ToString("o");
    string signature = ComputeHmacSha256($"{LicenseKey}|{machineId}|{timestamp}|{Name}|{Account.Name}", SharedSecret);

    var response = await httpClient.PostAsJsonAsync("${env.apiBaseUrl}/ninja/heartbeat", new {
        licenseKey = this.LicenseKey,
        machineId = machineId,
        strategyName = this.Name,
        accountName = this.Account.Name,
        instrument = this.Instrument.FullName,
        currentSessionPnlUsd = Account.Get(AccountItem.RealizedProfitLoss, Currency.UsDollar),
        timestampIso = timestamp,
        hmacSignature = signature
    });

    var result = await response.Content.ReadFromJsonAsync<HeartbeatResponseDto>();
    if (!result.allowedToTrade || result.remoteCommand == "FLATTEN_AND_DISABLE")
    {
        // Apagado Remoto inmediato ordenado desde el Panel Web Admin
        ExitLong(); ExitShort();
        SetState(State.Terminated);
    }
}`}
        </pre>
      </Card>
    </div>
  );
};
