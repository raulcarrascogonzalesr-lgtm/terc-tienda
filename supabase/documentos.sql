-- Facturas y boletas en los movimientos de caja.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).

alter table movements add column if not exists doc_type text
  check (doc_type in ('factura', 'boleta', 'otro'));
alter table movements add column if not exists doc_number text;
alter table movements add column if not exists supplier text;
alter table movements add column if not exists supplier_rut text;
alter table movements add column if not exists vat integer check (vat >= 0);
alter table movements add column if not exists attachment text;

-- Fotos y PDF de los documentos. Privado: solo el panel los abre con un enlace temporal.
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;
