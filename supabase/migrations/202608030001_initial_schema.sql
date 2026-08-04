begin;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists postgis with schema extensions;

create type public.price_type as enum ('regular', 'promotion');
create type public.availability_status as enum ('available', 'low_stock', 'unavailable');
create type public.validation_type as enum ('confirmed', 'price_changed', 'not_available', 'wrong_product', 'wrong_store', 'suspected_abuse');
create type public.moderation_status as enum ('pending', 'approved', 'rejected', 'hidden', 'quarantined');
create type public.score_status as enum ('provisional', 'validated', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  alias text not null unique check (char_length(alias) between 3 and 30),
  alias_normalized text not null unique,
  public_reputation_label text not null default 'Nouveau contributeur',
  is_leaderboard_visible boolean not null default true,
  role text not null default 'user' check (role in ('user','moderator','admin')),
  account_status text not null default 'active' check (account_status in ('active','restricted','suspended','deleted')),
  alias_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  locale text not null default 'fr-FR',
  country_code char(2) not null default 'FR',
  location_enabled boolean not null default false,
  analytics_consent boolean not null default false,
  privacy_version text,
  updated_at timestamptz not null default now()
);

create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  source_type text not null,
  official_url text not null,
  license_name text not null,
  license_url text not null,
  commercial_use_allowed boolean not null,
  attribution_required boolean not null,
  share_alike_required boolean not null,
  terms_last_verified_at date not null,
  is_enabled boolean not null default false,
  notes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_enabled or (official_url <> '' and license_name <> '' and license_url <> '' and terms_last_verified_at is not null))
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  barcode text not null unique check (barcode ~ '^[0-9]{8,14}$'),
  name text not null,
  generic_name text,
  brand text,
  display_quantity text,
  normalized_quantity numeric(12,3) check (normalized_quantity > 0),
  unit text check (unit in ('g','kg','ml','l','unit')),
  category text,
  image_url text,
  image_source_id uuid references public.data_sources(id),
  image_license text,
  verification_status text not null default 'provisional' check (verification_status in ('verified','provisional','disabled')),
  synced_at timestamptz,
  cache_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.product_sources (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  source_id uuid not null references public.data_sources(id),
  external_id text not null,
  source_payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  unique(product_id, source_id)
);

