-- Formulario de Empresas: nueva opción "Energía y eléctricos" (24-11-2026). Ya se corrió en Supabase.
alter table quotes drop constraint quotes_kind_check;
alter table quotes add constraint quotes_kind_check check (kind = any (array['volumen', 'arriendo', 'otro', 'energia']));
