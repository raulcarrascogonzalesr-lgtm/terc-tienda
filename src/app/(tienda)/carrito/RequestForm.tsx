"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { StoreIcon, WhatsAppIcon } from "@/components/icons";
import { TerquiLoader } from "@/components/Terqui";
import { normalizePhone, normalizeRut } from "@/lib/address";
import { trackBeginCheckout } from "@/lib/analytics";
import { ENERGY_INFO } from "@/lib/energy";
import { formatCLP } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { UTM_MAX_AGE_MS, UTM_STORAGE_KEY } from "@/lib/utm";

// Carrito con productos de Energía (TERC 2.1): no se paga aquí. El cliente deja 4 datos y envía
// una solicitud; TERC confirma stock y total y le manda la cuenta y el monto para transferir.
// Si el carrito trae además equipos, todo va en la misma solicitud y en una sola transferencia.

const field = "mt-1 w-full rounded-xl border border-line/20 bg-surface px-3 py-2.5";

type Errors = Partial<Record<"name" | "phone" | "email" | "comuna" | "rut" | "business", string>>;

function readUtm(): unknown {
  try {
    const saved = JSON.parse(localStorage.getItem(UTM_STORAGE_KEY) ?? "null");
    return saved && Date.now() - saved.at < UTM_MAX_AGE_MS ? saved : null;
  } catch {
    return null;
  }
}

