-- Código SKU propio de TERC para cada producto (TERC-00001, TERC-00002…), para ordenar el
-- catálogo y para que el cliente pueda nombrar el equipo al escribir. Lo pone la base de datos
-- sola al crear un producto, en orden, y no cambia nunca.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
create sequence if not exists product_sku_seq;
alter table products add column if not exists sku text;

-- Los productos que ya existen reciben su código por orden de creación.
with numbered as (
  select id, row_number() over (order by created_at, id) as n
  from products
  where sku is null
)
update products p
set sku = 'TERC-' || lpad((n + coalesce((select max(substring(sku from 6)::int) from products where sku ~ '^TERC-\d+$'), 0))::text, 5, '0')
from numbered
where p.id = numbered.id;

select setval('product_sku_seq', greatest(1, coalesce((select max(substring(sku from 6)::int) from products where sku ~ '^TERC-\d+$'), 0)), (select count(*) > 0 from products where sku ~ '^TERC-\d+$'));

alter table products alter column sku set default ('TERC-' || lpad(nextval('product_sku_seq')::text, 5, '0'));
alter table products alter column sku set not null;
create unique index if not exists products_sku_key on products (sku);

-- La ficha del producto lo muestra.
grant select (sku) on products to anon, authenticated;
