import { createClient } from 'npm:@supabase/supabase-js@2';
import { normalizeBarcode } from '../_shared/barcode.ts';
import { corsHeaders, json } from '../_shared/http.ts';

interface OffProduct {
  product_name_fr?: string;
  product_name?: string;
  generic_name_fr?: string;
  brands?: string;
  quantity?: string;
  product_quantity?: number;
  product_quantity_unit?: string;
  categories?: string;
  image_front_url?: string;
}
interface OffResponse { status: string; product?: OffProduct }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  try {
    const body = await request.json() as { barcode?: unknown };
    const barcode = normalizeBarcode(body.barcode);
    if (!barcode) return json({ error: 'invalid_barcode' }, 400);
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: cached } = await admin.from('products').select('*').eq('barcode', barcode).is('deleted_at', null).maybeSingle();
    if (cached?.cache_expires_at && new Date(cached.cache_expires_at) > new Date()) return json(toProduct(cached));

    const { data: source } = await admin.from('data_sources').select('*').eq('name', 'Open Food Facts').eq('is_enabled', true).maybeSingle();
    if (!source) return cached ? json(toProduct(cached)) : json({ error: 'source_disabled' }, 503);
    const baseUrl = Deno.env.get('OPEN_FOOD_FACTS_BASE_URL') ?? 'https://world.openfoodfacts.org';
    const userAgent = Deno.env.get('OPEN_FOOD_FACTS_USER_AGENT');
    if (!userAgent) return cached ? json(toProduct(cached)) : json({ error: 'provider_not_configured' }, 503);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6_000);
    const response = await fetch(`${baseUrl}/api/v3.6/product/${barcode}.json?fields=product_name_fr,product_name,generic_name_fr,brands,quantity,product_quantity,product_quantity_unit,categories,image_front_url`, { headers: { 'User-Agent': userAgent }, signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return cached ? json(toProduct(cached)) : json({ error: 'provider_unavailable' }, 503);
    const off = await response.json() as OffResponse;
    if (off.status !== 'success' || !off.product) return cached ? json(toProduct(cached)) : json({ error: 'product_not_found' }, 404);
    const product = off.product;
    const row = {
      barcode,
      name: clean(product.product_name_fr ?? product.product_name) ?? 'Produit à compléter',
      generic_name: clean(product.generic_name_fr),
      brand: clean(product.brands),
      display_quantity: clean(product.quantity),
      normalized_quantity: positiveNumber(product.product_quantity),
      unit: normalizeUnit(product.product_quantity_unit),
      category: clean(product.categories?.split(',')[0]),
      image_url: validOffImage(product.image_front_url),
      image_source_id: source.id,
      image_license: 'CC BY-SA',
      verification_status: 'verified',
      synced_at: new Date().toISOString(),
      cache_expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    };
    const { data, error } = await admin.from('products').upsert(row, { onConflict: 'barcode' }).select('*').single();
    if (error) throw error;
    await admin.from('product_sources').upsert({ product_id: data.id, source_id: source.id, external_id: barcode, source_payload: { provider_version: 'v3.6' }, synced_at: new Date().toISOString() }, { onConflict: 'product_id,source_id' });
    return json(toProduct(data));
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', function: 'scan-product', message: error instanceof Error ? error.message : 'unknown' }));
    return json({ error: 'internal_error' }, 500);
  }
});

function clean(value: string | undefined): string | null { const result = value?.trim(); return result ? result.slice(0, 500) : null; }
function positiveNumber(value: number | undefined): number | null { return typeof value === 'number' && value > 0 && value < 1_000_000 ? value : null; }
function normalizeUnit(value: string | undefined): 'g' | 'kg' | 'ml' | 'l' | 'unit' | null { const unit = value?.toLowerCase(); return unit === 'g' || unit === 'kg' || unit === 'ml' || unit === 'l' ? unit : null; }
function validOffImage(value: string | undefined): string | null { if (!value) return null; try { const url = new URL(value); return url.protocol === 'https:' && url.hostname.endsWith('openfoodfacts.org') ? url.toString() : null; } catch { return null; } }
function toProduct(row: Record<string, unknown>) { return { id: row.id, barcode: row.barcode, name: row.name, brand: row.brand ?? '', displayQuantity: row.display_quantity ?? '', normalizedQuantity: row.normalized_quantity ?? 1, unit: row.unit ?? 'unit', category: row.category ?? 'Autre', imageUrl: row.image_url ?? undefined, imageAttribution: 'Open Food Facts — CC BY-SA', isProvisional: row.verification_status === 'provisional' }; }