create table public.product_corrections (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  author_id uuid not null references public.profiles(id),
  proposed_changes jsonb not null,
  reason text not null check (char_length(reason) between 5 and 500),
  status public.moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  brand text,
  address text not null,
  postal_code text not null,
  city text not null,
  country_code char(2) not null default 'FR',
  location geography(point, 4326) not null,
  external_id text,
  is_active boolean not null default true,
  verified_at timestamptz,
  contributions_count integer not null default 0 check (contributions_count >= 0),
  reliability_score smallint not null default 50 check (reliability_score between 0 and 100),
  claimed_status text not null default 'unclaimed' check (claimed_status in ('unclaimed','pending','verified','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index stores_location_gist on public.stores using gist(location);
create index stores_search_idx on public.stores(normalized_name, postal_code, city);

create table public.store_sources (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  source_id uuid not null references public.data_sources(id),
  external_id text not null,
  synced_at timestamptz not null default now(),
  unique(store_id, source_id)
);

create table public.store_suggestions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  name text not null,
  address text not null,
  category text not null,
  location geography(point, 4326) not null,
  duplicate_candidates uuid[] not null default '{}',
  risk_score smallint not null default 0 check (risk_score between 0 and 100),
  status public.moderation_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index store_suggestions_location_gist on public.store_suggestions using gist(location);

create table public.price_reports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  store_id uuid not null references public.stores(id),
  author_id uuid not null references public.profiles(id),
  price numeric(12,2) not null check (price > 0 and price <= 10000),
  currency char(3) not null default 'EUR' check (currency = 'EUR'),
  price_type public.price_type not null default 'regular',
  normalized_unit_price numeric(12,4) check (normalized_unit_price > 0),
  loyalty_only boolean not null default false,
  conditions text check (char_length(conditions) <= 160),
  observed_at timestamptz not null check (observed_at <= now() + interval '5 minutes'),
  availability public.availability_status not null default 'available',
  comment text check (char_length(comment) <= 280),
  trust_score smallint not null default 35 check (trust_score between 0 and 100),
  risk_score smallint not null default 0 check (risk_score between 0 and 100),
  status public.moderation_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index price_reports_product_recent_idx on public.price_reports(product_id, observed_at desc) where deleted_at is null;
create index price_reports_store_product_idx on public.price_reports(store_id, product_id, observed_at desc) where deleted_at is null;
create index price_reports_author_recent_idx on public.price_reports(author_id, created_at desc);

create table public.price_validations (
  id uuid primary key default gen_random_uuid(),
  price_report_id uuid not null references public.price_reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  validation_type public.validation_type not null,
  new_price numeric(12,2) check (new_price > 0),
  comment text check (char_length(comment) <= 280),
  store_id uuid not null references public.stores(id),
  geo_consistency smallint not null default 0 check (geo_consistency between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(price_report_id, user_id)
);

create table public.price_comments (
  id uuid primary key default gen_random_uuid(),
  price_report_id uuid not null references public.price_reports(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  text text not null check (char_length(text) between 2 and 280),
  status public.moderation_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.comment_votes (
  comment_id uuid not null references public.price_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  is_helpful boolean not null,
  created_at timestamptz not null default now(),
  primary key(comment_id, user_id)
);

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  target_type text not null check (target_type in ('price','comment','profile','store')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 500),
  status public.moderation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.contributor_scores (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  provisional_points integer not null default 0,
  validated_points integer not null default 0,
  reliability_score smallint not null default 50 check (reliability_score between 0 and 100),
  level smallint not null default 1 check (level > 0),
  contributions_count integer not null default 0,
  confirmed_count integer not null default 0,
  corrected_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.score_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  event_type text not null,
  points integer not null,
  status public.score_status not null default 'provisional',
  reference_type text not null,
  reference_id uuid not null,
  reason text not null,
  created_at timestamptz not null default now(),
  validated_at timestamptz,
  unique(user_id, event_type, reference_id)
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  icon text not null,
  rule jsonb not null,
  is_active boolean not null default true
);

create table public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id),
  granted_at timestamptz not null default now(),
  primary key(user_id, badge_id)
);

create table public.leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  period text not null check (period in ('weekly','monthly','global')),
  area_type text not null check (area_type in ('global','city','department','region','store')),
  area_code text not null,
  user_id uuid not null references public.profiles(id),
  rank integer not null check (rank > 0),
  points integer not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  minimum_population_met boolean not null default false,
  unique(period, area_type, area_code, user_id, starts_at)
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references public.profiles(id),
  target_type text not null,
  target_id uuid not null,
  action text not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.user_sanctions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  moderator_id uuid not null references public.profiles(id),
  sanction_type text not null check (sanction_type in ('warning','restricted','suspended','banned')),
  reason text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  appealed_at timestamptz,
  appeal_status text
);

create table public.fraud_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  signal_type text not null,
  risk smallint not null check (risk between 0 and 100),
  evidence jsonb not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  document_type text not null,
  version text not null,
  locale text not null,
  content_url text not null,
  published_at timestamptz not null,
  is_current boolean not null default false,
  unique(document_type, version, locale)
);

create table public.legal_acceptances (
  user_id uuid not null references public.profiles(id) on delete cascade,
  legal_document_id uuid not null references public.legal_documents(id),
  accepted_at timestamptz not null default now(),
  primary key(user_id, legal_document_id)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notification_preferences (
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key(user_id, notification_type)
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  platform text not null check (platform in ('ios','android')),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('moderator','admin') and account_status = 'active');
$$;

create or replace function public.nearby_stores(lat double precision, lng double precision, radius_meters integer default 10000)
returns table(id uuid, name text, address text, city text, postal_code text, latitude double precision, longitude double precision, distance_km double precision, reliability smallint)
language sql stable set search_path = '' as $$
  select s.id, s.name, s.address, s.city, s.postal_code, extensions.st_y(s.location::geometry), extensions.st_x(s.location::geometry), round((extensions.st_distance(s.location, extensions.st_point(lng, lat)::extensions.geography) / 1000)::numeric, 1)::double precision, s.reliability_score
  from public.stores s
  where s.is_active and s.deleted_at is null and extensions.st_dwithin(s.location, extensions.st_point(lng, lat)::extensions.geography, least(radius_meters, 50000))
  order by s.location operator(extensions.<->) extensions.st_point(lng, lat)::extensions.geography limit 100;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare chosen_alias text;
begin
  chosen_alias := coalesce(nullif(new.raw_user_meta_data->>'alias',''), 'membre_' || left(new.id::text, 8));
  insert into public.profiles(id, alias, alias_normalized) values(new.id, chosen_alias, lower(chosen_alias));
  insert into public.user_settings(user_id) values(new.id);
  insert into public.contributor_scores(user_id) values(new.id);
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.prevent_sensitive_score_update()
returns trigger language plpgsql as $$
begin
  if auth.role() <> 'service_role' and not public.is_staff() then raise exception 'score fields are server-managed'; end if;
  return new;
end; $$;
create trigger protect_contributor_scores before update or delete on public.contributor_scores for each row execute procedure public.prevent_sensitive_score_update();

create or replace view public.public_price_reports with (security_invoker = true) as
select pr.id, pr.product_id, pr.store_id, pr.price, pr.currency, pr.price_type, pr.normalized_unit_price, pr.loyalty_only, pr.conditions, pr.observed_at, pr.availability, pr.trust_score,
  jsonb_build_object('id', s.id, 'name', s.name, 'address', s.address, 'city', s.city, 'postalCode', s.postal_code, 'reliability', s.reliability_score) as store,
  p.alias as author_alias,
  (select count(*) from public.price_validations v where v.price_report_id = pr.id and v.validation_type = 'confirmed') as confirmations,
  (select count(*) from public.price_validations v where v.price_report_id = pr.id and v.validation_type <> 'confirmed') as disputes
from public.price_reports pr join public.stores s on s.id = pr.store_id join public.profiles p on p.id = pr.author_id
where pr.status = 'approved' and pr.deleted_at is null;

grant usage on schema public to anon, authenticated;
grant select on public.products, public.product_sources, public.stores, public.store_sources, public.price_reports, public.price_validations, public.price_comments, public.contributor_scores, public.badges, public.user_badges, public.leaderboard_snapshots, public.data_sources, public.legal_documents, public.public_price_reports to anon, authenticated;
grant insert, update on public.profiles, public.user_settings, public.product_corrections, public.store_suggestions, public.price_reports, public.price_validations, public.price_comments, public.comment_votes, public.content_reports, public.notification_preferences, public.push_tokens, public.legal_acceptances to authenticated;
grant execute on function public.nearby_stores to anon, authenticated;

do $$ declare t text; begin
  foreach t in array array['profiles','user_settings','data_sources','products','product_sources','product_corrections','stores','store_sources','store_suggestions','price_reports','price_validations','price_comments','comment_votes','content_reports','contributor_scores','score_events','badges','user_badges','leaderboard_snapshots','moderation_actions','user_sanctions','fraud_signals','legal_documents','legal_acceptances','audit_logs','notification_preferences','push_tokens'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;
end $$;

create policy "public read active products" on public.products for select using (verification_status <> 'disabled' and deleted_at is null);
create policy "public read product sources" on public.product_sources for select using (exists(select 1 from public.products p where p.id = product_id and p.deleted_at is null));
create policy "public read active stores" on public.stores for select using (is_active and deleted_at is null);
create policy "public read store sources" on public.store_sources for select using (true);
create policy "public read approved prices" on public.price_reports for select using (status = 'approved' and deleted_at is null);
create policy "public read price validations" on public.price_validations for select using (true);
create policy "public read approved comments" on public.price_comments for select using (status = 'approved' and deleted_at is null);
create policy "public read safe profiles" on public.profiles for select using (deleted_at is null);
create policy "public read contributor scores" on public.contributor_scores for select using (true);
create policy "public read badges" on public.badges for select using (is_active);
create policy "public read user badges" on public.user_badges for select using (true);
create policy "public read privacy-safe leaderboards" on public.leaderboard_snapshots for select using (minimum_population_met and exists(select 1 from public.profiles p where p.id = user_id and p.is_leaderboard_visible));
create policy "public read enabled sources" on public.data_sources for select using (is_enabled or public.is_staff());
create policy "public read current legal docs" on public.legal_documents for select using (is_current or public.is_staff());

create policy "users manage own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = 'user');
create policy "users read own settings" on public.user_settings for select to authenticated using (user_id = auth.uid());
create policy "users update own settings" on public.user_settings for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users submit corrections" on public.product_corrections for insert to authenticated with check (author_id = auth.uid());
create policy "users read own corrections" on public.product_corrections for select to authenticated using (author_id = auth.uid() or public.is_staff());
create policy "users suggest stores" on public.store_suggestions for insert to authenticated with check (author_id = auth.uid());
create policy "users read own store suggestions" on public.store_suggestions for select to authenticated using (author_id = auth.uid() or public.is_staff());
create policy "users insert own prices" on public.price_reports for insert to authenticated with check (author_id = auth.uid() and observed_at > now() - interval '14 days');
create policy "users update fresh unvalidated prices" on public.price_reports for update to authenticated using (author_id = auth.uid() and created_at > now() - interval '15 minutes' and not exists(select 1 from public.price_validations v where v.price_report_id = id)) with check (author_id = auth.uid());
create policy "users validate as independent party" on public.price_validations for insert to authenticated with check (user_id = auth.uid() and not exists(select 1 from public.price_reports pr where pr.id = price_report_id and pr.author_id = auth.uid()));
create policy "users update own validation" on public.price_validations for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users add comments" on public.price_comments for insert to authenticated with check (author_id = auth.uid());
create policy "users edit own comments" on public.price_comments for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "users vote once" on public.comment_votes for insert to authenticated with check (user_id = auth.uid());
create policy "users update own vote" on public.comment_votes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users report content" on public.content_reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "users see own reports" on public.content_reports for select to authenticated using (reporter_id = auth.uid() or public.is_staff());
create policy "users read own score events" on public.score_events for select to authenticated using (user_id = auth.uid());
create policy "users accept legal docs" on public.legal_acceptances for insert to authenticated with check (user_id = auth.uid());
create policy "users read own acceptances" on public.legal_acceptances for select to authenticated using (user_id = auth.uid());
create policy "users manage notification preferences" on public.notification_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own push tokens" on public.push_tokens for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "staff manage product corrections" on public.product_corrections for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff manage store suggestions" on public.store_suggestions for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff manage reports" on public.content_reports for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff manage moderation actions" on public.moderation_actions for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff manage sanctions" on public.user_sanctions for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff read fraud signals" on public.fraud_signals for select to authenticated using (public.is_staff());
create policy "staff read audit logs" on public.audit_logs for select to authenticated using (public.is_staff());
create policy "staff manage sources" on public.data_sources for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff manage legal docs" on public.legal_documents for all to authenticated using (public.is_staff()) with check (public.is_staff());

commit;
