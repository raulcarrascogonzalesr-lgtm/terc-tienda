import { SITE } from "@/lib/site";
import { StoreIcon, type IconName } from "./icons";

// Logos de pago reales: Mercado Pago es el único medio activo y estas son las tarjetas que acepta.
// Webpay se agrega acá recién cuando esté activo para los clientes.
const CARDS = [
  { src: "/marcas/visa.svg", alt: "Visa", className: "h-[0.95em]" },
  { src: "/marcas/mastercard.svg", alt: "Mastercard", className: "h-[1.7em]" },
  { src: "/marcas/amex.svg", alt: "American Express", className: "h-[1.2em]" },
];

const chip = "flex h-[2.6em] items-center justify-center rounded-[0.6em] bg-white px-[0.8em] shadow-sm ring-1 ring-black/[0.06]";

export function PaymentLogos({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-[0.5em] ${className}`} aria-label="Medios de pago">
      <li className={`${chip} gap-[0.4em]`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marcas/mercadopago.svg" alt="" className="h-[1.6em] w-auto" />
        <span className="text-[0.95em] font-bold tracking-tight text-[#2d3277]">Mercado Pago</span>
      </li>
      {CARDS.map((card) => (
        <li key={card.alt} className={chip}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.src} alt={card.alt} className={`${card.className} w-auto`} />
        </li>
      ))}
    </ul>
  );
}

const PROMISES: { icon: IconName; text: string }[] = [
  { icon: "lock", text: "Sitio seguro" },
  { icon: "receipt", text: `Boleta o factura de ${SITE.company}` },
  { icon: "shield", text: "Garantía en cada equipo" },
];

// Franja de "compra segura" para el pie de página, sobre fondo oscuro.
export function TrustStrip() {
  return (
    <div className="border-b border-white/10">
      <div data-reveal className="shell py-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Compra segura</p>
          <PaymentLogos className="text-sm sm:text-base" />
          <p className="text-xs text-white/60">
            Pagas en la página de Mercado Pago, con crédito, débito o cuotas. Nunca vemos los datos de tu tarjeta.
          </p>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs text-white/80">
          {PROMISES.map((p) => (
            <li key={p.text} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2">
              <StoreIcon name={p.icon} className="h-4 w-4 text-gold" />
              {p.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
