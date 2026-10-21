-- Interruptor para cerrar las compras mientras TERC no puede atender pedidos.
-- Ejecutar una vez en Supabase > SQL Editor (no borra nada si se repite).
-- Solo el ajuste "store_open" es público; el resto de los ajustes sigue privado.
drop policy if exists "Estado de la tienda" on settings;
create policy "Estado de la tienda" on settings for select using (key = 'store_open');
grant select (key, value) on settings to anon, authenticated;
