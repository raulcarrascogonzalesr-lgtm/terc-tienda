#!/usr/bin/env bash
# Revisa desde afuera, como lo vería un desconocido, que la tienda no deje nada privado a la vista.
# Solo lee: no cambia nada en la tienda ni en Supabase.
# Uso: revisar-seguridad.sh https://terc.cl
# Variables opcionales: SUPABASE_URL y SUPABASE_ANON_KEY (la clave pública que ya usa la tienda).
set -u
base="${1%/}"
errores=0
avisos=0

ok() { echo "  ✔ $1"; }
mal() { echo "::error::$1"; errores=$((errores + 1)); }
aviso() { echo "::warning::$1"; avisos=$((avisos + 1)); }

codigo() { curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$@" || echo 000; }

echo "1. Candado (HTTPS)"
redireccion=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 30 "http://${base#https://}/" || echo 000)
case "$redireccion" in
  30[1278]\ https://*) ok "http:// se manda a https:// ($redireccion)" ;;
  *) mal "http:// no se manda a https:// (respondió: $redireccion)" ;;
esac

echo "2. Archivos que nunca deben verse desde internet"
for p in /terc-google.json /.env /.env.local /server.js /package.json /.ftp-deploy-sync-state.json \
  /.git/config /.next/BUILD_ID /.next/required-server-files.json /.htaccess /tmp/restart.txt; do
  c=$(codigo "$base$p")
  if [ "$c" = "200" ]; then mal "$p se puede descargar (código $c)"; else ok "$p no se ve (código $c)"; fi
done

echo "3. Panel sin iniciar sesión"
for p in /admin /admin/pedidos /admin/finanzas /admin/liquidacion/csv /admin/documento/00000000-0000-0000-0000-000000000000; do
  r=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 30 "$base$p" || echo 000)
  case "$r" in
    30[37]\ *"/admin/login"*) ok "$p pide iniciar sesión" ;;
    *) mal "$p no pidió iniciar sesión (respondió: $r)" ;;
  esac
done

echo "4. Protecciones del navegador (encabezados)"
cabeceras=$(curl -s -D - -o /dev/null --max-time 30 "$base/" | tr -d '\r' | tr 'A-Z' 'a-z')
for h in strict-transport-security x-frame-options x-content-type-options referrer-policy; do
  if grep -q "^$h:" <<<"$cabeceras"; then ok "$h"; else aviso "Falta el encabezado $h"; fi
done
if grep -q "^x-powered-by:" <<<"$cabeceras"; then aviso "La tienda anuncia con qué está hecha (x-powered-by)"; fi

if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_ANON_KEY:-}" ]; then
  sb="${SUPABASE_URL%/}"
  pedir() { curl -s --max-time 30 -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY" "$@"; }

  echo "5. Base de datos con la clave pública"
  r=$(pedir "$sb/rest/v1/products?select=id&limit=1")
  if [[ "$r" != \[* ]]; then
    mal "No se pudo leer el catálogo con la clave pública; las demás pruebas de Supabase no sirven ($r)"
  fi
  for t in orders movements quotes campaigns; do
    r=$(pedir "$sb/rest/v1/$t?select=id&limit=1")
    if [ "$r" = "[]" ] || grep -q '"code"' <<<"$r"; then ok "$t no se puede leer"; else mal "Cualquiera puede leer la tabla $t"; fi
  done
  r=$(pedir "$sb/rest/v1/products?select=cost&limit=1")
  if grep -q '"code"' <<<"$r" || [ "$r" = "[]" ]; then ok "El costo de los productos es privado"; else mal "Cualquiera puede ver el costo de los productos"; fi
  otras=$(pedir "$sb/rest/v1/settings?select=key" | grep -o '"key":"[^"]*"' | grep -v '"store_open"')
  if [ -n "$otras" ]; then mal "Se ven ajustes privados del panel: $otras"; else ok "De los ajustes solo se ve si la tienda está abierta"; fi
  r=$(pedir -X POST -H "Content-Type: application/json" -d '{"prefix":"","limit":1}' "$sb/storage/v1/object/list/documentos")
  if [ "$r" = "[]" ] || grep -qi 'error\|not found' <<<"$r"; then ok "Las facturas (documentos) son privadas"; else mal "Cualquiera puede listar las facturas"; fi
  r=$(pedir -X POST -H "Content-Type: application/json" -d '{"p_order_id":"00000000-0000-0000-0000-000000000000","p_payment_id":"revision"}' "$sb/rest/v1/rpc/mark_order_paid")
  if grep -q '"code"' <<<"$r"; then ok "Nadie de afuera puede marcar pedidos como pagados"; else mal "La función mark_order_paid se puede usar desde afuera"; fi

  echo "6. Cuentas del panel"
  r=$(curl -s --max-time 30 -H "apikey: $SUPABASE_ANON_KEY" "$sb/auth/v1/settings")
  if grep -q '"disable_signup":true' <<<"$r"; then
    ok "Nadie puede crearse una cuenta por su cuenta"
  else
    aviso "Supabase permite que cualquiera se cree una cuenta (conviene desactivarlo; el panel igual solo deja entrar a ADMIN_EMAILS)"
  fi
fi

echo
echo "Resultado: $errores problema(s) y $avisos aviso(s)."
[ "$errores" = 0 ]
