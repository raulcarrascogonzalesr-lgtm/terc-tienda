-- Ficha técnica de cada producto (23-11-2026, pedido de Raúl).
-- Se escribe en el panel, una línea por dato: "Etiqueta: valor".
-- Una línea que empieza con "## " es un título de grupo (por ejemplo "## Rendimiento").
-- La tienda la muestra dentro de la misma página, en un apartado "Ficha técnica" que se abre al apretarlo.
alter table products add column if not exists tech_sheet text;
