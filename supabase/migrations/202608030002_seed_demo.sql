insert into public.data_sources(id, name, source_type, official_url, license_name, license_url, commercial_use_allowed, attribution_required, share_alike_required, terms_last_verified_at, is_enabled, notes)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Open Food Facts', 'product', 'https://openfoodfacts.github.io/openfoodfacts-server/api/', 'ODbL / DbCL / CC BY-SA images', 'https://world.openfoodfacts.org/terms-of-use', true, true, true, '2026-08-03', true, 'Données produit et images. Cache backend, User-Agent dédié et limites de débit respectées.'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'OpenStreetMap', 'geographic', 'https://www.openstreetmap.org/copyright', 'Open Database License', 'https://opendatacommons.org/licenses/odbl/', true, true, true, '2026-08-03', true, 'Données géographiques. Aucun serveur public gratuit en production commerciale.')
on conflict (name) do nothing;

insert into public.products(id, barcode, name, generic_name, brand, display_quantity, normalized_quantity, unit, category, image_url, image_source_id, image_license, verification_status, synced_at, cache_expires_at)
values ('11111111-1111-4111-8111-111111111111', '3017620422003', 'Pâte à tartiner noisettes', 'Pâte à tartiner aux noisettes et au cacao', 'Nutella', 'Pot 400 g', 400, 'g', 'Épicerie sucrée', 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.633.400.jpg', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'CC BY-SA', 'verified', now(), now() + interval '7 days')
on conflict (barcode) do nothing;

insert into public.stores(id, name, normalized_name, address, postal_code, city, country_code, location, reliability_score, verified_at)
values
 ('21111111-1111-4111-8111-111111111111', 'Marché des Tamarins', 'marche des tamarins', '12 rue des Flamboyants', '97460', 'Saint-Paul', 'FR', extensions.st_point(55.269, -21.009)::extensions.geography, 92, now()),
 ('22222222-2222-4222-8222-222222222222', 'Supermarché Savanna', 'supermarche savanna', '8 avenue du Stade', '97460', 'Saint-Paul', 'FR', extensions.st_point(55.287, -20.998)::extensions.geography, 84, now()),
 ('23333333-3333-4333-8333-333333333333', 'Comptoir de l’Ouest', 'comptoir de l ouest', '5 chemin des Fleurs', '97420', 'Le Port', 'FR', extensions.st_point(55.298, -20.944)::extensions.geography, 76, now())
on conflict (id) do nothing;

insert into public.badges(code, name, description, icon, rule) values
 ('explorer', 'Éclaireur', 'Premier prix utile publié', '🧭', '{"validated_prices":1}'),
 ('reliable_eye', 'Œil fiable', 'Dix confirmations indépendantes', '✅', '{"confirmations":10}'),
 ('local_expert', 'Expert local', 'Cinquante contributions confirmées dans une zone', '🌋', '{"confirmed_local":50}')
on conflict (code) do nothing;

insert into public.legal_documents(document_type, version, locale, content_url, published_at, is_current) values
 ('terms', '1.0', 'fr-FR', 'https://example.invalid/legal/cgu-v1', now(), true),
 ('privacy', '1.0', 'fr-FR', 'https://example.invalid/legal/privacy-v1', now(), true)
on conflict (document_type, version, locale) do nothing;
