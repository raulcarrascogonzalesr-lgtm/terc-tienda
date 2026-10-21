-- Precio de un equipo nuevo equivalente, para mostrar cuánto ahorra el cliente.
alter table products add column if not exists list_price integer check (list_price >= 0);
