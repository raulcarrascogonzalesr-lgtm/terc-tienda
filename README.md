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

## Conectar Mercado Pago

1. En https://www.mercadopago.cl/developers, crea una aplicación (Checkout Pro).
2. Copia el **Access Token de prueba** en `MERCADOPAGO_ACCESS_TOKEN`.
3. Los avisos de pago (webhook) necesitan una URL pública, así que se prueban mejor con la tienda ya publicada.

## Estructura

```
src/app/                     Páginas y rutas de la API
  page.tsx                   Portada con catálogo
  producto/[slug]/           Ficha de producto
  carrito/                   Carrito y datos de envío
  pago/[estado]/             Resultado del pago (exito, pendiente, error)
  api/checkout/              Crea el pedido y el pago en Mercado Pago
  api/webhooks/mercadopago/  Recibe la confirmación del pago
src/components/              Piezas reutilizables (carrito, tarjetas)
src/lib/                     Datos, formatos y conexión a servicios
supabase/schema.sql          Tablas y reglas de seguridad
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
   - Variables: `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN` y las `NEXT_PUBLIC_*`
3. En GitHub > Settings > Secrets and variables > Actions:
   - **Secrets:** `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
   - **Variables:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Mientras no estén los datos FTP, el flujo solo comprueba que la tienda compila.

Las dependencias (`node_modules`) no se suben por FTP: en cPanel se instalan con el botón **Ejecutar NPM Install** de la app Node.js. Hay que presionarlo después de la primera subida y cada vez que cambie `package.json`.
