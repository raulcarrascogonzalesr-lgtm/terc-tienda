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

- Foto: preferir la imagen oficial del fabricante (sitio o sala de prensa de Apple, Samsung,
  Lenovo, etc.), con fondo blanco y sin marcas de agua. Evitar fotos propias de otras tiendas.
- Se pone el enlace en `image_url` y luego, en Panel → Productos, se aprieta
  **"Guardar fotos en la tienda"**, que las copia al almacenamiento de TERC.
- La tienda muestra "Imagen referencial" en las fotos de productos a pedido.
- Descripción: 2 o 3 frases en español, con datos verificables del fabricante
  (pantalla, procesador, memoria, batería). Nada inventado.
