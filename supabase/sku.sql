-- Código SKU propio de TERC para cada producto, solo números (10001, 10002…), para ordenar el
-- catálogo y para que el cliente pueda nombrar el equipo al escribir. Lo pone la base de datos
-- sola al crear un producto, en orden, y no cambia nunca.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
create sequence if not exists product_sku_seq;
alter table products add column if not exists sku text;
alter table products alter column sku drop default;

-- Si quedaron códigos del formato anterior (TERC-00012), pasan a número (10012).
update products set sku = (10000 + substring(sku from 6)::int)::text where sku ~ '^TERC-\d+$';

-- Los productos que ya existen reciben su código por orden de creación.
with numbered as (
  select id, row_number() over (order by created_at, id) as n
  from products
  where sku is null
)
update products p
set sku = (n + coalesce((select max(sku::int) from products where sku ~ '^\d+$'), 10000))::text
from numbered
where p.id = numbered.id;

select setval('product_sku_seq', greatest(10000, coalesce((select max(sku::int) from products where sku ~ '^\d+$'), 10000)));

alter table products alter column sku set default nextval('product_sku_seq')::text;
alter table products alter column sku set not null;
create unique index if not exists products_sku_key on products (sku);

-- La ficha del producto lo muestra.
grant select (sku) on products to anon, authenticated;