export function RequestForm({ mixed }: { mixed: boolean }) {
  const { items, total, clear, canBuy } = useCart();
  const router = useRouter();
  const [doc, setDoc] = useState<"boleta" | "factura">("boleta");
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const whatsapp = whatsappLink("Hola, tengo una duda sobre los productos de Energía de TERC");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries([...new FormData(e.currentTarget).entries()].map(([k, v]) => [k, String(v).trim()]));
    const next: Errors = {};
    if (data.name.length < 2) next.name = "Escribe tu nombre";
    if (!normalizePhone(data.phone)) next.phone = "Debe tener 9 dígitos, por ejemplo 9 1234 5678";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = "Revisa tu correo";
    if (data.comuna.length < 2) next.comuna = "Escribe tu comuna";
    if (doc === "factura" && !normalizeRut(data.rut ?? "")) next.rut = "Revisa el RUT de la empresa";
    if (doc === "factura" && (data.business ?? "").length < 2) next.business = "Escribe la razón social";
    setErrors(next);
    if (Object.keys(next).length) return;
    if (!data.accept) return setError("Marca la casilla de la política de garantía y devoluciones para continuar.");

    setError(null);
    setSending(true);
    trackBeginCheckout(items.map((i) => ({ id: i.productId, name: i.name, price: i.price, quantity: i.quantity })));
    try {
      const res = await fetch("/api/solicitud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            extendWarranty: !!(i.warrantyExtended && i.warrantyUpgrade),
          })),
          customer: { name: data.name, phone: data.phone, email: data.email, comuna: data.comuna, rut: data.rut, business: data.business, note: data.note, document: doc },
          utm: readUtm(),
          acceptPolicy: true, // el formulario no se envía sin marcar la casilla
          website: data.website,
        }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error ?? "No pudimos enviar tu solicitud");
      const params = new URLSearchParams({ n: out.number, w: normalizePhone(data.phone) ?? "", nombre: data.name.split(/\s+/)[0] });
      clear();
      router.push(`/solicitud-enviada?${params}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar tu solicitud");
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {sending && <TerquiLoader overlay messages={["Enviando tu solicitud…", "Avisándole a TERC…", "Un segundo más"]} />}
      <div>
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-700">
          <StoreIcon name="bank" className="h-4 w-4" /> Compra con aprobación
        </p>
        <h2 className="mt-1 text-lg font-extrabold text-ink">Tus datos para la solicitud</h2>
        <p className="mt-1 text-[13px] text-muted">
          Solo 4 datos. Te escribimos por WhatsApp el mismo día hábil para confirmar stock y total. No se cobra nada ahora.
        </p>
      </div>
      {mixed && (
        <p className="flex items-start gap-2 rounded-2xl bg-mint-50 px-3 py-2.5 text-[13px] text-ink">
          <StoreIcon name="bolt" className="mt-0.5 h-4 w-4 text-pine-700" />
          Tu pedido incluye productos de Energía, así que todo el pedido se confirma primero y se paga con una sola transferencia.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Input name="name" label="Nombre" autoComplete="name" error={errors.name} />
        <Input name="phone" label="WhatsApp" type="tel" autoComplete="tel" placeholder="9 1234 5678" error={errors.phone} />
        <Input name="email" label="Correo" type="email" autoComplete="email" error={errors.email} />
        <Input name="comuna" label="Comuna" autoComplete="address-level2" placeholder="Maipú" error={errors.comuna} />
      </div>

      <fieldset className="text-sm">
        <legend className="mb-1.5">Documento</legend>
        <div className="inline-flex rounded-full bg-paper p-1 ring-1 ring-line/10" role="group">
          {(["boleta", "factura"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDoc(d)}
              aria-pressed={doc === d}
              className={`rounded-full px-4 py-1.5 font-semibold capitalize ${doc === d ? "bg-pine text-white" : "text-muted"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </fieldset>
      {doc === "factura" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Input name="rut" label="RUT de la empresa" placeholder="76.123.456-7" error={errors.rut} />
          <Input name="business" label="Razón social" error={errors.business} />
        </div>
      )}
      <label className="block text-sm">
        Algo que debamos saber <span className="text-muted">(opcional)</span>
        <textarea name="note" rows={2} maxLength={600} className={field} placeholder="Por ejemplo: para qué lo necesitas o cuándo lo quieres recibir" />
      </label>
      {/* Campo trampa invisible para robots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <dl className="space-y-2 border-t border-line/10 pt-4 text-[15px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Productos</dt>
          <dd className="text-ink">{formatCLP(total)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Entrega</dt>
          <dd className="text-right text-ink">Se coordina contigo</dd>
        </div>
        <div className="flex items-end justify-between border-t border-line/10 pt-3">
          <dt className="font-[family-name:var(--font-display)] text-xl font-extrabold text-ink">
            Total
            <small className="block font-sans text-xs font-medium text-muted">IVA incluido · lo confirmamos por WhatsApp</small>
          </dt>
          <dd className="font-[family-name:var(--font-display)] text-2xl font-extrabold tabular-nums text-ink">{formatCLP(total)}</dd>
        </div>
      </dl>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="accept" className="mt-1" />
        <span>
          He leído y acepto la{" "}
          <Link href="/garantia-y-devoluciones" target="_blank" className="underline">
            política de garantía y devoluciones
          </Link>
          .
        </span>
      </label>

      {!canBuy && <p className="text-sm text-muted">Estamos preparando la tienda: muy pronto podrás enviar tu solicitud.</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={sending || !canBuy}
        className="flex w-full items-center justify-center gap-2.5 rounded-full bg-cta px-6 py-4 font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-hover disabled:opacity-50 disabled:shadow-none"
      >
        {sending ? "Enviando…" : "Enviar solicitud de compra"} <StoreIcon name="arrow" className="h-5 w-5" />
      </button>
      <ul className="space-y-2 text-[13px] text-muted">
        <li className="flex items-center gap-2">
          <StoreIcon name="bank" className="h-[18px] w-[18px] text-pine-700" />
          Pagas por transferencia cuando te confirmemos (el monto vale {ENERGY_INFO.holdHours} horas)
        </li>
        <li className="flex items-center gap-2">
          <StoreIcon name="receipt" className="h-[18px] w-[18px] text-pine-700" />
          Boleta o factura de Wiremax
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
    </form>
  );
}

function Input(props: { name: string; label: string; type?: string; autoComplete?: string; placeholder?: string; error?: string }) {
  return (
    <label className="block text-sm">
      {props.label}
      <input
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
        maxLength={120}
        aria-invalid={props.error ? true : undefined}
        className={`${field} ${props.error ? "border-red-700" : ""}`}
      />
      {props.error && <span className="mt-1 block text-xs text-red-700">{props.error}</span>}
    </label>
  );
}
