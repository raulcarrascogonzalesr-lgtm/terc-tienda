-- Cupones de descuento: cada cupón es para un equipo y por defecto se usa una sola vez.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
create table if not exists coupons (
  code text primary key check (code ~ '^[A-Z0-9-]{3,30}$'), -- siempre en mayúsculas
  product_id uuid not null references products (id) on delete cascade,
  kind text not null default 'percent' check (kind in ('percent', 'amount')),
  value integer not null check (value > 0), -- % (1 a 90) o pesos con IVA
  max_uses integer not null default 1 check (max_uses >= 1),
  expires_on date, -- último día en que sirve (hora de Chile); vacío = no vence
  note text not null default '', -- para quién es, por ejemplo "Primer cliente WhatsApp 24-oct"
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (kind <> 'percent' or value <= 90)
);
-- Privada: sin políticas, solo el servidor (con la llave de servicio) la lee y escribe.
alter table coupons enable row level security;

-- Cupón usado en cada pedido y cuánto se descontó (en pesos, con IVA).
alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists discount integer not null default 0 check (discount >= 0);
create index if not exists orders_coupon_code_idx on orders (coupon_code) where coupon_code is not null;
