-- Peso y medidas del paquete listo para despachar (con caja, plumavit y cables).
-- Shipit cotiza el envío con estos datos; si están vacíos, la tienda usa una estimación por categoría.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
alter table products
  add column if not exists ship_weight_kg numeric(5,1) check (ship_weight_kg > 0),
  add column if not exists ship_length_cm integer check (ship_length_cm > 0),
  add column if not exists ship_width_cm integer check (ship_width_cm > 0),
  add column if not exists ship_height_cm integer check (ship_height_cm > 0);
grant select (ship_weight_kg, ship_length_cm, ship_width_cm, ship_height_cm) on products to anon, authenticated;

-- Valores iniciales de cada equipo: peso del fabricante + caja, plumavit, cargador y cables
-- (alrededor de 1 a 2,5 kg más y 8 a 10 cm más por lado). Se pueden corregir en el panel.
update products set ship_weight_kg = v.kg, ship_length_cm = v.l, ship_width_cm = v.w, ship_height_cm = v.h
from (values
  ('notebook-dell-latitude-5430-i7-1255u-16-gb-ssd-512-gb', 2.7, 45, 33, 10),
  ('notebook-dell-vostro-3400-i5-11a-gen-8-gb-ssd-1-tb', 2.8, 45, 33, 10),
  ('notebook-hp-elitebook-840-g7-i5-10210u-16-gb-ssd-256-gb', 2.6, 45, 33, 10),
  ('notebook-hp-elitebook-840-g8-i7-1165g7-16-gb-ssd-512-gb', 2.6, 45, 33, 10),
  ('notebook-hp-elitebook-830-g7-i7-10510u-8-gb-ssd-256-gb', 2.5, 42, 32, 10),
  ('notebook-hp-probook-440-g8-i5-1135g7-16-gb-ssd-256-gb', 2.7, 45, 33, 10),
  ('notebook-hp-probook-440-g7-i5-10210u-8-gb-ssd-256-gb', 2.7, 45, 33, 10),
  ('notebook-hp-probook-640-g8-i5-1145g7-16-gb-ssd-512-gb', 2.7, 45, 33, 10),
  ('notebook-dell-latitude-5400-i7-8a-gen-8-gb-ssd-256-gb', 2.8, 45, 33, 10),
  ('notebook-dell-latitude-5400-i7-8a-gen-8-gb-ssd-256-gb-detalles', 2.8, 45, 33, 10),
  ('notebook-lenovo-thinkpad-t460-i5-6300u-16-gb-ssd-512-gb-tactil', 3.0, 45, 33, 10),
  ('lenovo-thinkpad-t480-i5-16gb', 2.8, 45, 33, 10),
  ('monitor-hp-elitedisplay-s231d-23-con-camara-web', 7.0, 64, 44, 17),
  ('monitor-hp-p22v-g4-21-5', 5.0, 60, 40, 15),
  ('monitor-hp-elitedisplay-e190i-18-9', 6.0, 55, 40, 17),
  ('monitor-hp-p19b-g4-18-5', 4.2, 52, 37, 15),
  ('monitor-viewsonic-17-vs15826-sin-base', 4.5, 48, 44, 15),
  ('monitor-hp-v214a-20-7', 4.5, 57, 38, 15),
  ('pc-hp-prodesk-400-g9-sff-i7-12a-gen-16-gb-512-gb', 6.5, 45, 40, 20),
  ('pc-hp-prodesk-400-g9-sff-i5-12500-8-gb-256-gb', 6.5, 45, 40, 20),
  ('pc-hp-elite-sff-800-g9-i5-12500-16-gb-ddr5-1-tb', 6.5, 45, 40, 20),
  ('pc-hp-prodesk-400-g7-sff-i5-10500-16-gb-ssd-512-gb', 6.5, 45, 40, 20),
  ('pc-hp-prodesk-400-g4-sff-i7-6a-gen-16-gb-1-tb', 6.7, 45, 40, 20),
  ('pc-hp-prodesk-600-g4-sff-i5-8500-8-gb-1-tb', 7.3, 45, 40, 20),
  ('pc-hp-elitedesk-800-g4-sff-i7-8700-16-gb-1-tb', 7.4, 45, 40, 20),
  ('pc-hp-prodesk-600-g6-sff-i5-10a-gen-8-gb-1-tb', 6.5, 45, 40, 20),
  ('pc-hp-elitedesk-800-g6-sff-i3-10100-8-gb-1-tb', 7.0, 45, 40, 20),
  ('mini-pc-dell-optiplex-3000-micro-i5-12a-gen-8-gb-ssd-256-gb', 2.5, 30, 25, 12),
  ('mini-pc-dell-optiplex-3050-micro-i5-6a-gen-8-gb-ssd-256-gb', 2.5, 30, 25, 12),
  ('all-in-one-lenovo-v50a-24-i5-10a-gen-16-gb-1-tb', 9.5, 68, 50, 22),
  ('all-in-one-hp-proone-440-g9-23-8-i5-12500-16-gb-ssd-512-gb', 9.0, 68, 50, 22),
  ('all-in-one-hp-proone-400-g6-i7-10700-16-gb-ssd-512-gb', 9.0, 68, 50, 22),
  ('samsung-galaxy-s21-128gb', 0.6, 20, 12, 8),
  ('iphone-12-128gb-azul', 0.6, 20, 12, 8),
  ('ipad-9-64gb-wifi', 1.2, 33, 25, 8)
) as v(slug, kg, l, w, h)
where products.slug = v.slug and products.ship_weight_kg is null;
