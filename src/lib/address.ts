// Dirección detallada que el cliente llena en el segundo paso del pago. Se usa en el
// navegador (para avisar errores al tiro) y en el servidor (que vuelve a revisar todo).

// Couriers que el cliente puede preferir cuando el envío va con tarifa fija (sin cotizar en Shipit).
export const FIXED_COURIERS = ["starken", "chilexpress", "bluexpress"] as const;

export function isFixedCourier(value: unknown): value is (typeof FIXED_COURIERS)[number] {
  return typeof value === "string" && (FIXED_COURIERS as readonly string[]).includes(value);
}

export const DWELLINGS = {
  casa: "Casa",
  depto: "Departamento",
  oficina: "Oficina o local",
} as const;

export type Dwelling = keyof typeof DWELLINGS;

export function isDwelling(value: unknown): value is Dwelling {
  return typeof value === "string" && value in DWELLINGS;
}

// Teléfono chileno: 9 dígitos, con o sin +56. "9 1234 5678" → "+56 9 1234 5678". null si no sirve.
export function normalizePhone(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("56")) digits = digits.slice(2);
  if (digits.length !== 9) return null;
  return `+56 ${digits[0]} ${digits.slice(1, 5)} ${digits.slice(5)}`;
}

// RUT con dígito verificador (módulo 11). "12345678k" → "12.345.678-K". null si no es válido.
export function normalizeRut(value: string): string | null {
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 8 || clean.length > 9) return null;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return null;
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const expected = 11 - (sum % 11);
  const expectedDv = expected === 11 ? "0" : expected === 10 ? "K" : String(expected);
  if (dv !== expectedDv) return null;
  return `${Number(body).toLocaleString("es-CL")}-${dv}`;
}

export type AddressParts = {
  street: string;
  number: string;
  dwelling: Dwelling;
  unit?: string; // número de depto u oficina, block, torre
  villa?: string; // villa, población o condominio
};

// Una sola línea para el courier, los correos y el panel: "Av. Pajaritos 1234, Depto 52, Villa Los Aromos".
export function addressLine({ street, number, dwelling, unit, villa }: AddressParts): string {
  const unitText = unit ? (dwelling === "depto" ? `Depto ${unit}` : dwelling === "oficina" ? `Of. ${unit}` : unit) : "";
  return [`${street} ${number}`.trim(), unitText, villa ?? ""].filter(Boolean).join(", ");
}
