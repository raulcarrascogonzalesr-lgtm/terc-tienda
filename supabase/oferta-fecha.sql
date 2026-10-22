-- Último día de una oferta (hora de Chile). Al pasar, la tienda vuelve sola al precio de antes.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
alter table products add column if not exists offer_ends_at date;
grant select (offer_ends_at) on products to anon, authenticated;
