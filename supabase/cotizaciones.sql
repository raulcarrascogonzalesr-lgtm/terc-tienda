-- Solicitudes de "Empresas y cotizaciones" (compras por volumen, arriendo, otros pedidos).
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
-- Privada: sin políticas, solo la tienda (con la llave de servicio) guarda y el panel lee.
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  company text check (char_length(company) <= 120),
  email text not null check (char_length(email) <= 160),
  phone text check (char_length(phone) <= 40),
  kind text not null check (kind in ('volumen', 'arriendo', 'otro')),
  quantity integer check (quantity between 1 and 100000),
  message text not null check (char_length(message) between 5 and 2000),
  status text not null default 'nueva' check (status in ('nueva', 'respondida', 'cerrada'))
);
alter table quotes enable row level security;
