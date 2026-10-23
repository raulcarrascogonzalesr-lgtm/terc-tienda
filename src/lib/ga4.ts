import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Lectura de Google Analytics 4 para el panel (solo lectura).
// La llave es el archivo .json de la cuenta de servicio, que debe ser "Lector" en la propiedad.
// Va subido como terc-google.json en la carpeta principal del hosting (fuera de public_html),
// o pegado en la variable GOOGLE_SERVICE_ACCOUNT_JSON de cPanel, que a veces lo corta.
const KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_FILE ?? join(homedir(), "terc-google.json");
const PROPERTY_ID = process.env.GA4_PROPERTY_ID ?? "560387330";

type ServiceAccount = { client_email: string; private_key: string };

function readKeyFile(): string | undefined {
  try {
    return readFileSync(KEY_FILE, "utf8");
  } catch {
    return undefined;
  }
}

function readServiceAccount(): ServiceAccount | string {
  const fromFile = readKeyFile();
  const account = fromFile ? parseServiceAccount(fromFile) : null;
  if (account && typeof account !== "string") return account;
  const fromEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (fromEnv) return parseServiceAccount(fromEnv);
  return account ?? "Falta subir terc-google.json a la carpeta principal del hosting.";
}

// Lee la llave aunque cPanel la haya guardado con saltos de línea reales, entre comillas
// o con espacios de más. Devuelve el motivo si no se pudo, sin mostrar nada de la llave.
function parseServiceAccount(text: string): ServiceAccount | string {
  const raw = text.trim().replace(/^'|'$/g, "");
  if (!raw) return "La llave de Google está vacía.";
  let parsed: { client_email?: unknown; private_key?: unknown } | null = null;
  for (const candidate of [raw, raw.replace(/\r?\n/g, "\\n")]) {
    try {
      parsed = JSON.parse(candidate);
      break;
    } catch {}
  }
  const email = parsed?.client_email ?? raw.match(/"client_email"\s*:\s*"([^"]+)"/)?.[1];
  const key = parsed?.private_key ?? raw.match(/"private_key"\s*:\s*"([^"]+)"/)?.[1];
  if (typeof email !== "string" || typeof key !== "string") {
    return `La llave de Google no es el archivo .json completo (tiene ${raw.length} caracteres; el archivo tiene unos 2.300).`;
  }
  const pem = key.replace(/\\n/g, "\n");
  if (!pem.includes("BEGIN PRIVATE KEY") || !pem.includes("END PRIVATE KEY")) {
    return "La llave privada de Google quedó cortada.";
  }
  return { client_email: email, private_key: pem };
}

function serviceAccount(): ServiceAccount | null {
  const account = readServiceAccount();
  return typeof account === "string" ? null : account;
}

export function ga4Connected() {
  return serviceAccount() !== null;
}

// Por qué no se puede usar la llave (null si está bien), para mostrarlo en el panel.
export function ga4KeyProblem(): string | null {
  const account = readServiceAccount();
  return typeof account === "string" ? account : null;
}

const b64url = (data: string | Buffer) => Buffer.from(data).toString("base64url");

let token: { value: string; expires: number } | null = null;

async function accessToken(account: ServiceAccount): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(
    JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  )}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(account.private_key);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${b64url(signature)}`,
    }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? data.error ?? "Google rechazó la cuenta de servicio");
  token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return token.value;
}

type Row = { dimensionValues?: { value: string }[]; metricValues: { value: string }[] };

async function runReport(account: ServiceAccount, body: object): Promise<Row[]> {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken(account)}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Google Analytics no respondió");
  return data.rows ?? [];
}

export const FUNNEL_EVENTS = ["view_item", "add_to_cart", "begin_checkout", "purchase", "contact_whatsapp"] as const;

export type Traffic = {
  visitors: number;
  sessions: number;
  // Personas distintas que hicieron cada paso.
  funnel: Record<(typeof FUNNEL_EVENTS)[number], number>;
  sources: { source: string; sessions: number }[];
};

// Fechas en formato AAAA-MM-DD (hora de Chile, la de la propiedad).
export async function getTraffic(startDate: string, endDate: string): Promise<Traffic | null> {
  const account = serviceAccount();
  if (!account) return null;
  const dateRanges = [{ startDate, endDate }];
  const [totals, events, sources] = await Promise.all([
    runReport(account, { dateRanges, metrics: [{ name: "activeUsers" }, { name: "sessions" }] }),
    runReport(account, {
      dateRanges,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "totalUsers" }],
      dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: [...FUNNEL_EVENTS] } } },
    }),
    runReport(account, {
      dateRanges,
      dimensions: [{ name: "sessionSourceMedium" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 6,
    }),
  ]);
  const funnel = Object.fromEntries(FUNNEL_EVENTS.map((e) => [e, 0])) as Traffic["funnel"];
  for (const row of events) {
    const name = row.dimensionValues?.[0].value as (typeof FUNNEL_EVENTS)[number];
    if (name in funnel) funnel[name] = Number(row.metricValues[0].value);
  }
  return {
    visitors: Number(totals[0]?.metricValues[0].value ?? 0),
    sessions: Number(totals[0]?.metricValues[1].value ?? 0),
    funnel,
    sources: sources.map((r) => ({ source: r.dimensionValues![0].value, sessions: Number(r.metricValues[0].value) })),
  };
}
