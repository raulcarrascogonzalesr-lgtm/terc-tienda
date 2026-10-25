// Grado estético del equipo reacondicionado.
export type Grade = "A" | "B" | "C";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  grade: Grade;
  price: number; // en pesos chilenos, sin decimales
  list_price: number | null; // precio de un equipo nuevo equivalente, para mostrar el ahorro
  compare_price: number | null; // precio anterior de TERC cuando el equipo está en oferta
  offer_ends_at: string | null; // último día de la oferta (AAAA-MM-DD, hora de Chile), si tiene
  offer_name: string | null; // nombre de la promoción, por ejemplo "3 Días Terqui"
  stock: number;
  on_demand: boolean; // del proveedor: el stock es lo que él informa, no es inversión propia (el cliente no lo ve)
  battery_health: number | null; // porcentaje, si aplica
  warranty_months: number;
  description: string;
  image_url: string | null;
  images: string[]; // fotos extra, en el orden en que se muestran
  // Paquete listo para despachar (con caja, plumavit y cables), para cotizar el envío.
  ship_weight_kg: number | null;
  ship_length_cm: number | null;
  ship_width_cm: number | null;
  ship_height_cm: number | null;
};

// El carrito guarda una copia del nombre y precio solo para mostrarlos.
// Al pagar, el servidor vuelve a leer el precio real desde el catálogo.
export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  cosmetic?: boolean; // el equipo tiene detalles estéticos leves (grado B o C)
};

// Datos completos que solo ve el panel de administración.
export type AdminProduct = Product & {
  cost: number | null;
  active: boolean;
  supplier: string | null; // proveedor de los productos a pedido
  supplier_sku: string | null; // código del producto en la lista del proveedor
  created_at: string;
};

export type OrderStatus = "pending" | "paid" | "failed" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  status: OrderStatus;
  customer: Record<string, string>;
  items: {
    product_id: string;
    name: string;
    unit_price: number;
    unit_cost?: number | null; // costo al momento de la venta (pedidos nuevos)
    quantity: number;
  }[];
  shipping_zone: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  payment_id: string | null;
  tracking_code: string | null;
  created_at: string;
  paid_at: string | null;
  paid_email_at?: string | null; // cuándo se envió al cliente el correo de pago recibido
  shipped_email_at?: string | null; // cuándo se envió el correo con el código de seguimiento
  delivered_email_at?: string | null; // cuándo se envió el correo de "¿cómo te fue?"
  utm: Record<string, string> | null;
  coupon_code?: string | null; // cupón usado en el pedido
  discount?: number; // pesos descontados con el cupón (con IVA); total = subtotal − descuento + envío
  shipping_fund?: number; // lo que trajeron los equipos para el envío (envío gratis en la RM), ya incluido en el subtotal
  shipping_quote?: number | null; // lo que cotizó el courier al pagar
  shipping_real?: number | null; // lo que realmente se le pagó al courier, si se corrigió en el panel
};

// Cupón de descuento para un equipo. Solo lo ve el panel.
export type Coupon = {
  code: string; // en mayúsculas, por ejemplo PRIMERO7
  product_id: string;
  kind: "percent" | "amount"; // porcentaje del precio o monto fijo en pesos (con IVA)
  value: number;
  max_uses: number;
  expires_on: string | null; // último día en que sirve (AAAA-MM-DD)
  note: string;
  active: boolean;
  created_at: string;
};

export type MovementKind = "ingreso" | "egreso";

// Entrada o salida de plata que no es una venta de la web.
export type Movement = {
  id: string;
  date: string; // AAAA-MM-DD
  kind: MovementKind;
  category: string;
  amount: number; // siempre positivo, en CLP
  description: string;
  campaign_id: string | null;
  doc_type: DocType | null; // documento que respalda el movimiento
  doc_number: string | null;
  supplier: string | null; // proveedor o quien pagó/recibió
  supplier_rut: string | null;
  vat: number | null; // IVA del documento (factura de compra, venta o nota de crédito)
  attachment: string | null; // ruta del archivo en el bucket privado "documentos"
  product_id: string | null; // equipo vendido, en ventas fuera de la web
  unit_cost: number | null; // costo neto de ese equipo al momento de la venta
  created_at: string;
};

export type DocType = "factura" | "boleta" | "otro" | "nota_credito";

export type Campaign = {
  id: string;
  name: string;
  channel: string;
  code: string; // valor de utm_campaign en el enlace del anuncio
  monthly_budget: number | null;
  active: boolean;
  created_at: string;
};

// Costo que se repite en cada venta (caja, relleno, comisión…). Solo lo ve el panel.
export type ExtraCost = {
  id: string;
  name: string;
  category: string | null; // categoría de producto a la que aplica; null = a todos
  amount: number; // pesos sin IVA por cada equipo vendido
  percent: number; // % del precio con IVA (por ejemplo, la comisión de pago)
  note: string;
  active: boolean;
  created_at: string;
};

// Solicitud de "Empresas y cotizaciones". Solo la ve el panel.
export type QuoteKind = "volumen" | "arriendo" | "otro";
export type QuoteStatus = "nueva" | "respondida" | "cerrada";

export type Quote = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  kind: QuoteKind;
  quantity: number | null;
  message: string;
  status: QuoteStatus;
};
