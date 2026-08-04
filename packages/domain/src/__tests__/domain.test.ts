import { describe, expect, it } from 'vitest';
import { calculateTrustScore, contributorLevel, isValidGtin, normalizedUnitPrice, trustLabel } from '../index.js';

describe('EAN / GTIN', () => {
  it('valide un EAN-13 connu et rejette une clé erronée', () => {
    expect(isValidGtin('3017620422003')).toBe(true);
    expect(isValidGtin('3017620422004')).toBe(false);
  });
});

describe('normalisation de prix', () => {
  it('calcule le prix au kilogramme', () => expect(normalizedUnitPrice(2.5, 500, 'g')).toBe(5));
  it('refuse une valeur nulle', () => expect(normalizedUnitPrice(0, 500, 'g')).toBeNull());
});

describe('confiance et réputation', () => {
  it('augmente avec des confirmations fiables', () => {
    const base = calculateTrustScore({ authorReliability: 50, confirmations: [], disputes: [], ageHours: 2 });
    const confirmed = calculateTrustScore({ authorReliability: 50, confirmations: [{ reliability: 90, ageHours: 1 }], disputes: [], ageHours: 2 });
    expect(confirmed).toBeGreaterThan(base);
  });
  it('décroît avec le temps', () => {
    const recent = calculateTrustScore({ authorReliability: 80, confirmations: [], disputes: [], ageHours: 2 });
    const old = calculateTrustScore({ authorReliability: 80, confirmations: [], disputes: [], ageHours: 600 });
    expect(old).toBeLessThan(recent);
  });
  it('retourne les bons libellés', () => expect(trustLabel(82)).toBe('Fiabilité élevée'));
  it('sépare niveau et fiabilité', () => expect(contributorLevel(750).title).toBe('Contributeur fiable'));
});
