-- Fotos extra de cada producto (la principal sigue en image_url).
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
alter table products add column if not exists images text[] not null default '{}';
grant select (images) on products to anon, authenticated;
