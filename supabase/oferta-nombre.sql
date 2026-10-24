-- Nombre de la promoción (por ejemplo "3 Días Terqui"). La tienda lo muestra en el aviso de arriba,
-- en la sección de ofertas y en la ficha. Al terminar la oferta deja de mostrarse solo.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
alter table products add column if not exists offer_name text;
grant select (offer_name) on products to anon, authenticated;
