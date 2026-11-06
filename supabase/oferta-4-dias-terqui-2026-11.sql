-- Oferta "4 Días Terqui" (6 al 9 de noviembre de 2026), pedido de Raúl.
-- Prueba sin publicidad: los equipos con más unidades en el proveedor bajan hasta dejar
-- ~$30.000 de ganancia real por equipo (después de IVA, costo, embalaje y comisión de pago).
-- El precio de antes queda tachado, la tienda muestra el aviso de arriba, la sección de ofertas,
-- la cuenta regresiva en la ficha y el descuento en Google. El 10-11 vuelve sola al precio de antes.
--
-- Precios guardados (sin el fondo de envío de $7.000, que la tienda suma sola):
--   equipo                     antes    oferta    el cliente ve
--   ProDesk 600 G4            182.990 → 145.990   $189.990 → $152.990
--   EliteDesk 800 G4          282.990 → 249.990   $289.990 → $256.990
--   OptiPlex 3000 Micro       402.990 → 354.990   $409.990 → $361.990
--   EliteBook 830 G7          382.990 → 354.990   $389.990 → $361.990
--   ProOne 440 G9             485.990 → 462.990   $492.990 → $469.990
--
-- Garantía de la oferta: estos equipos traen 6 meses mientras dure la oferta. En el carrito el cliente
-- puede extenderla a 1 año (la garantía normal) por $19.990, pago único. Al terminar la oferta vuelven
-- solos a 1 año. Lo que pagó cada cliente y su garantía quedan escritos en el pedido y en su correo.
--
-- Ejecutar UNA vez en Supabase > SQL Editor. Si se repite no pasa nada: solo cambia un equipo
-- si todavía tiene el precio de antes.
-- Columnas nuevas (la tienda funciona igual si todavía no existen).
alter table products add column if not exists offer_warranty_months integer check (offer_warranty_months > 0);
alter table products add column if not exists warranty_extra_price integer check (warranty_extra_price >= 0);
grant select (offer_warranty_months, warranty_extra_price) on products to anon, authenticated;

-- EliteBook 840 G7 de 16 GB: el proveedor ya no tiene (lista del 6-11-2026) y seguía a la venta.
-- Se oculta de la tienda para que nadie pague uno que no se puede comprar.
-- Para volver a mostrarlo: misma línea con active = true.
update products
set active = false
where slug = 'notebook-hp-elitebook-840-g7-i5-10210u-16-gb-ssd-256-gb'
returning sku, name, active;

with oferta (slug, antes, ahora) as (
  values
    ('pc-hp-prodesk-600-g4-sff-i5-8500-8-gb-1-tb', 182990, 145990),
    ('pc-hp-elitedesk-800-g4-sff-i7-8700-16-gb-1-tb', 282990, 249990),
    ('mini-pc-dell-optiplex-3000-micro-i5-12a-gen-8-gb-ssd-256-gb', 402990, 354990),
    ('notebook-hp-elitebook-830-g7-i7-10510u-8-gb-ssd-256-gb', 382990, 354990),
    ('all-in-one-hp-proone-440-g9-23-8-i5-12500-16-gb-ssd-512-gb', 485990, 462990)
)
update products p
set compare_price = o.antes,
    price = o.ahora,
    offer_ends_at = date '2026-11-09',
    offer_name = '4 Días Terqui',
    offer_warranty_months = 6,
    warranty_extra_price = 19990
from oferta o
where p.slug = o.slug and p.price = o.antes
returning p.sku, p.name, p.compare_price as precio_antes, p.price as precio_oferta, p.offer_ends_at, p.offer_warranty_months as garantia_oferta, p.warranty_extra_price as extender_garantia;

-- Abajo deben aparecer 5 filas (Supabase muestra solo el resultado de esta última parte). Si muestra menos, algún equipo ya no tenía el precio de antes:
-- avísale a Claude antes de cambiar nada a mano.
