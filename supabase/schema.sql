-- Esquema de la base de datos de TERC.
-- Pegar en Supabase > SQL Editor y ejecutar una vez.

create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text not null,
  category text not null,
  grade text not null check (grade in ('A', 'B', 'C')),
  price integer not null check (price >= 0),          -- CLP
  cost integer,                                         -- costo del proveedor, CLP (privado)
  stock integer not null default 0 check (stock >= 0),
  battery_health integer check (battery_health between 0 and 100),
  warranty_months integer not null default 6,
  description text not null default '',
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'shipped', 'delivered', 'cancelled')),
  customer jsonb not null,
  items jsonb not null,
  shipping_zone text not null,
  shipping_cost integer not null,
  subtotal integer not null,
  total integer not null,
  payment_id text,
  tracking_code text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- Seguridad: el público solo puede LEER productos activos, sin ver el costo.
alter table products enable row level security;
alter table orders enable row level security;

drop policy if exists "Catalogo publico" on products;
create policy "Catalogo publico" on products for select using (active = true);

revoke select on products from anon, authenticated;
grant select (id, slug, name, brand, category, grade, price, stock, battery_health,
              warranty_months, description, image_url, active, created_at)
  on products to anon, authenticated;
-- Los pedidos no tienen política pública: solo el servidor (service role) los ve.

-- Marca un pedido como pagado y descuenta stock una sola vez.
create or replace function mark_order_paid(p_order_id uuid, p_payment_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  line jsonb;
begin
  update orders
     set status = 'paid', payment_id = p_payment_id, paid_at = now()
   where id = p_order_id and status in ('pending', 'failed');

  if not found then
    return; -- ya estaba pagado: no descontar dos veces
  end if;

  for line in select * from jsonb_array_elements((select items from orders where id = p_order_id))
  loop
    update products
       set stock = greatest(stock - (line->>'quantity')::int, 0)
     where id = (line->>'product_id')::uuid;
  end loop;
end;
$$;

revoke execute on function mark_order_paid(uuid, text) from public, anon, authenticated;

-- Carpeta pública para las fotos de productos (las sube el panel de administración).
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

-- Finanzas y campañas del panel de administración.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null default 'otro'
    check (channel in ('meta', 'google', 'mercadolibre', 'tiktok', 'otro')),
  code text unique not null,
  monthly_budget integer check (monthly_budget >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists movements (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  kind text not null check (kind in ('ingreso', 'egreso')),
  category text not null,
  amount integer not null check (amount > 0),
  description text not null default '',
  campaign_id uuid references campaigns (id) on delete set null,
  created_at timestamptz not null default now()
);

-- De qué anuncio llegó cada pedido.
alter table orders add column if not exists utm jsonb;

-- Solo el servidor (service role) lee y escribe estas tablas.
alter table campaigns enable row level security;
alter table movements enable row level security;
