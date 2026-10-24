// Webpay Plus de Transbank (API REST v1.2), sin librerías extra.
// Variables en la app Node de cPanel:
//   WEBPAY_COMMERCE_CODE  código de comercio (en prueba: 597055555532)
//   WEBPAY_API_KEY        llave secreta que entrega Transbank (en prueba, la pública de su documentación)
//   WEBPAY_ENV=produccion solo cuando Transbank apruebe el paso a producción
//   WEBPAY_SOLO_ADMIN=si  (opcional) en producción, solo el administrador ve Webpay,
//                         para hacer una compra real de prueba antes de abrirlo a clientes
// Mientras WEBPAY_ENV no diga "produccion", Webpay queda en modo prueba y solo
// el administrador lo ve en el carrito: así nadie puede "pagar" con tarjetas de prueba.

const HOSTS = {
  prueba: "https://webpay3gint.transbank.cl",
  produccion: "https://webpay3g.transbank.cl",
} as const;

const API_PATH = "/rswebpaytransaction/api/webpay/v1.2/transactions";

export type WebpayConfig = { commerceCode: string; apiKey: string; isTest: boolean; adminOnly: boolean };

export function getWebpayConfig(): WebpayConfig | null {
  const commerceCode = process.env.WEBPAY_COMMERCE_CODE?.trim();
  const apiKey = process.env.WEBPAY_API_KEY?.trim();
  if (!commerceCode || !apiKey) return null;
  const isTest = process.env.WEBPAY_ENV?.trim() !== "produccion";
  const adminOnly = isTest || process.env.WEBPAY_SOLO_ADMIN?.trim().toLowerCase() === "si";
  return { commerceCode, apiKey, isTest, adminOnly };
}

async function call<T>(config: WebpayConfig, method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${HOSTS[config.isTest ? "prueba" : "produccion"]}${API_PATH}${path}`, {
    method,
    headers: {
      "Tbk-Api-Key-Id": config.commerceCode,
      "Tbk-Api-Key-Secret": config.apiKey,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Webpay respondió ${res.status}: ${data?.error_message ?? "sin detalle"}`);
  }
  return data as T;
}

// Crea la transacción. Webpay devuelve un token y la página a la que se envía al cliente.
// buy_order admite hasta 26 caracteres; el ID del pedido (36) va en session_id.
// Empieza con "TERC-" para separar estas ventas de las de otros portales de Wiremax
// en los reportes de Transbank, mientras se comparte su código de comercio.
export function createWebpayTransaction(
  config: WebpayConfig,
  input: { orderId: string; amount: number; returnUrl: string },
) {
  const buyOrder = `TERC-${Date.now().toString(36)}${input.orderId.replace(/-/g, "").slice(0, 8)}`;
  return call<{ token: string; url: string }>(config, "POST", "", {
    buy_order: buyOrder,
    session_id: input.orderId,
    amount: input.amount,
    return_url: input.returnUrl,
  });
}

export type WebpayResult = {
  status: string; // AUTHORIZED, FAILED, ...
  response_code: number | null; // 0 = aprobado
  amount: number;
  buy_order: string;
  session_id: string;
  authorization_code?: string;
  payment_type_code?: string; // VD débito, VN crédito, VC/SI/S2/NC cuotas, VP prepago
  installments_number?: number;
};

// Confirma el pago. Si no se confirma, Transbank lo anula solo y no cobra.
export function commitWebpayTransaction(config: WebpayConfig, token: string) {
  return call<WebpayResult>(config, "PUT", `/${encodeURIComponent(token)}`);
}

// Consulta el estado (por ejemplo si el cliente recarga la página de retorno).
export function getWebpayTransaction(config: WebpayConfig, token: string) {
  return call<WebpayResult>(config, "GET", `/${encodeURIComponent(token)}`);
}

export function isWebpayApproved(result: WebpayResult) {
  return result.status === "AUTHORIZED" && result.response_code === 0;
}
