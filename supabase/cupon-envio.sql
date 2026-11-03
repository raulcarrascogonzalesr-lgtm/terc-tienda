-- Cupones de envío gratis por 24 horas (03-11-2026).
-- Se crean desde el panel (Cupones > "Envío gratis 24 h"), uno distinto por persona: un solo uso,
-- sirven para cualquier equipo y dejan el envío en $0. Vencen exactamente 24 horas después de creados.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
alter table coupons drop constraint if exists coupons_kind_check;
alter table coupons add constraint coupons_kind_check check (kind in ('percent', 'amount', 'shipping'));
-- Vencimiento con hora (para los de 24 horas). Vacío = se usa expires_on, como antes.
alter table coupons add column if not exists expires_at timestamptz;
