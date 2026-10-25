-- Envío gratis en la Región Metropolitana (25-10-2026).
-- Cada equipo trae un monto fijo para el envío ("fondo de envío"), que la tienda suma al precio
-- que ve el cliente. En la RM el envío sale gratis; en regiones se descuenta ese monto de lo que
-- cotiza Shipit. El precio guardado de cada producto (y su margen en el panel) no cambia.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).

-- Monto por equipo. Se cambia desde el panel (Fondo de envío); 0 apaga el envío gratis.
insert into settings (key, value) values ('shipping_fund', '7000') on conflict (key) do nothing;

-- La tienda pública puede leer el estado de la tienda y el monto del fondo; el resto sigue privado.
drop policy if exists "Estado de la tienda" on settings;
create policy "Estado de la tienda" on settings for select using (key in ('store_open', 'shipping_fund'));
grant select (key, value) on settings to anon, authenticated;

-- En cada pedido: cuánto trajeron los equipos para el envío, lo que cotizó Shipit al pagar
-- y, si se corrige en el panel, lo que realmente se le pagó al courier.
alter table orders add column if not exists shipping_fund integer not null default 0 check (shipping_fund >= 0);
alter table orders add column if not exists shipping_quote integer check (shipping_quote >= 0);
alter table orders add column if not exists shipping_real integer check (shipping_real >= 0);
