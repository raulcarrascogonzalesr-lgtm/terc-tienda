# Lista del proveedor → catálogo de TERC

Reglas que se usan cada vez que llega la lista de precios del proveedor.
Si una regla cambia (por ejemplo, el margen), se cambia aquí y vale desde la próxima lista.

## Productos del proveedor

- Los productos de la lista **no son stock propio**: se guardan con `on_demand = true`.
- `stock` = la cantidad disponible que trae la lista del proveedor (columna CANT).
  El cliente la ve como stock normal: **la tienda no muestra "a pedido"** (decisión de Raúl,
  porque da menos confianza). Si CANT es 0, el producto deja de aparecer solo.
- Cada venta descuenta del stock, igual que un equipo propio; la lista del día siguiente
  lo vuelve a dejar en la cantidad real del proveedor.
- Para el panel siguen siendo "del proveedor": no cuentan como plata invertida.
- La ficha sí informa el plazo de despacho (`onDemandLeadTime` en `src/lib/site.ts`) y
  "Imagen referencial" en las fotos, porque la Ley del Consumidor exige informarlos bien.
- Cada producto guarda `supplier` (nombre del proveedor) y `supplier_sku` (su código en la lista).
  Ese par identifica al producto de un día para otro.

## Precio de venta

1. **Precio de la competencia:** buscar el mismo modelo (misma capacidad y estado) en Chile:
   Knasta, Mercado Libre y tiendas de reacondicionados. Tomar como referencia el precio
   más bajo de las tiendas serias (con boleta y garantía), no el de avisos dudosos.
2. **Precio TERC:** por ahora se parte **entre $10.000 y $20.000 sobre** ese precio competitivo
   (decisión de Raúl: empezar un poco alto y bajar si se vende lento). Redondear a $…990.
3. **Margen mínimo:** el precio nunca puede dejar menos ganancia que la regla provisional
   (costo neto × 1,19 × 1,25). Si la competencia está por debajo de eso, se usa el margen mínimo
   y se avisa a Raúl en el resumen. El margen definitivo se decide en el hilo de contabilidad.
4. Si no hay referencias de la competencia, se usa la regla provisional y se marca "sin referencia".

- `cost` se guarda siempre **neto** (sin IVA). Si la lista trae precios con IVA, se dividen por 1,19.
- Si el costo de un producto cambia, el precio se recalcula con estas mismas reglas.
- `compare_price` (precio "antes") **no se llena solo**: solo si Raúl decide una oferta real
  (ver "Ofertas por tiempo limitado").

### Ganancia por producto (va en el resumen para Raúl)

Para cada producto, una fila con:

- precio con IVA, precio neto (precio ÷ 1,19) e IVA a pagar (precio − neto);
- costo neto y **ganancia neta** (neto − costo) con su % sobre el neto;
- el precio de la competencia que se usó y dónde.

No se calcula un total de "si vendiera todo": son productos a pedido, así que ese número no es real.

## Ofertas por tiempo limitado

Las ofertas tienen que ser **reales**: la ley del consumidor (SERNAC) castiga un "antes" inventado
o un "tiempo limitado" que nunca termina. Como el precio parte un poco alto, una oferta real es bajarlo
por unos días:

- `compare_price` = el precio que **estaba publicado** en la tienda (el de antes).
- `price` = el precio rebajado.
- `offer_ends_at` = el último día de la oferta (fecha, hora de Chile).

La tienda muestra entonces el sello grande con el % de descuento, "Oferta irresistible",
"Solo por tiempo limitado" y la cuenta regresiva. Al pasar ese día, la tienda vuelve **sola** al precio
de antes (también al pagar). Después, al cargar la lista siguiente, deja `price` en el precio normal
y `compare_price` y `offer_ends_at` vacíos.

Las ofertas solo las decide Raúl: nunca se ponen solas al cargar la lista.

## Productos que ya no están en la lista

- No se borran: se ocultan (`active = false`). Así los pedidos antiguos siguen intactos
  y, si el producto vuelve a la lista, se reactiva con el mismo enlace.
- Solo se ocultan productos del mismo proveedor (`on_demand = true`). Nunca se tocan los
  equipos con stock propio.

## Fotos y descripciones

- Cada producto lleva **varias fotos** (ideal 3 o 4): frente, espalda o tapa, lateral y, si hay,
  una del equipo en uso. La principal va en `image_url` y el resto en `images` (hasta 8).
- La tienda agrega sola, al final, una tarjeta con la garantía TERC; no hay que subirla.
- Las fotos tienen que parecerse lo más posible al equipo real: mismo modelo, mismo color
  y misma capacidad cuando cambia el aspecto.
- Que no se vean tan genéricas: además del render de frente, preferir vistas en ángulo,
  de detalle (teclado, puertos, cámaras) o del equipo en uso, siempre del mismo modelo.
- Para saber qué fotos usar, mirar cómo muestran ese modelo las tiendas de reacondicionados
  (Back Market, Reuse, Macnificos, etc.) y elegir el mismo tipo de imagen desde la fuente
  oficial del fabricante (sitio, sala de prensa o ficha técnica), con fondo blanco y sin
  marcas de agua. No copiar las fotos que esas tiendas sacaron ellas mismas.
- Se ponen los enlaces y luego, en Panel → Productos, se aprieta
  **"Guardar fotos en la tienda"**, que las copia al almacenamiento de TERC (15 productos por clic).
- La tienda muestra "Imagen referencial" en las fotos de productos a pedido.
- Descripción: 2 o 3 frases en español, con datos verificables del fabricante
  (pantalla, procesador, memoria, batería). Nada inventado.

## Peso y medidas para el envío

- Cada producto lleva el peso y las medidas del **paquete ya armado**, no del equipo solo:
  `ship_weight_kg` (kg, un decimal), `ship_length_cm`, `ship_width_cm` y `ship_height_cm` (cm, enteros).
  Shipit cotiza el envío con esos datos.
- Criterio: peso real del equipo según la ficha del fabricante (con base, si la trae) + cargador y cables
  + caja y plumavit justos (0,3 a 0,9 kg). Caja = medidas del equipo + unos 4 cm (2 cm de plumavit por lado).
  No exagerar: los couriers cobran por el peso real o por el volumen (largo × ancho × alto / 4000),
  el que sea mayor, así que una caja grande encarece el envío aunque pese poco.
- Rangos de referencia (lo que se cargó en `supabase/envio-medidas-ajuste.sql`):

  | Categoría | Peso | Caja (cm) |
  |---|---|---|
  | Celulares | 0,4 kg | 18 × 11 × 6 |
  | Tablets | 0,9 kg | 29 × 21 × 5 |
  | Notebooks 13–14" | 1,9 a 2,5 kg | 35–38 × 25–28 × 7 |
  | Monitores 17–23" | 3,2 a 7,0 kg | 44–60 × 35–42 × 10–16 |
  | Mini PC (Micro, Tiny) | 1,9 kg | 25 × 22 × 10 |
  | PC de escritorio SFF | 5,0 a 6,0 kg | 35 × 31 × 14 |
  | All-in-One 22–24" | 7,3 a 9,0 kg | 60 × 45 × 18 |

- Si se dejan vacías, la tienda usa una estimación por categoría (`boxFor` en
  `src/lib/shipping.ts`), pero es menos precisa: siempre llenarlas.
