#!/usr/bin/env bash
# Abre algunas páginas de la tienda hasta que todas respondan bien (código 200).
# Uso: revisar-tienda.sh https://terc.cl
set -u
base="${1%/}"
paginas=("/" "/empresas" "/por-que-terc")

for intento in $(seq 1 8); do
  sleep 15
  ok=1
  for p in "${paginas[@]}"; do
    codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$base$p?revision=$intento" || echo 000)
    echo "Intento $intento: $p respondió $codigo"
    [ "$codigo" = "200" ] || ok=0
  done
  if [ "$ok" = 1 ]; then
    echo "La tienda responde bien."
    exit 0
  fi
done

echo "::error::La tienda no responde bien después de publicar."
exit 1
