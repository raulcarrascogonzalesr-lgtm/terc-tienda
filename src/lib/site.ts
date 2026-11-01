// Datos de contacto y de la empresa que se muestran en la tienda.
export const SITE = {
  // Número de WhatsApp Business en formato internacional, sin "+" ni espacios (ej: "56912345678").
  // Mientras esté vacío, el botón de WhatsApp no aparece.
  whatsapp: "56936312578",
  email: "contacto@terc.cl",
  company: "Wiremax Telecomunicaciones SpA",
  slogan: "Segunda vida, primera calidad",
  // Plazo de despacho de los productos del proveedor (se piden después de la compra).
  // La ley exige informarlo, aunque la tienda no los muestre como "a pedido".
  onDemandLeadTime: "3 a 5 días hábiles",
  // Días hábiles aproximados desde la compra hasta que llega a la Región Metropolitana, para la
  // fecha estimada de la ficha, el carrito y la página de gracias: [mínimo, máximo].
  // "onDemand" son los del proveedor (se piden después de la compra); "stock", los que ya tenemos.
  deliveryDays: { stock: [2, 4], onDemand: [4, 7] } as Record<"stock" | "onDemand", [number, number]>,
  // Garantía de todos los equipos (31-10-2026: 1 año). Cada equipo guarda la suya en warranty_months;
  // esta es la que se anuncia en la tienda (barra de arriba, pie de página).
  warrantyMonths: 12,
  // Soporte TERC por WhatsApp (post venta): horario y tiempo de respuesta que se muestran en la tienda.
  // Raúl lo puede cambiar aquí; los textos de la portada, la ficha y la garantía lo toman de aquí.
  support: {
    name: "Soporte TERC por WhatsApp",
    hours: "Lunes a viernes de 10:00 a 19:00 y sábado de 10:00 a 14:00",
    hoursShort: "Lun a vie 10 a 19 h · sáb 10 a 14 h",
    response: "normalmente en menos de 2 horas en horario de atención",
    videoCallMinutes: 30,
  },
  // Enlace para dejar una reseña en Google (Perfil de Empresa > "Pedir reseñas").
  // Mientras esté vacío, el correo del día 10 pide la opinión por WhatsApp.
  reviewUrl: "",
  // Medición para publicidad. Son IDs públicos (se ven en el código de la página).
  // Se cargan solo si el visitante acepta las cookies. Vacío = desactivado.
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1923570001938469",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? "G-R8D4875YZB",
  metaDomainVerification: "csaape7gjsgl1d5q9kdd6mt9jbhgo4",
  googleSiteVerification: "HNgqIST4xzO92revokklqWle_20whgkNMxarTI1ngCU", // Search Console
};

export function whatsappLink(message: string): string | null {
  if (!SITE.whatsapp) return null;
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}
