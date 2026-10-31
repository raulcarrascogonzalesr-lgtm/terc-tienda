"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { Terqui, TerquiLoader } from "@/components/Terqui";
import { trackBeginCheckout } from "@/lib/analytics";
import { MARKETING_CONSENT_TEXT } from "@/lib/consent";
import { deliveryShort } from "@/lib/delivery";
import { formatCLP } from "@/lib/format";
import { photoProps } from "@/lib/photo";
import { whatsappLink } from "@/lib/site";
import { UTM_MAX_AGE_MS, UTM_STORAGE_KEY } from "@/lib/utm";
import { DeliveryForm } from "./DeliveryForm";
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

const AFTER_PAYMENT: { icon: IconName; title: string; text: string }[] = [
  { icon: "lock", title: "Pagas seguro", text: "Te llega el comprobante a tu correo al tiro." },
  { icon: "checklist", title: "Revisión final y embalaje", text: "Lo probamos de nuevo y lo embalamos con protección." },
  { icon: "truck", title: "Sale a tu casa", text: "Con número de seguimiento por correo." },
  { icon: "check", title: "Llega a tu puerta", text: "En pocos días hábiles." },
];

type AppliedCoupon = { code: string; productId: string; productName: string; discount: number };

type Step = "carrito" | "datos";
const STEP_PARAM = "paso=datos";

