// Datos de contacto y de la empresa que se muestran en la tienda.
export const SITE = {
  // Número de WhatsApp Business en formato internacional, sin "+" ni espacios (ej: "56912345678").
  // Mientras esté vacío, el botón de WhatsApp no aparece.
  whatsapp: "",
  email: "contacto@terc.cl",
  company: "Wiremax Telecomunicaciones SpA",
  slogan: "Segunda vida, primera calidad",
  // Plazo extra de los productos a pedido, que se piden al proveedor después de la compra.
  onDemandLeadTime: "3 a 5 días hábiles",
};

export function whatsappLink(message: string): string | null {
  if (!SITE.whatsapp) return null;
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}
