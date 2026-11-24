-- Ficha técnica de cada producto (23-11-2026, pedido de Raúl).
-- Se escribe en el panel, una línea por dato: "Etiqueta: valor".
-- Una línea que empieza con "## " es un título de grupo (por ejemplo "## Rendimiento").
-- La tienda la muestra dentro de la misma página, en un apartado "Ficha técnica" que se abre al apretarlo.
alter table products add column if not exists tech_sheet text;
-- La tienda lee los productos con la llave pública: hay que darle permiso a la columna nueva,
-- si no, todas las páginas con productos fallan (pasó el 23-11 por unos minutos).
grant select (tech_sheet) on products to anon, authenticated;
