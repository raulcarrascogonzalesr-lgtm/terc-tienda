-- Correos automáticos de los pedidos.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
-- Guarda cuándo se envió cada correo, para no mandarlo dos veces
-- (Mercado Pago a veces avisa más de una vez el mismo pago).

alter table orders add column if not exists paid_email_at timestamptz;
alter table orders add column if not exists shipped_email_at timestamptz;
alter table orders add column if not exists delivered_email_at timestamptz;
