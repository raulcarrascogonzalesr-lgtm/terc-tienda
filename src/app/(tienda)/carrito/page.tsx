"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatCLP } from "@/lib/format";
import { SHIPPING_ZONES, type ShippingZone } from "@/lib/shipping";
import { UTM_MAX_AGE_MS, UTM_STORAGE_KEY } from "@/lib/utm";

function readUtm(): unknown {
  try {
    const saved = JSON.parse(localStorage.getItem(UTM_STORAGE_KEY) ?? "null");
    return saved && Date.now() - saved.at < UTM_MAX_AGE_MS ? saved : null;
  } catch {
    return null;
  }
}

export default function CartPage() {
  const { items, total, setQuantity, remove } = useCart();
  const [zone, setZone] = useState<ShippingZone>("rm");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <Link href="/" className="text-brand underline">
          Ver productos
        </Link>
      </div>
    );
  }

  const shipping = SHIPPING_ZONES[zone].price;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingZone: zone,
          customer: Object.fromEntries(form.entries()),
          utm: readUtm(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo iniciar el pago");
      // Mercado Pago entrega una URL de pago; enviamos al cliente ahí.
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setSending(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Carrito</h1>
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-xl border border-black/10 p-4 flex flex-wrap items-center gap-4"
          >
            <Link href={`/producto/${item.slug}`} className="flex-1 min-w-48 font-medium">
              {item.name}
            </Link>
            <input
              type="number"
              min={1}
              max={item.maxQuantity}
              value={item.quantity}
              onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
              className="w-16 border border-black/20 rounded px-2 py-1"
              aria-label="Cantidad"
            />
            <span className="w-28 text-right">{formatCLP(item.price * item.quantity)}</span>
            <button
              type="button"
              onClick={() => remove(item.productId)}
              className="text-sm text-red-700"
            >
              Quitar
            </button>
          </div>
        ))}
      </section>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-black/10 p-6 space-y-4 h-fit">
        <h2 className="text-lg font-semibold">Datos de envío</h2>
        <Field name="name" label="Nombre completo" autoComplete="name" />
        <Field name="email" label="Correo" type="email" autoComplete="email" />
        <Field name="phone" label="Teléfono" type="tel" autoComplete="tel" />
        <label className="block text-sm">
          Zona de envío
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value as ShippingZone)}
            className="mt-1 w-full border border-black/20 rounded px-3 py-2"
          >
            {Object.entries(SHIPPING_ZONES).map(([key, z]) => (
              <option key={key} value={key}>
                {z.label} ({formatCLP(z.price)})
              </option>
            ))}
          </select>
        </label>
        <Field name="region" label="Región" />
        <Field name="comuna" label="Comuna" />
        <Field name="address" label="Dirección" autoComplete="street-address" />

        <dl className="text-sm space-y-1 border-t border-black/10 pt-4">
          <Row label="Productos" value={formatCLP(total)} />
          <Row label="Envío" value={formatCLP(shipping)} />
          <Row label="Total" value={formatCLP(total + shipping)} bold />
        </dl>

        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-brand text-white font-medium rounded-lg px-6 py-3 hover:opacity-90 disabled:opacity-50"
        >
          {sending ? "Redirigiendo..." : "Pagar con Mercado Pago"}
        </button>
      </form>
    </div>
  );
}

function Field(props: { name: string; label: string; type?: string; autoComplete?: string }) {
  return (
    <label className="block text-sm">
      {props.label}
      <input
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        required
        className="mt-1 w-full border border-black/20 rounded px-3 py-2"
      />
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
