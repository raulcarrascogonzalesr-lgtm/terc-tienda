"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCLP } from "@/lib/format";
import { MIN_REGION_SHIPPING, SHIPPING_ZONES, type Commune, type ShippingOption, type ShippingZone } from "@/lib/shipping";
import type { CartItem } from "@/lib/types";

// Lo que el carrito manda al pagar: el envío cotizado con Shipit o, si Shipit no está
// disponible, una de las tarifas fijas.
export type ShippingChoice =
  | { price: number; payload: { shipping: { communeId: number; courier: string } } }
  | { price: number; payload: { shippingZone: ShippingZone } };

const field = "mt-1 w-full border border-line/20 rounded px-3 py-2 bg-surface";

function daysLabel(days: number | null) {
  if (!days) return null;
  return days === 1 ? "Llega en 1 día hábil" : `Llega en ${days} días hábiles`;
}

export function ShippingPicker({
  items,
  onChange,
}: {
  items: CartItem[];
  onChange: (choice: ShippingChoice | null) => void;
}) {
  const [communes, setCommunes] = useState<Commune[] | null | undefined>(undefined);
  const [region, setRegion] = useState("");
  const [communeId, setCommuneId] = useState<number | null>(null);
  const [options, setOptions] = useState<ShippingOption[] | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [courier, setCourier] = useState<string | null>(null);
  const [zone, setZone] = useState<ShippingZone>("rm");
  const [fund, setFund] = useState(0); // lo que trae cada equipo para el envío (envío gratis en la RM)

  useEffect(() => {
    fetch("/api/envio")
      .then((r) => r.json())
      .then((d) => {
        setCommunes(d.communes ?? null);
        setFund(Number(d.fund) || 0);
      })
      .catch(() => setCommunes(null));
  }, []);

  // Tarifa fija (sin Shipit) con el mismo descuento que hace el servidor al pagar.
  const units = items.reduce((n, i) => n + i.quantity, 0);
  const zonePrice = (z: ShippingZone) =>
    fund > 0 ? (z === "rm" ? 0 : Math.max(MIN_REGION_SHIPPING, SHIPPING_ZONES[z].price - fund * units)) : SHIPPING_ZONES[z].price;

  const regions = useMemo(() => [...new Set((communes ?? []).map((c) => c.region))], [communes]);
  const cartKey = items.map((i) => `${i.productId}x${i.quantity}`).join(",");

  // Cada vez que cambia la comuna o el carrito, se vuelve a cotizar.
  useEffect(() => {
    if (!communeId) return;
    let current = true;
    setOptions(null);
    setQuoteError(null);
    fetch("/api/envio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        communeId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    })
      .then(async (r) => {
        const d = await r.json();
        if (!current) return;
        if (!r.ok) throw new Error(d.error);
        setOptions(d.options);
        if (d.options.length === 0) setQuoteError("Por ahora no llegamos a esa comuna. Escríbenos y lo vemos.");
        setCourier((c) => (d.options.some((o: ShippingOption) => o.courier === c) ? c : d.options[0]?.courier ?? null));
      })
      .catch((e) => current && setQuoteError(e.message || "No pudimos cotizar el envío. Intenta de nuevo."));
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communeId, cartKey]);

  const selected = options?.find((o) => o.courier === courier) ?? null;
  useEffect(() => {
    if (communes === null) onChange({ price: zonePrice(zone), payload: { shippingZone: zone } });
    else if (communeId && selected)
      onChange({ price: selected.price, payload: { shipping: { communeId, courier: selected.courier } } });
    else onChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communes, zone, communeId, selected?.courier, selected?.price, fund, units]);

  if (communes === undefined) {
    return <p className="text-sm text-muted">Cargando comunas…</p>;
  }

  // Sin Shipit: tarifas fijas y región/comuna escritas a mano, como antes.
  if (communes === null) {
    return (
      <>
        <label className="block text-sm">
          Zona de envío
          <select value={zone} onChange={(e) => setZone(e.target.value as ShippingZone)} className={field}>
            {Object.entries(SHIPPING_ZONES).map(([key, z]) => (
              <option key={key} value={key}>
                {z.label} ({zonePrice(key as ShippingZone) === 0 ? "gratis" : formatCLP(zonePrice(key as ShippingZone))})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Región
          <input name="region" required className={field} />
        </label>
        <label className="block text-sm">
          Comuna
          <input name="comuna" required className={field} />
        </label>
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <label className="block text-sm">
          Región
          <select
            required
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setCommuneId(null);
              setOptions(null);
              setQuoteError(null);
            }}
            className={field}
          >
            <option value="" disabled>
              Elige tu región
            </option>
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Comuna
          <select
            required
            disabled={!region}
            value={communeId ?? ""}
            onChange={(e) => setCommuneId(Number(e.target.value))}
            className={`${field} disabled:opacity-50`}
          >
            <option value="" disabled>
              {region ? "Elige tu comuna" : "Primero elige la región"}
            </option>
            {communes
              .filter((c) => c.region === region)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      {communeId && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm">¿Cómo quieres recibirlo?</legend>
          {quoteError ? (
            <p className="rounded-lg bg-sale-50 px-3 py-2 text-sm text-sale">{quoteError}</p>
          ) : !options ? (
            <p className="text-sm text-muted">Cotizando el envío…</p>
          ) : (
            options.map((o, i) => (
              <label
                key={o.courier}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-line/10 px-3 py-2.5 text-sm has-[:checked]:border-pine-700 has-[:checked]:bg-mint-50"
              >
                <input
                  type="radio"
                  name="shipping-courier"
                  checked={courier === o.courier}
                  onChange={() => setCourier(o.courier)}
                  className="accent-pine-700"
                />
                <span className="flex-1">
                  <span className="font-semibold text-ink">{o.label}</span>
                  {i === 0 && options.length > 1 && (
                    <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-semibold text-gold-700">
                      Más barato
                    </span>
                  )}
                  {daysLabel(o.days) && <span className="block text-xs text-muted">{daysLabel(o.days)}</span>}
                </span>
                <span className="text-right">
                  {o.cost !== undefined && o.cost > o.price && (
                    <span className="block text-xs text-muted line-through">{formatCLP(o.cost)}</span>
                  )}
                  <span className={`font-semibold ${o.price === 0 ? "text-pine-700" : "text-ink"}`}>
                    {o.price === 0 ? "Gratis" : formatCLP(o.price)}
                  </span>
                </span>
              </label>
            ))
          )}
        </fieldset>
      )}
    </>
  );
}
