export interface AppEnvironment {
  apiBaseUrl: string;
  adminUserIds: string[];
  panelPollIntervalMs: number;
  ninjaHeartbeatIntervalMs: number;
  hmacSharedSecretPreview: string;
}

export const env: AppEnvironment = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    'https://www.tradinglifeacademy.com/api/v1',
  adminUserIds: String(import.meta.env.VITE_ADMIN_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
  panelPollIntervalMs: Number(import.meta.env.VITE_PANEL_POLL_INTERVAL_MS || 2500),
  ninjaHeartbeatIntervalMs: Number(
    import.meta.env.VITE_NINJA_HEARTBEAT_INTERVAL_MS || 4000
  ),
  hmacSharedSecretPreview: 'NT8_HMAC_SECRET_2026_PROD_KEY_99A8F',
};
