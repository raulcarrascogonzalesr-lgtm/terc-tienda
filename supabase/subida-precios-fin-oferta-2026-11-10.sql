-- Fin de la oferta "4 Días Terqui" (ejecutar el 10-11-2026 o después, NO antes), pedido de Raúl.
-- Los 5 equipos que estuvieron en oferta suben su precio normal, redondeado a …990 como lo ve el cliente,
-- y quedan sin oferta. El Elite 800 G9 vuelve a su precio normal de siempre ($589.990 cliente).
-- Precios guardados = precio cliente − $7.000 del fondo de envío (la tienda lo suma sola).
-- Si se repite no pasa nada: solo cambia un equipo si todavía tiene la oferta del 6 al 9-11.
--
--   equipo                 cliente antes → cliente nuevo
--   ProOne 440 G9           $492.990 → $499.990
--   OptiPlex 3000 Micro     $409.990 → $419.990
--   EliteBook 830 G7        $389.990 → $399.990
--   EliteDesk 800 G4        $289.990 → $299.990
--   ProDesk 600 G4          $189.990 → $199.990
--   Elite 800 G9            $589.990 → $589.990 (sin cambio, solo se quita la oferta)

with nuevo (slug, antes, ahora) as (
  values
    ('all-in-one-hp-proone-440-g9-23-8-i5-12500-16-gb-ssd-512-gb', 485990, 492990),
    ('mini-pc-dell-optiplex-3000-micro-i5-12a-gen-8-gb-ssd-256-gb', 402990, 412990),
    ('notebook-hp-elitebook-830-g7-i7-10510u-8-gb-ssd-256-gb', 382990, 392990),
    ('pc-hp-elitedesk-800-g4-sff-i7-8700-16-gb-1-tb', 282990, 292990),
    ('pc-hp-prodesk-600-g4-sff-i5-8500-8-gb-1-tb', 182990, 192990),
    ('pc-hp-elite-sff-800-g9-i5-12500-16-gb-ddr5-1-tb', 582990, 582990)
)
update products p
set price = n.ahora,
    compare_price = null,
    offer_ends_at = null,
    offer_name = null,
    offer_warranty_months = null,
    warranty_extra_price = null
from nuevo n
where p.slug = n.slug and p.compare_price = n.antes and p.offer_name = '4 Días Terqui';

-- Abajo deben aparecer 6 filas sin oferta. Si alguna sigue con oferta, avísale a Claude.
select slug, price + 7000 as precio_cliente, compare_price, offer_name
from products
where slug in (
  'all-in-one-hp-proone-440-g9-23-8-i5-12500-16-gb-ssd-512-gb','mini-pc-dell-optiplex-3000-micro-i5-12a-gen-8-gb-ssd-256-gb',
  'notebook-hp-elitebook-830-g7-i7-10510u-8-gb-ssd-256-gb','pc-hp-elitedesk-800-g4-sff-i7-8700-16-gb-1-tb',
  'pc-hp-prodesk-600-g4-sff-i5-8500-8-gb-1-tb','pc-hp-elite-sff-800-g9-i5-12500-16-gb-ddr5-1-tb'
)
order by slug;
