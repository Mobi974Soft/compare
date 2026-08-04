import type { PriceReport, Product, Store } from '@prixpei/domain';

export const demoProduct: Product = {
  id: '11111111-1111-4111-8111-111111111111',
  barcode: '3017620422003',
  name: 'Pâte à tartiner noisettes',
  brand: 'Nutella',
  displayQuantity: 'Pot 400 g',
  normalizedQuantity: 400,
  unit: 'g',
  category: 'Épicerie sucrée',
  imageUrl: 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.633.400.jpg',
  imageAttribution: 'Open Food Facts — CC BY-SA',
  isProvisional: false,
};

export const demoStores: Store[] = [
  { id: '21111111-1111-4111-8111-111111111111', name: 'Marché des Tamarins', address: '12 rue des Flamboyants', city: 'Saint-Paul', postalCode: '97460', latitude: -21.009, longitude: 55.269, distanceKm: 1.2, reliability: 92 },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Supermarché Savanna', address: '8 avenue du Stade', city: 'Saint-Paul', postalCode: '97460', latitude: -20.998, longitude: 55.287, distanceKm: 3.6, reliability: 84 },
  { id: '23333333-3333-4333-8333-333333333333', name: 'Comptoir de l’Ouest', address: '5 chemin des Fleurs', city: 'Le Port', postalCode: '97420', latitude: -20.944, longitude: 55.298, distanceKm: 8.4, reliability: 76 },
];

export const demoPrices: PriceReport[] = [
  { id: '31111111-1111-4111-8111-111111111111', productId: demoProduct.id, store: demoStores[0]!, price: 3.84, currency: 'EUR', priceType: 'regular', loyaltyOnly: false, observedAt: new Date(Date.now() - 42 * 60_000).toISOString(), trustScore: 88, confirmations: 12, disputes: 1, authorAlias: 'Letchi974' },
  { id: '32222222-2222-4222-8222-222222222222', productId: demoProduct.id, store: demoStores[1]!, price: 3.95, currency: 'EUR', priceType: 'promotion', loyaltyOnly: true, conditions: 'Avec la carte du magasin', observedAt: new Date(Date.now() - 5 * 3_600_000).toISOString(), trustScore: 73, confirmations: 6, disputes: 0, authorAlias: 'MayaPéi' },
  { id: '33333333-3333-4333-8333-333333333333', productId: demoProduct.id, store: demoStores[2]!, price: 4.19, currency: 'EUR', priceType: 'regular', loyaltyOnly: false, observedAt: new Date(Date.now() - 4 * 86_400_000).toISOString(), trustScore: 46, confirmations: 2, disputes: 1, authorAlias: 'TiMarcheur' },
];

export const demoLeaderboard = [
  { rank: 1, alias: 'MayaPéi', points: 940, badge: '🏆', area: 'Saint-Paul' },
  { rank: 2, alias: 'Letchi974', points: 870, badge: '🌟', area: 'Le Port' },
  { rank: 3, alias: 'TiMarcheur', points: 790, badge: '🧭', area: 'La Possession' },
  { rank: 4, alias: 'VanilleBleue', points: 660, badge: '✅', area: 'Saint-Leu' },
];
