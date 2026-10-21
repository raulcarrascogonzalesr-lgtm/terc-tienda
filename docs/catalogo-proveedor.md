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
- `compare_price` (precio "antes") **no se llena solo**: solo si Raúl decide una oferta real.

### Ganancia por producto (va en el resumen para Raúl)

Para cada producto, una fila con:

- precio con IVA, precio neto (precio ÷ 1,19) e IVA a pagar (precio − neto);
- costo neto y **ganancia neta** (neto − costo) con su % sobre el neto;
- el precio de la competencia que se usó y dónde.

No se calcula un total de "si vendiera todo": son productos a pedido, así que ese número no es real.

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
