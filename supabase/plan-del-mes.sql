-- Plan del mes (panel): gastos de apertura y gastos pagados con la tarjeta del papá.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).

-- Gasto para abrir la tienda: no cuenta en los gastos del mes, se devuelve aparte.
alter table movements add column if not exists apertura boolean not null default false;

-- Quién pagó el gasto: 'tarjeta_papa' = la tarjeta de crédito del papá (Google Ads).
-- No sale de la caja de TERC; queda como deuda hasta registrar "devolucion_tarjeta".
alter table movements add column if not exists paid_with text;

-- Todo lo anotado antes de noviembre fue para partir (burbuja, abono de las cajas).
update movements set apertura = true
where date < '2026-11-01' and kind = 'egreso'
  and category in ('publicidad', 'envios', 'comisiones', 'garantia', 'herramientas', 'embalaje', 'otro_gasto');
