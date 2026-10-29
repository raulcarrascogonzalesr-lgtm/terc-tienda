-- Correos de seguimiento después de la compra (cuidado del equipo, recomendar a un amigo)
-- y permiso para recibir novedades.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).

-- Permiso de cada cliente para recibir novedades y si pidió no recibir más correos.
-- Va por correo electrónico (no por pedido): un cliente con dos compras tiene una sola fila.
create table if not exists email_preferences (
  email text primary key check (email = lower(email)),
  marketing_consent_at timestamptz, -- cuándo marcó "quiero recibir consejos y novedades"
  marketing_consent_text text, -- el texto exacto que aceptó, como respaldo ante la ley
  unsubscribed_at timestamptz, -- cuándo pidió no recibir más correos (vacío = sí recibe)
  updated_at timestamptz not null default now()
);
-- Privada: sin políticas, solo el servidor (con la llave de servicio) la lee y escribe.
alter table email_preferences enable row level security;

-- Día en que el pedido quedó entregado: desde ahí corren los correos de seguimiento.
alter table orders add column if not exists delivered_at timestamptz;
update orders
   set delivered_at = delivered_email_at
 where status = 'delivered' and delivered_at is null and delivered_email_at is not null;

-- Cuándo se envió (o se decidió no enviar) cada correo de seguimiento, para no repetirlo.
alter table orders add column if not exists care_email_at timestamptz;
alter table orders add column if not exists referral_email_at timestamptz;
-- Cuándo se le dio el premio a quien recomendó, si el pedido usó un código de amigo.
alter table orders add column if not exists referral_reward_at timestamptz;

-- Cupones para cualquier equipo (sin equipo fijo): los códigos de amigo y sus premios.
alter table coupons alter column product_id drop not null;
-- Si el cupón es el código de amigo de un cliente, su correo (para darle el premio).
alter table coupons add column if not exists referrer_email text;
create unique index if not exists coupons_referrer_email_idx on coupons (referrer_email) where referrer_email is not null;
