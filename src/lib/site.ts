// Datos de contacto y de la empresa que se muestran en la tienda.
export const SITE = {
  // Número de WhatsApp Business en formato internacional, sin "+" ni espacios (ej: "56912345678").
  // Mientras esté vacío, el botón de WhatsApp no aparece.
  whatsapp: "56936312578",
  email: "contacto@terc.cl",
  company: "Wiremax Telecomunicaciones SpA",
  // Identidad de la empresa que vende (pie de página y Términos). Google Merchant exige que la tienda
  // muestre quién vende, y que coincida con "Información de empresa" en Merchant Center.
  // Vacío = no se muestra.
  rut: "76.498.039-5",
  address: "Pleyades 1467, Puente Alto, Región Metropolitana",
  // Retiro (Raúl 24-11-2026): solo una posibilidad, en chiquitito y SIN promoverlo (es su casa).
  // Una línea discreta, sin dirección exacta, coordinado por WhatsApp. Vacío = no se muestra.
  pickup: "Puente Alto",
  slogan: "Segunda vida, primera calidad",
  // Plazo de despacho de los productos del proveedor (se piden después de la compra).
  // La ley exige informarlo, aunque la tienda no los muestre como "a pedido".
  onDemandLeadTime: "3 a 5 días hábiles",
  // Días hábiles aproximados desde la compra hasta que llega a la Región Metropolitana, para la
  // fecha estimada de la ficha, el carrito y la página de gracias: [mínimo, máximo].
  // "onDemand" son los del proveedor (se piden después de la compra); "stock", los que ya tenemos.
  deliveryDays: { stock: [1, 2], onDemand: [1, 2] } as Record<"stock" | "onDemand", [number, number]>,
  // Garantía estándar de los computadores (31-10-2026: 1 año; 26-11: se mantiene, con reserva por equipo
  // porque el proveedor cubre 6 meses). Las ofertas pueden traer 6 meses: cada equipo guarda la suya. Cada equipo guarda la suya en warranty_months;
  // esta es la que se anuncia en la tienda (barra de arriba, pie de página).
  warrantyMonths: 12,
  // Pagos (Raúl 26-11-2026, como Winpy): el precio publicado es el de transferencia. Con tarjeta
  // (Mercado Pago o Webpay, débito, crédito o cuotas) sale este % más caro, por la comisión.
  // Se muestra chico, como "otros medios de pago". 0 = mismo precio con cualquier medio.
  cardExtraPercent: 4,
  // Cuenta para las transferencias (la misma de Wiremax). El asunto lleva el número de pedido
  // para separar la plata de TERC de la de Wiremax.
  transfer: {
    bank: "Banco Santander",
    accountType: "Cuenta corriente",
    account: "71453499",
    holder: "Wiremax Telecomunicaciones SpA",
    rut: "76.498.039-5",
    email: "contacto@terc.cl", // a dónde mandar el comprobante
    holdHours: 48, // cuánto tiempo se guarda el pedido de computadores esperando la transferencia
    refundDays: 2, // Energía: si no hay stock, en cuántos días hábiles se devuelve la plata
  },
  // Soporte TERC por WhatsApp (post venta): horario y tiempo de respuesta que se muestran en la tienda.
  // Raúl lo puede cambiar aquí; los textos de la portada, la ficha y la garantía lo toman de aquí.
  support: {
    name: "Soporte TERC por WhatsApp",
    hours: "Lunes a viernes de 9:00 a 20:00",
    hoursShort: "Lun a vie 9 a 20 h",
    response: "el mismo día hábil dentro del horario",
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
