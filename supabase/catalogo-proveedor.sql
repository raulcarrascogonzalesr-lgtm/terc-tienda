-- Productos "a pedido": no son stock propio, se compran al proveedor cuando alguien los paga.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
alter table products add column if not exists on_demand boolean not null default false;
alter table products add column if not exists supplier text;
alter table products add column if not exists supplier_sku text;

-- Un código del proveedor corresponde a un solo producto, para actualizar la lista cada día.
create unique index if not exists products_supplier_sku_key on products (supplier, supplier_sku);

-- La tienda necesita saber si es a pedido; el proveedor y su código quedan privados.
grant select (on_demand) on products to anon, authenticated;
