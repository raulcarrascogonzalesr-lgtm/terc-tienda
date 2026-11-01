-- 31-10-2026, decisión de Raúl: 1 año (12 meses) de garantía en todos los equipos.
-- Ejecutar UNA vez en Supabase > SQL Editor (repetirlo no cambia nada).
alter table products alter column warranty_months set default 12;
update products set warranty_months = 12 where warranty_months <> 12;
-- Las descripciones dicen "con 6 meses de garantía TERC": se cambia ese texto.
update products
set description = regexp_replace(description, '\d+ meses de garantía', '12 meses de garantía', 'g')
where description ~ '\d+ meses de garantía';
select count(*) as equipos, min(warranty_months), max(warranty_months) from products;
