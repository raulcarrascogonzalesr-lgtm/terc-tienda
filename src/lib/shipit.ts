import { courierLabel, ORIGIN_COMMUNE, packageFor, type Commune, type ShippingOption } from "./shipping";
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

async function call(path: string, init?: RequestInit & { next?: { revalidate: number } }) {
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

// Comunas con cobertura, ordenadas por región y nombre. null si Shipit no está disponible.
export async function getCommunes(): Promise<Commune[] | null> {
  if (sampleMode()) return SAMPLE_COMMUNES;
  if (!credentials()) return null;
  try {
    const data = (await call("/communes", { next: { revalidate: 86_400 } })) as {
      id: number;
      name: string;
      is_available?: boolean;
      region?: { name?: string };
    }[];
    return data
      .filter((c) => c.is_available !== false && c.region?.name)
      .map((c) => ({ id: c.id, name: title(c.name), region: c.region!.name! }))
      .sort((a, b) => a.region.localeCompare(b.region, "es") || a.name.localeCompare(b.name, "es"));
  } catch (error) {
    console.error("No se pudieron leer las comunas de Shipit", error);
    return null;
  }
}

export async function findCommune(id: number): Promise<Commune | null> {
  return (await getCommunes())?.find((c) => c.id === id) ?? null;
}

// Opciones de envío para un pedido, de la más barata a la más cara (una por courier).
export async function quoteShipping(
  destinyId: number,
  lines: { category: string; quantity: number }[],
): Promise<ShippingOption[]> {
  const communes = await getCommunes();
  const destiny = communes?.find((c) => c.id === destinyId);
  if (!destiny) return [];
  if (sampleMode()) return sampleOptions(destiny);

  const origin = communes!.find((c) => c.name.toUpperCase() === ORIGIN_COMMUNE);
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
