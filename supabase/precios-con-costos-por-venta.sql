-- 28-10-2026, pedido de Raúl: sumar al precio de cada equipo lo que cuesta embalarlo
-- (caja con logo, burbuja, cinta y cliché repartido, de Panel → Costos por venta), con IVA,
-- redondeado hacia arriba a $…990. Así el margen queda igual que antes de esos costos.
-- Las ofertas que ya terminaron (la tienda ya cobraba el precio de antes) parten de ese precio
-- y quedan sin oferta. Ejecutar UNA sola vez: si se repite, vuelve a sumar.
with extra as (
  select p.id, coalesce(sum(c.amount), 0) as neto
  from products p
  left join extra_costs c on c.active and (c.category is null or c.category = p.category)
  group by p.id
),
base as (
  select p.id, e.neto,
    p.compare_price is not null and p.offer_ends_at < (now() at time zone 'America/Santiago')::date as ended,
    case when p.compare_price is not null and p.offer_ends_at < (now() at time zone 'America/Santiago')::date
      then p.compare_price else p.price end as price
  from products p join extra e on e.id = p.id
  where e.neto > 0
)
update products p
set price = (ceil((b.price + round(b.neto * 1.19) - 990) / 1000.0) * 1000 + 990)::int,
    compare_price = case when b.ended then null else p.compare_price end,
    offer_ends_at = case when b.ended then null else p.offer_ends_at end,
    offer_name = case when b.ended then null else p.offer_name end
from base b
where p.id = b.id
returning p.sku, p.category, p.price;
