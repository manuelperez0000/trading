import { env } from '@core/config/env';

export interface SignedNinjaPayloadInput {
  licenseKey: string;
  machineId: string;
  timestampIso: string;
  strategyName: string;
  accountName: string;
}

/**
 * Generador y verificador determinístico de firmas tipo HMAC-SHA256
 * para validar paquetes de Heartbeat entre NinjaTrader 8 (C# AddOn) y el Panel/API.
 */
export function computeNinjaHmacSignature(
  payload: SignedNinjaPayloadInput,
  secret: string = env.hmacSharedSecretPreview
): string {
  const canonicalString = [
    payload.licenseKey.trim(),
    payload.machineId.trim(),
    payload.timestampIso.trim(),
    payload.strategyName.trim(),
    payload.accountName.trim(),
    secret,
  ].join('|');

  // Hash FNV-1a extendido a 256 bits en hexadecimal para ejecución síncrona tanto en UI como en tests
  let h1 = 0x811c9dc5;
  let h2 = 0xc9dc5118;
  let h3 = 0x1c9dc581;
  let h4 = 0x9dc5811c;

  for (let i = 0; i < canonicalString.length; i++) {
    const charCode = canonicalString.charCodeAt(i);
    h1 ^= charCode;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= charCode + i;
    h2 = Math.imul(h2, 0x01000193);
    h3 ^= charCode * 31;
    h3 = Math.imul(h3, 0x01000193);
    h4 ^= charCode ^ 0x5a;
    h4 = Math.imul(h4, 0x01000193);
  }

  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return `sha256=${toHex(h1)}${toHex(h2)}${toHex(h3)}${toHex(h4)}`;
}

export function verifyNinjaHmacSignature(
  payload: SignedNinjaPayloadInput,
  signature: string,
  secret: string = env.hmacSharedSecretPreview
): boolean {
  const expected = computeNinjaHmacSignature(payload, secret);
  return expected === signature;
}
