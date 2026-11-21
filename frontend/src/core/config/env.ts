export interface AppEnvironment {
  apiBaseUrl: string;
  panelPollIntervalMs: number;
  ninjaHeartbeatIntervalMs: number;
  hmacSharedSecretPreview: string;
}

export const env: AppEnvironment = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  panelPollIntervalMs: Number(import.meta.env.VITE_PANEL_POLL_INTERVAL_MS || 2500),
  ninjaHeartbeatIntervalMs: Number(
    import.meta.env.VITE_NINJA_HEARTBEAT_INTERVAL_MS || 4000
  ),
  hmacSharedSecretPreview: 'NT8_HMAC_SECRET_2026_PROD_KEY_99A8F',
};
