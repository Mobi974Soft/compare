begin;
select plan(8);

select has_table('public', 'price_reports', 'price_reports existe');
select has_table('public', 'fraud_signals', 'fraud_signals existe');
select row_security_active('public', 'price_reports', 'RLS actif sur price_reports');
select row_security_active('public', 'profiles', 'RLS actif sur profiles');
select row_security_active('public', 'fraud_signals', 'RLS actif sur fraud_signals');
select has_function('public', 'nearby_stores', 'Recherche PostGIS disponible');
select col_is_pk('public', 'price_validations', 'id', 'Validation identifiée par UUID');
select has_index('public', 'stores', 'stores_location_gist', 'Index géographique présent');

select * from finish();
rollback;
