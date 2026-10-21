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
  stock: number;
  on_demand: boolean; // a pedido: no es stock propio, depende de la disponibilidad del proveedor
  battery_health: number | null; // porcentaje, si aplica
  warranty_months: number;
  description: string;
  image_url: string | null;
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
  utm: Record<string, string> | null;
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
