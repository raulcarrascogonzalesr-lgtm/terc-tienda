# TERC · Tienda web

Tienda online de TERC (Tecnología y Equipos Reacondicionados Chile), hecha con:

- **Next.js**: las páginas de la tienda (catálogo, ficha de producto, carrito).
- **Supabase**: base de datos de productos y pedidos.
- **Mercado Pago (Checkout Pro)**: cobros con tarjeta de crédito y débito.

## Qué hace hoy (Etapa 1, en construcción)

- Catálogo con grado (A/B/C), salud de batería y garantía por equipo.
- Carrito guardado en el navegador.
- Formulario de envío con tarifa fija por zona (RM / regiones), en `src/lib/shipping.ts`.
- Pago con Mercado Pago. El precio siempre se calcula en el servidor.
- Aviso de Mercado Pago (webhook) que marca el pedido como pagado y descuenta stock una sola vez.

Sin configurar nada, la tienda muestra productos de ejemplo (`src/lib/sample-products.ts`) y el botón de pago avisa que faltan las credenciales.

## Cómo correrla en tu computador

1. Instala [Node.js](https://nodejs.org) versión 20 o más nueva.
2. En esta carpeta, ejecuta:

   ```bash
   npm install
   cp .env.example .env.local   # luego completa los valores
   npm run dev
   ```

3. Abre http://localhost:3000.

## Conectar Supabase

1. Crea un proyecto gratis en https://supabase.com.
2. En **SQL Editor**, pega y ejecuta el contenido de `supabase/schema.sql`.
3. En **Project Settings > API**, copia la URL, la clave `anon` y la clave `service_role` en `.env.local`.
4. Carga productos desde **Table Editor > products**.

La clave `service_role` es secreta: nunca la pongas en el código ni la compartas.

## Panel de administración (`/admin`)

En `terc.cl/admin` se ven los pedidos (con cambio de estado y código de seguimiento) y se crean o editan productos, con costo, margen y foto.

Para activarlo, una sola vez:

1. Ejecuta `supabase/schema.sql` de nuevo (crea la carpeta `productos` para las fotos; lo demás no se duplica).
2. En Supabase > **Authentication > Users > Add user**, crea tu usuario con correo y contraseña (marca "Auto Confirm User").
3. Agrega la variable `ADMIN_EMAILS` con ese correo. Si son varios, sepáralos con coma.

El panel también tiene:

- **Caja**: entradas y salidas de plata (préstamo, compras al proveedor, publicidad, envíos…) y cuánto falta por devolver del préstamo.
- **¿Gané o perdí?**: resultado mes a mes (ventas − costo de los equipos − gastos).
- **Campañas**: gasto, ventas y costo por venta de cada anuncio. Cada campaña entrega un enlace con `utm_campaign`, y la tienda guarda en el pedido de qué campaña llegó el cliente.
- **Liquidación**: resumen mensual para imprimir o descargar en CSV y cuadrar con la contabilidad de Wiremax.

Estas secciones necesitan las tablas de `supabase/finanzas.sql` (también incluidas en `schema.sql`).

Solo los correos de `ADMIN_EMAILS` pueden entrar. Marcar un pedido como "Pagado" a mano (por ejemplo, una transferencia) también descuenta el stock.

## Correos automáticos

La tienda envía estos correos desde `contacto@terc.cl` (la casilla del hosting, por SMTP):

- **Al cliente, cuando se confirma el pago:** "Recibimos tu pago", con el detalle del pedido.
- **Al cliente, cuando el pedido pasa a "Enviado" con código de seguimiento:** "Tu pedido va en camino".
- **Al cliente, cuando el pedido pasa a "Entregado":** "¡Llegó tu pedido! ¿Cómo te fue?", con botones que abren WhatsApp.

Cada correo trae a Terqui animado (GIF en `public/correo/`), en una pose distinta según el correo y el pedido.
- **A TERC:** aviso de cada venta nueva y de cada solicitud de cotización (respondiendo el correo se le escribe al cliente).

Cada correo al cliente sale una sola vez por pedido. En el detalle del pedido, en el panel, se ve si salió y se puede reenviar.

Para activarlo, una sola vez:

1. En Supabase > **SQL Editor**, ejecuta `supabase/correos.sql`.
2. En cPanel > **Setup Node.js App** > terc.cl, agrega la variable `SMTP_PASSWORD` con la contraseña de `contacto@terc.cl`, presiona "Ejecutar NPM Install" y luego "Restart".
3. En cPanel > **Email Deliverability**, revisa que terc.cl tenga DKIM y SPF en verde, para que los correos no caigan en spam.

### Correos de seguimiento (después de la entrega)

Para que el cliente vuelva y nos recomiende, sin llenarlo de ofertas:

- **Día 10:** "Terqui te deja 3 consejos para tu equipo" y pide su opinión (reseña en Google si `SITE.reviewUrl` tiene el enlace; si no, por WhatsApp).
- **Día 30:** su código de amigo (`AMIGO-NOMBRE-123`): $10.000 de descuento para quien lo use. **Solo** a quien marcó la casilla "Quiero recibir consejos y novedades" al pagar.
- **Un mes antes de que venza la garantía** (contada desde la entrega): aviso para que escriba si nota algo raro.
- **Premio:** cuando un amigo compra con el código y pasan 10 días desde que le llega, quien recomendó recibe un cupón `GRACIAS-…` de $10.000 (un uso, vence en un año).

Todos traen el enlace "No quiero recibir más correos de TERC" (y el botón de baja de Gmail). Quien se da de baja no recibe más correos de seguimiento; los del pedido (pago, envío, entrega) le siguen llegando.

Para activarlo, una sola vez:

1. En Supabase > **SQL Editor**, ejecuta `supabase/correos-seguimiento.sql`.
2. En cPanel > **Setup Node.js App** > terc.cl, agrega la variable `CRON_SECRET` con una clave larga inventada (por ejemplo, 40 letras y números al azar) y presiona "Restart".
3. En cPanel > **Cron Jobs**, crea una tarea diaria (por ejemplo, todos los días a las 10:00) con este comando, reemplazando la clave:

   ```bash
   curl -s -H "Authorization: Bearer LA_CLAVE_DE_CRON_SECRET" https://terc.cl/api/correos/seguimiento
   ```

Cada vez que corre envía como máximo 20 correos y responde cuántos salió de cada tipo. Los tiempos se cuentan desde que el pedido se marca "Entregado" en el panel.

## Conectar Mercado Pago

1. En https://www.mercadopago.cl/developers, crea una aplicación (Checkout Pro).
2. Copia el **Access Token de prueba** en `MERCADOPAGO_ACCESS_TOKEN`.
3. Los avisos de pago (webhook) necesitan una URL pública, así que se prueban mejor con la tienda ya publicada.

## Estructura

```
src/app/                     Páginas y rutas de la API
  (tienda)/page.tsx          Portada con catálogo
  (tienda)/producto/[slug]/  Ficha de producto
  (tienda)/carrito/          Carrito y datos de envío
  (tienda)/pago/[estado]/    Resultado del pago (exito, pendiente, error)
  api/checkout/              Crea el pedido y el pago en Mercado Pago
  api/webhooks/mercadopago/  Recibe la confirmación del pago
src/components/              Piezas reutilizables (carrito, tarjetas)
src/lib/                     Datos, formatos y conexión a servicios
src/app/admin/               Panel de administración (pedidos y productos)
supabase/schema.sql          Tablas y reglas de seguridad
supabase/finanzas.sql        Tablas de caja y campañas (panel)
```

## Publicar con Docker (VPS)

En un servidor con Docker instalado:

```bash
git clone https://github.com/raulcarrascogonzalesr-lgtm/terc-tienda
cd terc-tienda
cp .env.example .env      # completa los valores reales
docker compose up -d --build
```

La tienda queda en el puerto 3000. Delante se pone un proxy (Nginx o Caddy) con el dominio y HTTPS.

## Publicar en cPanel con "Setup Node.js App"

1. Ejecuta `npm run build` en tu computador.
2. Sube por FTP el contenido de `.next/standalone/`, la carpeta `.next/static/` dentro de `.next/` y la carpeta `public/`.
3. En cPanel, crea la app Node.js con archivo de inicio `server.js` y agrega las variables de `.env.example`.

## Publicación automática (GitHub Actions)

Cada cambio que entra a `main` se compila en GitHub y se sube por FTP al hosting (`.github/workflows/deploy.yml`).

Configuración, una sola vez:

1. En cPanel, crea una cuenta FTP cuyo directorio sea la carpeta de la tienda (por ejemplo `/home2/wiresune/terc-tienda`).
2. En cPanel > **Setup Node.js App**, crea una app con:
   - Versión de Node.js: 20 o más nueva
   - Application root: esa misma carpeta
   - Application URL: el dominio de la tienda
   - Application startup file: `server.js`
   - Variables: `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `ADMIN_EMAILS`, `SMTP_PASSWORD` y las `NEXT_PUBLIC_*`
3. En GitHub > Settings > Secrets and variables > Actions:
   - **Secrets:** `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
   - **Variables:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Mientras no estén los datos FTP, el flujo solo comprueba que la tienda compila.

Las dependencias (`node_modules`) no se suben por FTP: en cPanel se instalan con el botón **Ejecutar NPM Install** de la app Node.js. Hay que presionarlo después de la primera subida y cada vez que cambie `package.json`.
