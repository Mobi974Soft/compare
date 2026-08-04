export type TrustLabel = 'Fiabilité élevée' | 'Probablement valide' | 'À confirmer' | 'Information ancienne ou contestée' | 'Probablement périmé';
export type ValidationType = 'confirmed' | 'price_changed' | 'not_available' | 'wrong_product' | 'wrong_store' | 'suspected_abuse';
export type PriceType = 'regular' | 'promotion';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  displayQuantity: string;
  normalizedQuantity: number;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'unit';
  category: string;
  imageUrl?: string;
  imageAttribution: string;
  isProvisional: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  reliability: number;
}

export interface PriceReport {
  id: string;
  productId: string;
  store: Store;
  price: number;
  currency: 'EUR';
  priceType: PriceType;
  loyaltyOnly: boolean;
  observedAt: string;
  trustScore: number;
  confirmations: number;
  disputes: number;
  authorAlias: string;
  conditions?: string;
  comment?: string;
}

export interface TrustScoreInput {
  authorReliability: number;
  confirmations: Array<{ reliability: number; ageHours: number }>;
  disputes: Array<{ reliability: number }>;
  ageHours: number;
  categoryHalfLifeHours?: number;
  anomalyRisk?: number;
  promotion?: boolean;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export function calculateTrustScore(input: TrustScoreInput): number {
  const halfLife = input.categoryHalfLifeHours ?? (input.promotion ? 36 : 168);
  const freshnessPenalty = Math.min(35, (input.ageHours / halfLife) * 18);
  const authorBonus = clamp(input.authorReliability, 0, 100) * 0.2;
  const confirmationBonus = Math.min(
    35,
    input.confirmations.reduce((sum, item) => sum + clamp(item.reliability, 0, 100) / 100 * 8 * Math.exp(-item.ageHours / 168), 0),
  );
  const disputePenalty = input.disputes.reduce((sum, item) => sum + clamp(item.reliability, 0, 100) / 100 * 12, 0);
  const anomalyPenalty = clamp(input.anomalyRisk ?? 0, 0, 100) * 0.2;
  return Math.round(clamp(35 + authorBonus + confirmationBonus - freshnessPenalty - disputePenalty - anomalyPenalty, 0, 100));
}

export function trustLabel(score: number): TrustLabel {
  if (score >= 80) return 'Fiabilité élevée';
  if (score >= 60) return 'Probablement valide';
  if (score >= 40) return 'À confirmer';
  if (score >= 20) return 'Information ancienne ou contestée';
  return 'Probablement périmé';
}

export function normalizeBarcode(raw: string): string {
  return raw.replace(/\D/g, '').padStart(raw.replace(/\D/g, '').length === 12 ? 13 : 0, '0');
}

export function isValidGtin(raw: string): boolean {
  const code = normalizeBarcode(raw);
  if (![8, 12, 13, 14].includes(code.length)) return false;
  const digits = [...code].map(Number);
  const check = digits.pop();
  if (check === undefined || digits.some(Number.isNaN)) return false;
  const sum = digits.reverse().reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

export function normalizedUnitPrice(price: number, quantity: number, unit: Product['unit']): number | null {
  if (price <= 0 || quantity <= 0) return null;
  const base = unit === 'g' || unit === 'ml' ? quantity / 1000 : quantity;
  return Math.round((price / base) * 100) / 100;
}

export function formatObservedAt(isoDate: string, now = new Date()): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(isoDate).getTime()) / 60_000));
  if (minutes < 60) return `Observé il y a ${minutes || 1} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Observé il y a ${hours} h`;
  return `Observé il y a ${Math.floor(hours / 24)} j`;
}

export function contributorLevel(points: number): { level: number; title: string; progress: number } {
  const thresholds = [0, 100, 300, 700, 1500, 3000];
  const titles = ['Nouveau contributeur', 'Éclaireur', 'Contributeur actif', 'Contributeur fiable', 'Expert local', 'Ambassadeur péi'];
  const safePoints = Math.max(0, points);
  let level = 0;
  for (let index = 0; index < thresholds.length; index += 1) {
    if (safePoints >= (thresholds[index] ?? 0)) level = index;
  }
  const current = thresholds[level] ?? 0;
  const next = thresholds[level + 1];
  const progress = next === undefined ? 1 : (safePoints - current) / (next - current);
  return { level: level + 1, title: titles[level] ?? titles[0]!, progress: clamp(progress, 0, 1) };
}
