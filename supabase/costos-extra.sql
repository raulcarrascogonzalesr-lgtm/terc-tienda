-- Costos extra de cada venta (caja con logo, relleno, cinta, sticker, comisión de pago…).
-- No son plata que sale ahora: son lo que se gasta en promedio por cada equipo que se vende,
-- para que el margen de cada producto en el panel sea el real.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
create table if not exists extra_costs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  category text, -- categoría de producto a la que aplica (vacío = a todos los productos)
  amount integer not null default 0 check (amount >= 0), -- pesos sin IVA por cada equipo vendido
  percent numeric(5,2) not null default 0 check (percent >= 0 and percent <= 50), -- % del precio con IVA
  note text not null default '', -- de dónde sale el número (cotización, proveedor, fecha)
  active boolean not null default true,
  created_at timestamptz not null default now()
);
-- Privada: sin políticas, solo el panel (con la llave de servicio) la lee y escribe.
alter table extra_costs enable row level security;
