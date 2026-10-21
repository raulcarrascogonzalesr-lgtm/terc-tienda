-- Precio anterior de TERC cuando un equipo está en oferta.
alter table products add column if not exists compare_price integer check (compare_price >= 0);
grant select (compare_price) on products to anon, authenticated;