export default function CartPage() {
  const { items, total, setQuantity, remove, canBuy } = useCart();
  const [eta, setEta] = useState<string | null>(null);
  const [shippingChoice, setShippingChoice] = useState<ShippingChoice | null>(null);
  const [step, setStep] = useState<Step>("carrito");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>(["mercadopago"]);
  const [method, setMethod] = useState<PaymentMethod>("mercadopago");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false); // siempre parte sin marcar

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

  // Fecha estimada de llegada (si algún equipo es del proveedor, manda el plazo más largo).
  // Los carritos guardados antes no saben si el equipo es del proveedor: se usa el plazo largo.
  const onDemand = items.some((i) => i.onDemand !== false);
  useEffect(() => setEta(deliveryShort(onDemand)), [onDemand]);

  // Si vuelve atrás desde Mercado Pago o Webpay, el navegador restaura la página tal cual: se quita la pantalla de carga.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && setSending(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // El paso de los datos tiene su propia dirección (/carrito?paso=datos), así el botón "atrás"
  // del navegador vuelve al carrito. Si se recarga la página en ese paso, se parte de nuevo en el carrito.
  useEffect(() => {
    if (window.location.search.includes(STEP_PARAM)) window.history.replaceState(null, "", "/carrito");
    const onPop = () => setStep(window.location.search.includes(STEP_PARAM) ? "datos" : "carrito");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
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
  // Solo se nombran los detalles estéticos si el cliente lleva un equipo que los tiene.
  const cosmeticItems = items.filter((i) => i.cosmetic).map((i) => i.name);
  // Sin envío elegido no se puede estar en el paso de los datos.
  const current: Step = step === "datos" && shippingChoice ? "datos" : "carrito";

  function goToDetails() {
    if (!shippingChoice) return;
    trackBeginCheckout(items.map((i) => ({ id: i.productId, name: i.name, price: i.price, quantity: i.quantity })));
    window.history.pushState(null, "", `/carrito?${STEP_PARAM}`);
    setStep("datos");
    setError(null);
    window.scrollTo({ top: 0 });
  }

  function backToCart() {
    if (window.location.search.includes(STEP_PARAM)) window.history.back();
    else setStep("carrito");
  }

  async function handleSubmit(customer: Record<string, string>) {
    if (!shippingChoice) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          ...shippingChoice.payload,
          customer: { ...customer, region: shippingChoice.region, comuna: shippingChoice.comuna },
          utm: readUtm(),
          method,
          coupon: activeCoupon?.code,
          acceptPolicy: true, // el formulario no se envía sin marcar la casilla
          marketingConsent,
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

  const grandTotal = total - discount + (shipping ?? 0);
  // Ahorro frente a uno nuevo de todo el carrito (solo de los equipos que tienen ese precio).
  const saved = items.reduce((sum, i) => sum + (i.savings ?? 0) * i.quantity, 0);
  const totals = (
    <dl className="space-y-2 border-t border-line/10 pt-4 text-[15px]">
      <Row label={items.length === 1 && items[0].quantity === 1 ? "Equipo" : "Productos"} value={formatCLP(total)} />
      {activeCoupon && <Row label={`Cupón ${activeCoupon.code}`} value={`−${formatCLP(discount)}`} />}
      <Row
        label="Envío"
        value={shipping === null ? "Elige tu comuna" : shipping === 0 ? "Gratis" : formatCLP(shipping)}
        highlight={shipping === 0}
      />
      <div className="flex items-end justify-between border-t border-line/10 pt-3">
        <dt className="font-[family-name:var(--font-display)] text-xl font-extrabold text-ink">
          Total
          <small className="block font-sans text-xs font-medium text-muted">IVA incluido</small>
        </dt>
        <dd className="font-[family-name:var(--font-display)] text-2xl font-extrabold tabular-nums text-ink">
          {formatCLP(grandTotal)}
        </dd>
      </div>
    </dl>
  );
  const savedBar = saved > 0 && (
    <p className="flex items-center gap-2.5 rounded-2xl bg-mint-50 px-3 py-2.5 text-sm text-ink">
      <StoreIcon name="leaf" className="h-5 w-5 text-pine-700" />
      <span>
        Comparado con uno nuevo, <strong className="text-pine-700">ahorras {formatCLP(saved)}</strong>.
      </span>
    </p>
  );
  const whatsapp = whatsappLink("Hola, tengo una duda sobre mi compra en TERC");
  const methodNames = methods.map((m) => METHOD_LABELS[m]).join(" o ");
  const warranty = Math.min(...items.map((i) => i.warrantyMonths ?? 6));

  return (
    <div className="shell py-8">
      {sending && (
        <TerquiLoader
          overlay
          messages={["Preparando tu pedido…", `Conectando con ${METHOD_LABELS[method]}…`, "Un segundo más"]}
        />
      )}
      <Steps current={current} />

      {/* El carrito queda montado (escondido) en el paso 2, para no perder la comuna ni el courier elegidos. */}
      <div className={current === "carrito" ? "grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]" : "hidden"}>
        <section className="min-w-0 space-y-4">
          <h1 className="text-2xl font-extrabold text-ink">{items.length === 1 ? "Tu equipo" : "Tus equipos"}</h1>
          {items.map((item) => (
            <div
              key={item.productId}
              className="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-4 rounded-3xl bg-surface p-4 sm:grid-cols-[120px_minmax(0,1fr)_auto]"
            >
              <Link
                href={`/producto/${item.slug}`}
                className="photo-stage relative block aspect-square overflow-hidden rounded-2xl"
                aria-label={item.name}
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img {...photoProps(item.image, "120px", 384)} alt="" className="h-full w-full object-contain p-2 mix-blend-multiply" />
                ) : (
                  <Mark className="absolute inset-[28%] opacity-50" ink="#0a2a2a" />
                )}
              </Link>
              <div className="min-w-0">
                <Link href={`/producto/${item.slug}`} className="font-semibold leading-snug text-ink hover:underline">
                  {item.name}
                </Link>
                {item.specs && <p className="mt-1 text-[13px] text-muted">{item.specs}</p>}
                <p className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-mint-50 px-2 py-1 text-[11.5px] font-bold text-pine-700">
                    {item.warrantyMonths ?? 6} meses de garantía
                  </span>
                  <span className="rounded-full bg-mint-50 px-2 py-1 text-[11.5px] font-bold text-pine-700">Revisado por TERC</span>
                </p>
              </div>
              <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:grid sm:justify-items-end">
                <b className="font-[family-name:var(--font-display)] text-xl text-ink">{formatCLP(item.price * item.quantity)}</b>
                <span className="flex items-center gap-3">
                  {item.maxQuantity > 1 && (
                    <input
                      type="number"
                      min={1}
                      max={item.maxQuantity}
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                      className="w-16 rounded-lg border border-line/20 bg-surface px-2 py-1"
                      aria-label="Cantidad"
                    />
                  )}
                  <button type="button" onClick={() => remove(item.productId)} className="text-[13px] text-muted underline">
                    Quitar
                  </button>
                </span>
              </div>
            </div>
          ))}

          {/* Lo que pasa después de pagar: quita el miedo a la espera antes de pagar. */}
          <div className="rounded-3xl bg-surface p-5">
            <h2 className="mb-4 text-lg font-extrabold text-ink">Qué pasa después de pagar</h2>
            <ol className="grid gap-4 sm:grid-cols-4">
              {AFTER_PAYMENT.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 gap-y-1 sm:grid-cols-1">
                  <span className="row-span-2 flex h-10 w-10 items-center justify-center rounded-xl bg-mint-50 text-pine-700 sm:row-span-1">
                    <StoreIcon name={step.icon} className="h-5 w-5" />
                  </span>
                  <b className="text-sm leading-tight text-ink">{step.title}</b>
                  <span className={`text-[13px] ${i === 3 && eta ? "font-bold text-pine-700" : "text-muted"}`}>
                    {i === 3 && eta ? `Aprox. ${eta}` : step.text}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <aside className="space-y-4 rounded-3xl bg-surface p-5 shadow-[0_16px_40px_-24px_rgba(10,42,42,0.45)] lg:sticky lg:top-28">
          <h2 className="text-lg font-extrabold text-ink">¿A dónde lo enviamos?</h2>
          <ShippingPicker items={items} onChange={setShippingChoice} />
          {totals}
          {savedBar}
          {!canBuy && (
            <p className="text-sm text-muted">
              Estamos preparando la tienda: muy pronto podrás pagar tu pedido aquí.
            </p>
          )}
          <button
            type="button"
            onClick={goToDetails}
            disabled={!canBuy || !shippingChoice}
            className="flex w-full items-center justify-center gap-2.5 rounded-full bg-cta px-6 py-4 font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-hover disabled:opacity-50 disabled:shadow-none"
          >
            Continuar a la dirección <StoreIcon name="arrow" className="h-5 w-5" />
          </button>
          <p className="-mt-2 text-center text-xs text-muted">
            {shippingChoice ? "En el siguiente paso pones tu dirección y pagas." : "Elige tu comuna para ver el total con envío."}
          </p>
          <ul className="space-y-2 text-[13px] text-muted">
            <li className="flex items-center gap-2">
              <StoreIcon name="shield" className="h-[18px] w-[18px] text-pine-700" />
              {warranty} meses de garantía TERC
            </li>
            <li className="flex items-center gap-2">
              <StoreIcon name="lock" className="h-[18px] w-[18px] text-pine-700" />
              Pagas en {methodNames}: nunca vemos tu tarjeta
            </li>
            {whatsapp && (
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="h-[18px] w-[18px] text-[#25d366]" />
                <span>
                  ¿Dudas?{" "}
                  <a href={whatsapp} target="_blank" rel="noopener" className="font-semibold text-pine-700 hover:underline">
                    Te respondemos por WhatsApp
                  </a>
                </span>
              </li>
            )}
          </ul>
          <p className="flex flex-wrap gap-1.5">
            {[...methods.map((m) => METHOD_LABELS[m]), "Débito", "Crédito", "Cuotas"].map((label) => (
              <span key={label} className="rounded-lg bg-paper px-2 py-1.5 text-[11px] font-bold text-ink">
                {label}
              </span>
            ))}
          </p>
          <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2 rounded-2xl bg-paper py-2 pl-1 pr-3">
            <Terqui pose="listo" className="h-16 w-16" />
            <p className="rounded-2xl rounded-bl-sm bg-surface px-3 py-2.5 text-[13px] text-ink shadow-sm">
              Tu equipo viaja bien embalado, con seguimiento y su garantía.
            </p>
          </div>
        </aside>
      </div>

      {current === "datos" && shippingChoice && (
        <DeliveryForm
          choice={shippingChoice}
          onBack={backToCart}
          onSubmit={handleSubmit}
          sending={sending}
          aside={
            <>
              <div className="text-sm space-y-1">
                {items.map((i) => (
                  <div key={i.productId} className="flex justify-between gap-4">
                    <span>
                      {i.quantity} × {i.name}
                    </span>
                    <span className="shrink-0">{formatCLP(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              {totals}
              {savedBar}

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

              <label className="flex items-start gap-2 text-sm border-t border-line/10 pt-4">
                {/* Sin "name": no viaja con los datos de envío. */}
                <input type="checkbox" required className="mt-1" />
                <span>
                  He leído y acepto la{" "}
                  <Link href="/garantia-y-devoluciones" target="_blank" className="underline">
                    política de garantía y devoluciones
                  </Link>
                  .
                  {cosmeticItems.length > 0 && (
                    <>
                      {" "}Entiendo que {cosmeticItems.length === 1 ? "el equipo" : "los equipos"}{" "}
                      <strong>{cosmeticItems.join(", ")}</strong> {cosmeticItems.length === 1 ? "tiene" : "tienen"}{" "}
                      detalles estéticos leves, como se indica en su ficha.
                    </>
                  )}
                </span>
              </label>

              <label className="flex items-start gap-2 text-sm">
                {/* Opcional y sin marcar: el permiso para novedades va aparte de la compra (Ley 21.719). */}
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  {MARKETING_CONSENT_TEXT}{" "}
                  <span className="text-muted">Opcional. Puedes darte de baja cuando quieras.</span>
                </span>
              </label>

              {error && <p className="text-sm text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={sending || !canBuy}
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-cta px-6 py-4 font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-hover disabled:opacity-50 disabled:shadow-none"
              >
                <StoreIcon name="lock" className="h-5 w-5" />
                {sending ? "Redirigiendo..." : `Pagar ${formatCLP(grandTotal)} con ${METHOD_LABELS[method]}`}
              </button>
            </>
          }
        />
      )}
    </div>
  );
}

function Steps({ current }: { current: Step }) {
  const steps: [Step | "pago", string][] = [
    ["carrito", "Tu equipo y envío"],
    ["datos", "Dirección"],
    ["pago", "Pago"],
  ];
  const at = steps.findIndex(([s]) => s === current);
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm" aria-label="Pasos de la compra">
      {steps.map(([s, label], i) => (
        <li key={s} className="flex items-center gap-2 sm:gap-3" aria-current={i === at ? "step" : undefined}>
          {i > 0 && <span className={`h-0.5 w-5 sm:w-16 ${i <= at ? "bg-pine-700" : "bg-line/15"}`} aria-hidden />}
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-extrabold ${
              i < at
                ? "border-pine-700 bg-pine-700 text-white"
                : i === at
                  ? "border-pine bg-pine text-white"
                  : "border-line/15 bg-surface text-muted"
            }`}
          >
            {i < at ? "✓" : i + 1}
          </span>
          <span className={i === at ? "font-semibold text-ink" : "text-muted"}>{label}</span>
        </li>
      ))}
    </ol>
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

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={highlight ? "font-bold text-pine-700" : "text-ink"}>{value}</dd>
    </div>
  );
}
