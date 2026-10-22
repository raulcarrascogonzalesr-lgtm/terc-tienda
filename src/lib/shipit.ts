import { courierLabel, ORIGIN_COMMUNE, packageFor, SHIPPING_ZONES, type Commune, type ShippingOption } from "./shipping";
import { SAMPLE_COMMUNES, sampleOptions } from "./shipit-sample";

// Conexión con Shipit (https://developers.shipit.cl) para cotizar envíos.
// Las credenciales se cargan en cPanel: SHIPIT_EMAIL y SHIPIT_TOKEN.
// Sin credenciales, en desarrollo se usan datos de ejemplo; en el servidor real, la tienda
// vuelve a las tarifas fijas.

const API = "https://api.shipit.cl/v";


function credentials() {
  const email = process.env.SHIPIT_EMAIL;
  const token = process.env.SHIPIT_TOKEN;
  return email && token ? { email, token } : null;
}

function sampleMode() {
  return !credentials() && process.env.NODE_ENV !== "production";
}

async function call(path: string, init?: RequestInit) {
  const auth = credentials();
  if (!auth) throw new Error("Shipit no está configurado");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.shipit.v4",
      "X-Shipit-Email": auth.email,
      "X-Shipit-Access-Token": auth.token,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Shipit respondió ${res.status} en ${path}`);
  return res.json();
}

// "VIÑA DEL MAR" → "Viña del Mar"
const SMALL_WORDS = new Set(["de", "del", "la", "las", "los", "el", "y"]);
function title(text: string) {
  return text
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

// La lista de comunas casi no cambia: se guarda en memoria un día (solo si Shipit respondió bien).
let communesCache: { at: number; list: Commune[] } | null = null;

// Comunas con cobertura, ordenadas por región y nombre. null si Shipit no está disponible.
export async function getCommunes(): Promise<Commune[] | null> {
  if (sampleMode()) return SAMPLE_COMMUNES;
  if (!credentials()) return null;
  if (communesCache && Date.now() - communesCache.at < 86_400_000) return communesCache.list;
  try {
    const data = (await call("/communes")) as {
      id: number;
      name: string;
      is_available?: boolean;
      region?: { name?: string };
    }[];
    const list = data
      .filter((c) => c.is_available !== false && c.region?.name)
      .map((c) => ({ id: c.id, name: title(c.name), region: c.region!.name! }))
      .sort((a, b) => a.region.localeCompare(b.region, "es") || a.name.localeCompare(b.name, "es"));
    communesCache = { at: Date.now(), list };
    return list;
  } catch (error) {
    console.error("No se pudieron leer las comunas de Shipit", error);
    return null;
  }
}

export async function findCommune(id: number): Promise<Commune | null> {
  return (await getCommunes())?.find((c) => c.id === id) ?? null;
}

// Opciones de envío para un pedido, de la más barata a la más cara (una por courier).
// Si Shipit falla o no llega a esa comuna, se ofrece la tarifa fija de la zona.
export async function quoteShipping(
  destinyId: number,
  lines: { category: string; quantity: number }[],
): Promise<ShippingOption[]> {
  const communes = await getCommunes();
  const destiny = communes?.find((c) => c.id === destinyId);
  if (!communes || !destiny) return [];
  if (sampleMode()) return sampleOptions(destiny);
  try {
    const options = await shipitRates(communes, destiny, lines);
    if (options.length > 0) return options;
  } catch (error) {
    console.error("No se pudo cotizar con Shipit", error);
  }
  const zone = destiny.region.startsWith("Metropolitana") ? "rm" : "regiones";
  return [{ courier: zone, label: "Envío estándar", price: SHIPPING_ZONES[zone].price, days: null }];
}

const plain = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

async function shipitRates(
  communes: Commune[],
  destiny: Commune,
  lines: { category: string; quantity: number }[],
): Promise<ShippingOption[]> {
  const origin =
    communes.find((c) => plain(c.name) === ORIGIN_COMMUNE) ??
    communes.find((c) => plain(c.name) === `${ORIGIN_COMMUNE} CENTRO`);
  if (!origin) throw new Error(`No se encontró la comuna de origen ${ORIGIN_COMMUNE} en Shipit`);
  const data = (await call("/rates", {
    method: "POST",
    body: JSON.stringify({
      parcel: { ...packageFor(lines), origin_id: origin.id, destiny_id: destiny.id, type_of_destiny: "domicilio" },
    }),
  })) as {
    prices?: {
      original_courier?: string;
      courier?: { name?: string };
      price?: number;
      days?: number;
      available_to_shipping?: boolean;
    }[];
  };

  const byCourier = new Map<string, ShippingOption>();
  for (const p of data.prices ?? []) {
    const courier = p.original_courier ?? p.courier?.name;
    if (!courier || !p.price || p.available_to_shipping === false) continue;
    const option = {
      courier,
      label: courierLabel(courier),
      price: Math.round(p.price),
      days: p.days ?? null,
    };
    const seen = byCourier.get(courier);
    if (!seen || option.price < seen.price) byCourier.set(courier, option);
  }
  return [...byCourier.values()].sort((a, b) => a.price - b.price);
}
