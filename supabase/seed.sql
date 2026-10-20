-- Productos de ejemplo (borrar o desactivar cuando cargues los reales).
insert into products (slug, name, brand, category, grade, price, stock, battery_health, warranty_months, description)
values
  ('iphone-12-128gb-azul', 'iPhone 12 128 GB Azul', 'Apple', 'Celulares', 'A', 289990, 2, 89, 6,
   'Equipo revisado en 30 puntos, liberado para cualquier compañía. Incluye cable de carga.'),
  ('lenovo-thinkpad-t480-i5-16gb', 'Lenovo ThinkPad T480 i5 16 GB 256 GB SSD', 'Lenovo', 'Notebooks', 'B', 249990, 3, null, 6,
   'Notebook empresarial con Windows 11 Pro, teclado en español y cargador original.'),
  ('samsung-galaxy-s21-128gb', 'Samsung Galaxy S21 128 GB Gris', 'Samsung', 'Celulares', 'B', 199990, 1, 85, 6,
   'Pantalla sin rayas, pequeñas marcas en el marco. Funcionamiento 100% probado.'),
  ('ipad-9-64gb-wifi', 'iPad 9ª generación 64 GB Wi-Fi', 'Apple', 'Tablets', 'A', 219990, 2, 92, 6,
   'Ideal para estudio y trabajo. Se entrega restaurado de fábrica.')
on conflict (slug) do nothing;
