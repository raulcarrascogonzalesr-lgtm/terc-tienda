-- Subida de precios normales (6-11-2026), pedido de Raúl. Precios redondeados a …990 como los ve el cliente.
-- Los precios guardados van SIN el fondo de envío de $7.000 (la tienda lo suma sola): guardado = cliente − 7.000.
-- No toca los 5 equipos de la oferta "4 Días Terqui": esos suben el 10-11 con otro archivo.
-- Ejecutar UNA vez en Supabase > SQL Editor. Si se repite no pasa nada: solo cambia un equipo
-- si todavía tiene el precio de antes.

with nuevo (slug, antes, ahora) as (
  values
    ('all-in-one-lenovo-v50a-24-i5-10a-gen-16-gb-1-tb', 445990, 452990),
    ('all-in-one-hp-proone-400-g6-i7-10700-16-gb-ssd-512-gb', 355990, 382990),
    ('pc-hp-prodesk-400-g4-sff-i7-6a-gen-16-gb-1-tb', 202990, 212990),
    ('notebook-dell-latitude-5400-i7-8a-gen-8-gb-ssd-256-gb-detalles', 322990, 332990),
    ('notebook-hp-probook-440-g8-i5-1135g7-16-gb-ssd-256-gb', 402990, 412990),
    ('pc-hp-prodesk-400-g7-sff-i5-10500-16-gb-ssd-512-gb', 352990, 382990),
    ('pc-hp-prodesk-400-g9-sff-i7-12a-gen-16-gb-512-gb', 532990, 592990),
    ('pc-hp-elitedesk-800-g6-sff-i3-10100-8-gb-1-tb', 182990, 212990),
    ('notebook-hp-elitebook-840-g8-i7-1165g7-16-gb-ssd-512-gb', 502990, 512990),
    ('pc-hp-prodesk-600-g6-sff-i5-10a-gen-8-gb-1-tb', 312990, 342990),
    ('notebook-lenovo-thinkpad-t460-i5-6300u-16-gb-ssd-512-gb-tactil', 272990, 282990)
)
update products p
set price = n.ahora
from nuevo n
where p.slug = n.slug and p.price = n.antes and p.compare_price is null;

-- Elite 800 G9: no sube. Entra a la oferta "4 Días Terqui" hasta el 9-11 a $519.990 (cliente),
-- 12% menos que su precio real de $589.990, con 6 meses de garantía y extensión a 1 año por $19.990.
update products
set compare_price = 582990,
    price = 512990,
    offer_ends_at = date '2026-11-09',
    offer_name = '4 Días Terqui',
    offer_warranty_months = 6,
    warranty_extra_price = 19990
where slug = 'pc-hp-elite-sff-800-g9-i5-12500-16-gb-ddr5-1-tb' and price = 582990;

-- Abajo deben aparecer 12 filas. Si aparecen menos, algún equipo ya tenía otro precio: avísale a Claude.
select slug, price + 7000 as precio_cliente, compare_price + 7000 as precio_antes_cliente, offer_name
from products
where slug in (
  'all-in-one-lenovo-v50a-24-i5-10a-gen-16-gb-1-tb','all-in-one-hp-proone-400-g6-i7-10700-16-gb-ssd-512-gb',
  'pc-hp-prodesk-400-g4-sff-i7-6a-gen-16-gb-1-tb','notebook-dell-latitude-5400-i7-8a-gen-8-gb-ssd-256-gb-detalles',
  'notebook-hp-probook-440-g8-i5-1135g7-16-gb-ssd-256-gb','pc-hp-prodesk-400-g7-sff-i5-10500-16-gb-ssd-512-gb',
  'pc-hp-prodesk-400-g9-sff-i7-12a-gen-16-gb-512-gb','pc-hp-elitedesk-800-g6-sff-i3-10100-8-gb-1-tb',
  'notebook-hp-elitebook-840-g8-i7-1165g7-16-gb-ssd-512-gb','pc-hp-prodesk-600-g6-sff-i5-10a-gen-8-gb-1-tb',
  'notebook-lenovo-thinkpad-t460-i5-6300u-16-gb-ssd-512-gb-tactil','pc-hp-elite-sff-800-g9-i5-12500-16-gb-ddr5-1-tb'
)
order by slug;
