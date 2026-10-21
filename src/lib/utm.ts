// De qué anuncio llegó el cliente. Se guarda en el navegador y viaja con el pedido.
export const UTM_STORAGE_KEY = "terc-utm";
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid"] as const;
export const UTM_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>;

// Limpia lo que manda el navegador antes de guardarlo en el pedido.
export function sanitizeUtm(value: unknown): Utm | null {
  if (!value || typeof value !== "object") return null;
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const v = (value as Record<string, unknown>)[key];
    if (typeof v === "string" && v.trim()) utm[key] = v.trim().slice(0, 100);
  }
  return Object.keys(utm).length > 0 ? utm : null;
}
