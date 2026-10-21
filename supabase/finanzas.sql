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
