import type { Product } from "./types";

// Producto de prueba para probar los pagos reales (Webpay y Mercado Pago) en terc.cl.
// - No está en la base de datos: no aparece en el catálogo, el buscador, el sitemap ni en
//   la lista de Google Merchant (todas leen la tabla "products").
// - Solo se llega con el enlace directo, y la página le pide a Google que no la guarde.
// - No lleva envío: el carrito no cotiza con Shipit y el pedido queda "Sin envío".
// - No se cuenta como compra en Google Analytics ni en Meta.
// Para retirarlo, borrar este archivo y sus usos (buscar "test-product").

export const TEST_PRODUCT: Product = {
  id: "7e57ba90-0000-4000-8000-000000000001", // UUID que no existe en "products": el stock real no se toca
  sku: "PRUEBA",
  slug: "prueba-pagos-terc-7k3q9x",
  name: "Prueba de pago TERC (no se envía)",
  brand: "TERC",
  category: "Prueba",
  grade: "A",
  price: 50, // Transbank pide un producto de prueba de $50 para la primera compra real
  list_price: null,
  compare_price: null,
  offer_ends_at: null,
  offer_name: null,
  stock: 1,
  on_demand: false,
  battery_health: null,
  warranty_months: 12,
  description:
    "Producto interno de TERC para probar los medios de pago. No es un equipo y no se envía. Si llegaste aquí por error, no lo compres.",
  image_url: null,
  images: [],
  ship_weight_kg: null,
  ship_length_cm: null,
  ship_width_cm: null,
  ship_height_cm: null,
};

export function isTestProduct(id: string): boolean {
  return id === TEST_PRODUCT.id;
}

// Opción de "envío" que ve el carrito cuando solo lleva el producto de prueba.
export const TEST_SHIPPING = { courier: "sin-envio", label: "Sin envío (prueba de pago)", price: 0, days: null };
