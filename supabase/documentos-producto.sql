-- Documentos para descargar en la ficha de cada producto (24-11-2026, pedido de Raúl):
-- la ficha técnica y el manual de uso en PDF, debajo de la ficha técnica que se ve en la página.
-- Se escriben en el panel, uno por línea: "Ficha técnica | https://…pdf".
-- La tienda solo muestra los que están guardados en la tienda (bucket "fichas"), nunca enlaces a otras páginas:
-- el botón "Guardar documentos en la tienda" del panel los copia.
alter table products add column if not exists documents text;
-- Sin este permiso todas las páginas con productos fallan (la llave pública no podría leer la columna).
grant select (documents) on products to anon, authenticated;

-- Carpeta pública para los PDF (hasta 50 MB cada uno, solo PDF).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fichas', 'fichas', true, 52428800, array['application/pdf'])
on conflict (id) do update set public = true, file_size_limit = 52428800, allowed_mime_types = array['application/pdf'];
