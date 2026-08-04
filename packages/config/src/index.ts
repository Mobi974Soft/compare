export const APP_NAME = 'PrixPéi';
export const DEFAULT_RADIUS_KM = 10;
export const PRODUCT_CACHE_HOURS = 24 * 7;
export const MAX_COMMENT_LENGTH = 280;
export const SUPPORTED_COUNTRIES = ['FR', 'RE'] as const;

export const trustThresholds = {
  high: 80,
  probable: 60,
  confirm: 40,
  old: 20,
} as const;
