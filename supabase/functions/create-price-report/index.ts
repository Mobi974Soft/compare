import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';

interface Payload { productId?: unknown; storeId?: unknown; price?: unknown; priceType?: unknown; loyaltyOnly?: unknown; availability?: unknown; observedAt?: unknown; conditions?: unknown; comment?: unknown }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return json({ error: 'unauthorized' }, 401);
  try {
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await client.auth.getUser();
    if (!user) return json({ error: 'unauthorized' }, 401);
    const body = await request.json() as Payload;
    const validation = validate(body);
    if (!validation.ok) return json({ error: 'invalid_payload', fields: validation.errors }, 400);
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const { count } = await admin.from('price_reports').select('id', { count: 'exact', head: true }).eq('author_id', user.id).gte('created_at', since);
    if ((count ?? 0) >= 5) return json({ error: 'rate_limited' }, 429);
    const { data: duplicate } = await admin.from('price_reports').select('id').eq('author_id', user.id).eq('product_id', body.productId).eq('store_id', body.storeId).eq('price', body.price).gte('created_at', new Date(Date.now() - 30 * 60_000).toISOString()).maybeSingle();
    if (duplicate) return json({ error: 'duplicate_report' }, 409);
    const risk = Number(body.price) > 1_000 ? 90 : Number(body.price) < 0.1 ? 90 : 0;
    const status = risk >= 70 ? 'quarantined' : 'approved';
    const { data, error } = await admin.from('price_reports').insert({ product_id: body.productId, store_id: body.storeId, author_id: user.id, price: Number(body.price), currency: 'EUR', price_type: body.priceType, loyalty_only: body.loyaltyOnly, availability: body.availability, observed_at: body.observedAt, conditions: trim(body.conditions, 160), comment: trim(body.comment, 280), risk_score: risk, status }).select('id').single();
    if (error) throw error;
    await admin.from('score_events').insert({ user_id: user.id, event_type: 'price_report', points: 10, status: 'provisional', reference_type: 'price_report', reference_id: data.id, reason: 'Prix publié, en attente de confirmations' });
    await admin.from('audit_logs').insert({ actor_id: user.id, action: 'price_report.created', entity_type: 'price_report', entity_id: data.id, metadata: { status, risk } });
    return json({ id: data.id, status: status === 'approved' ? 'published' : 'quarantined' }, 201);
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', function: 'create-price-report', message: error instanceof Error ? error.message : 'unknown' }));
    return json({ error: 'internal_error' }, 500);
  }
});

function validate(body: Payload): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof body.productId !== 'string' || !uuid.test(body.productId)) errors.push('productId');
  if (typeof body.storeId !== 'string' || !uuid.test(body.storeId)) errors.push('storeId');
  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0 || body.price > 10_000) errors.push('price');
  if (body.priceType !== 'regular' && body.priceType !== 'promotion') errors.push('priceType');
  if (typeof body.loyaltyOnly !== 'boolean') errors.push('loyaltyOnly');
  if (!['available', 'low_stock', 'unavailable'].includes(String(body.availability))) errors.push('availability');
  const observed = typeof body.observedAt === 'string' ? new Date(body.observedAt) : null;
  if (!observed || Number.isNaN(observed.getTime()) || observed > new Date() || observed < new Date(Date.now() - 14 * 86_400_000)) errors.push('observedAt');
  return { ok: errors.length === 0, errors };
}
function trim(value: unknown, max: number): string | null { return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null; }
