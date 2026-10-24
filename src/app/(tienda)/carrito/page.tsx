"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { Terqui, TerquiLoader } from "@/components/Terqui";
import { trackBeginCheckout } from "@/lib/analytics";
import { formatCLP } from "@/lib/format";
import { UTM_MAX_AGE_MS, UTM_STORAGE_KEY } from "@/lib/utm";
import { ShippingPicker, type ShippingChoice } from "./ShippingPicker";

function readUtm(): unknown {
  try {
    const saved = JSON.parse(localStorage.getItem(UTM_STORAGE_KEY) ?? "null");
    return saved && Date.now() - saved.at < UTM_MAX_AGE_MS ? saved : null;
  } catch {
    return null;
  }
}

type PaymentMethod = "mercadopago" | "webpay";

const METHOD_LABELS: Record<PaymentMethod, string> = { webpay: "Webpay", mercadopago: "Mercado Pago" };
const METHOD_HELP: Record<PaymentMethod, string> = {
  webpay: "Tarjeta de débito, crédito o prepago (Redcompra).",
  mercadopago: "Tarjeta, cuotas o saldo en Mercado Pago.",
};

type AppliedCoupon = { code: string; productId: string; productName: string; discount: number };

export default function CartPage() {
  const { items, total, setQuantity, remove, canBuy } = useCart();
  const [shippingChoice, setShippingChoice] = useState<ShippingChoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>(["mercadopago"]);
  const [method, setMethod] = useState<PaymentMethod>("mercadopago");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  // Medios de pago activos (Webpay aparece cuando está configurado).
  useEffect(() => {
    fetch("/api/checkout")
      .then((res) => res.json())
      .then((data: { methods?: PaymentMethod[] }) => {
        if (!data.methods?.length) return;
        setMethods(data.methods);
        setMethod(data.methods[0]);
      })
      .catch(() => {});
  }, []);

  // Si vuelve atrás desde Mercado Pago o Webpay, el navegador restaura la página tal cual: se quita la pantalla de carga.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && setSending(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  if (items.length === 0) {
    return (
      <div className="shell flex flex-col items-center py-14 text-center">
        <Terqui pose="carrito" className="w-52 h-52" />
        <h1 className="mt-2 text-2xl font-bold text-ink">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted">Terqui lo revisó dos veces y no encontró nada. ¿Le ayudamos a llenarlo?</p>
        <Link
          href="/#equipos"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition hover:bg-cta"
        >
          Ver equipos
        </Link>
      </div>
    );
  }

  const shipping = shippingChoice?.price ?? null;
  // Si el cliente saca del carrito el equipo del cupón, el descuento deja de aplicar.
  const activeCoupon = coupon && items.some((i) => i.productId === coupon.productId) ? coupon : null;
  const discount = activeCoupon?.discount ?? 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!shippingChoice) return;
    setError(null);
    setSending(true);
    trackBeginCheckout(items.map((i) => ({ id: i.productId, name: i.name, price: i.price, quantity: i.quantity })));
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          ...shippingChoice.payload,
          customer: Object.fromEntries(form.entries()),
          utm: readUtm(),
          method,
          coupon: activeCoupon?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo iniciar el pago");
      if (data.token) {
        // Webpay pide llegar con un formulario que lleva el token.
        const go = document.createElement("form");
        go.method = "POST";
        go.action = data.checkoutUrl;
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "token_ws";
        input.value = data.token;
        go.appendChild(input);
        document.body.appendChild(go);
        go.submit();
        return;
      }
      // Mercado Pago entrega una URL de pago; enviamos al cliente ahí.
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setSending(false);
    }
  }

  return (
    <div className="shell py-8 grid lg:grid-cols-[1fr_380px] gap-8">
      {sending && (
        <TerquiLoader
          overlay
          messages={["Preparando tu pedido…", `Conectando con ${METHOD_LABELS[method]}…`, "Un segundo más"]}
        />
      )}
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Carrito</h1>
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-surface rounded-xl border border-line/10 p-4 flex flex-wrap items-center gap-4"
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
              className="w-16 border border-line/20 rounded px-2 py-1"
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

      <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-line/10 p-6 space-y-4 h-fit">
        <h2 className="text-lg font-semibold">Datos de envío</h2>
        <Field name="name" label="Nombre completo" autoComplete="name" />
        <Field name="email" label="Correo" type="email" autoComplete="email" />
        <Field name="phone" label="Teléfono" type="tel" autoComplete="tel" />
        <ShippingPicker items={items} onChange={setShippingChoice} />
        <Field name="address" label="Dirección" autoComplete="street-address" />

        <dl className="text-sm space-y-1 border-t border-line/10 pt-4">
          <Row label="Productos" value={formatCLP(total)} />
          {activeCoupon && <Row label={`Cupón ${activeCoupon.code}`} value={`−${formatCLP(discount)}`} />}
          <Row label="Envío" value={shipping === null ? "Elige tu comuna" : formatCLP(shipping)} />
          <Row label="Total" value={formatCLP(total - discount + (shipping ?? 0))} bold />
        </dl>

        <CouponBox
          applied={activeCoupon}
          productIds={items.map((i) => i.productId)}
          onApply={setCoupon}
        />

        {methods.length > 1 && (
          <fieldset className="text-sm space-y-2 border-t border-line/10 pt-4">
            <legend className="font-semibold">¿Cómo quieres pagar?</legend>
            {methods.map((m) => (
              <label key={m} className="flex items-start gap-2 rounded-lg border border-line/15 px-3 py-2 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  value={m}
                  checked={method === m}
                  onChange={() => setMethod(m)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">{METHOD_LABELS[m]}</span>
                  <span className="block text-muted">{METHOD_HELP[m]}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}

        {error && <p className="text-sm text-red-700">{error}</p>}
        {!canBuy && (
          <p className="text-sm text-muted">
            Estamos preparando la tienda: muy pronto podrás pagar tu pedido aquí.
          </p>
        )}
        <button
          type="submit"
          disabled={sending || !canBuy || !shippingChoice}
          className="w-full bg-brand text-white font-medium rounded-lg px-6 py-3 hover:opacity-90 disabled:opacity-50"
        >
          {sending ? "Redirigiendo..." : `Pagar con ${METHOD_LABELS[method]}`}
        </button>
      </form>
    </div>
  );
}

function CouponBox({
  applied,
  productIds,
  onApply,
}: {
  applied: AppliedCoupon | null;
  productIds: string[];
  onApply: (coupon: AppliedCoupon | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (applied) {
    return (
      <p className="text-sm text-pine">
        Cupón <strong>{applied.code}</strong> aplicado a {applied.productName}.{" "}
        <button type="button" onClick={() => onApply(null)} className="text-muted underline">
          Quitar
        </button>
      </p>
    );
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-muted underline">
        ¿Tienes un cupón de descuento?
      </button>
    );
  }

  async function apply() {
    if (!code.trim()) return;
    setChecking(true);
    setError(null);
    try {
      const email = (document.querySelector('input[name="email"]') as HTMLInputElement | null)?.value;
      const res = await fetch("/api/cupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, productIds, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo revisar el cupón");
      onApply(data as AppliedCoupon);
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo revisar el cupón");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="text-sm space-y-1">
      <label htmlFor="cupon" className="block">
        Cupón de descuento
      </label>
      <div className="flex gap-2">
        {/* Sin "name": el cupón no viaja con los datos de envío, va aparte. */}
        <input
          id="cupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          autoComplete="off"
          placeholder="Escribe tu código"
          className="flex-1 min-w-0 border border-line/20 rounded px-3 py-2 uppercase"
        />
        <button
          type="button"
          onClick={apply}
          disabled={checking || !code.trim()}
          className="rounded border border-line/20 px-4 py-2 font-medium disabled:opacity-50"
        >
          {checking ? "Revisando…" : "Aplicar"}
        </button>
      </div>
      {error && <p className="text-red-700">{error}</p>}
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
        className="mt-1 w-full border border-line/20 rounded px-3 py-2"
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
