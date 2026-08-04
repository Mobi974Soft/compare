import type { PriceReport, Product, Store } from '@prixpei/domain';
import type { PriceReportInput } from '@prixpei/validation';
import { demoPrices, demoProduct, demoStores } from './mock-data';
import { isSupabaseConfigured, supabase } from './supabase';

const delay = (ms = 280): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  async getProductByBarcode(barcode: string): Promise<Product> {
    if (!isSupabaseConfigured) { await delay(); return { ...demoProduct, barcode }; }
    const { data, error } = await supabase.functions.invoke<Product>('scan-product', { body: { barcode } });
    if (error || !data) throw error ?? new Error('Produit introuvable');
    return data;
  },
  async getProductPrices(productId: string): Promise<PriceReport[]> {
    if (!isSupabaseConfigured) { await delay(); return demoPrices.filter((item) => item.productId === productId); }
    const { data, error } = await supabase.from('public_price_reports').select('*').eq('product_id', productId).order('price');
    if (error) throw error;
    return (data ?? []) as unknown as PriceReport[];
  },
  async getNearbyStores(): Promise<Store[]> {
    if (!isSupabaseConfigured) { await delay(180); return demoStores; }
    const { data, error } = await supabase.rpc('nearby_stores', { lat: -21.009, lng: 55.269, radius_meters: 15_000 });
    if (error) throw error;
    return (data ?? []) as Store[];
  },
  async createPriceReport(payload: PriceReportInput): Promise<{ id: string; status: 'published' | 'quarantined' }> {
    if (!isSupabaseConfigured) { await delay(500); return { id: crypto.randomUUID(), status: 'published' }; }
    const { data, error } = await supabase.functions.invoke<{ id: string; status: 'published' | 'quarantined' }>('create-price-report', { body: payload });
    if (error || !data) throw error ?? new Error('Publication impossible');
    return data;
  },
};
