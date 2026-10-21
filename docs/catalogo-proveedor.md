# Lista del proveedor → catálogo de TERC

Reglas que se usan cada vez que llega la lista de precios del proveedor.
Si una regla cambia (por ejemplo, el margen), se cambia aquí y vale desde la próxima lista.

## Productos a pedido

- Los productos de la lista **no son stock propio**: se guardan con `on_demand = true` y `stock = 0`.
- Se pueden comprar aunque el stock sea 0 (hasta 5 por compra) y no cuentan como plata invertida.
- En la tienda aparecen como "A pedido, sujeto a disponibilidad del proveedor".
- El plazo extra de despacho está en `src/lib/site.ts` (`onDemandLeadTime`).
- Cada producto guarda `supplier` (nombre del proveedor) y `supplier_sku` (su código en la lista).
  Ese par identifica al producto de un día para otro.

## Precio de venta

- **Pendiente:** el margen definitivo se decide en el hilo de contabilidad.
- **Mientras tanto (provisional):** precio con IVA = costo neto × 1,19 × 1,25,
  redondeado hacia arriba a la decena de mil menos 10 (ej: 187.340 → 189.990).
- `cost` se guarda siempre **neto** (sin IVA). Si la lista trae precios con IVA, se dividen por 1,19.
- Si el costo de un producto cambia, el precio se recalcula con la misma regla.
- `compare_price` (precio "antes") **no se llena solo**: solo si Raúl decide una oferta real.

## Productos que ya no están en la lista

- No se borran: se ocultan (`active = false`). Así los pedidos antiguos siguen intactos
  y, si el producto vuelve a la lista, se reactiva con el mismo enlace.
- Solo se ocultan productos del mismo proveedor y que sean a pedido. Nunca se tocan los
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
