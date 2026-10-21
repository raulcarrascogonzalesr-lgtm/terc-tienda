-- Precio de un equipo nuevo equivalente, para mostrar cuánto ahorra el cliente.
alter table products add column if not exists list_price integer check (list_price >= 0);
-- La tienda pública lee el catálogo columna por columna (el costo queda oculto).
grant select (list_price) on products to anon, authenticated;
