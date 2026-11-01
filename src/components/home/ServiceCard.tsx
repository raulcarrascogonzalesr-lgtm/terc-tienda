import Link from "next/link";
import { StoreIcon } from "@/components/icons";
import { Terqui, type TerquiPose } from "@/components/Terqui";
import { SITE } from "@/lib/site";
import { warrantyLabel } from "@/lib/warranty";

// Tarjetas de servicio que van mezcladas entre los equipos de la portada: Terqui cuenta, al lado de
// los productos, lo que viene con cada compra (garantía, soporte, revisión, asesoría, envío).
export type Service = {
  key: string;
  pose: TerquiPose;
  crop?: "escritorio";
  tone: "pine" | "mint" | "gold" | "paper";
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href: string; external?: boolean };
};

export function services({
  warranty,
  whatsapp,
  freeShipping,
}: {
  warranty: number;
  whatsapp: string | null;
  freeShipping: boolean;
}): Service[] {
  const chat = whatsapp
    ? { href: whatsapp, external: true }
    : { href: "/garantia-y-devoluciones" };
  const list: Service[] = [
    {
      key: "garantia",
      pose: "corazon",
      tone: "pine",
      eyebrow: "Garantía TERC",
      title: `${warrantyLabel(warranty)} de garantía`,
      text: "Si algo falla, lo reparamos, te lo cambiamos o te devolvemos tu plata. El envío lo pagamos nosotros.",
      cta: { label: "Cómo funciona", href: "/garantia-y-devoluciones" },
    },
    {
      key: "soporte",
      pose: "soporte",
      crop: "escritorio",
      tone: "mint",
      eyebrow: "Soporte post venta",
      title: "Te ayudo por WhatsApp",
      text: `Te responde una persona, no un bot, ${SITE.support.response}. ${SITE.support.hoursShort}.`,
      cta: { label: "Escribir al soporte", ...chat },
    },
    {
      key: "revisado",
      pose: "lupa",
      tone: "paper",
      eyebrow: "Revisado uno por uno",
      title: "Sabes lo que compras",
      text: "Probamos cada equipo antes de enviarlo y te contamos su estado real, con detalles incluidos.",
      cta: { label: "Cómo lo revisamos", href: "/por-que-terc" },
    },
    {
      key: "videollamada",
      pose: "hola",
      tone: "gold",
      eyebrow: "Asesoría gratis",
      title: "Lo dejamos listo juntos",
      text: `Videollamada de ${SITE.support.videoCallMinutes} minutos para configurar tu correo, impresora y Wi-Fi.`,
      cta: { label: "Agendar por WhatsApp", ...chat },
    },
  ];
  if (freeShipping)
    list.push({
      key: "envio",
      pose: "caja",
      tone: "paper",
      eyebrow: "Envío gratis",
      title: "Gratis a toda la RM",
      text: "Cualquier comuna, cualquier equipo. Y a regiones, más barato: ya te descontamos parte del envío.",
      cta: { label: "Ver equipos", href: "#equipos" },
    });
  return list;
}

const TONE = {
  pine: {
    card: "bg-pine text-white",
    bubble: "bg-white/10 text-white",
    eyebrow: "text-gold",
    text: "text-white/80",
    cta: "text-gold",
  },
  mint: {
    card: "bg-mint-50 text-ink border border-pine-700/15",
    bubble: "bg-surface",
    eyebrow: "text-pine-700",
    text: "text-muted",
    cta: "text-pine-700",
  },
  gold: {
    card: "bg-gold text-pine",
    bubble: "bg-white/40",
    eyebrow: "text-pine",
    text: "text-pine/80",
    cta: "text-pine",
  },
  paper: {
    card: "bg-surface text-ink border border-line/[0.06]",
    bubble: "bg-mint-50",
    eyebrow: "text-pine-700",
    text: "text-muted",
    cta: "text-pine-700",
  },
} as const;

export function ServiceCard({ service: s }: { service: Service }) {
  const t = TONE[s.tone];
  const cta = (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold sm:gap-1.5 sm:text-sm ${t.cta}`}
    >
      {s.cta.label}
      <StoreIcon
        name="arrow"
        className="h-4 w-4 transition group-hover:translate-x-1"
      />
    </span>
  );
  return (
    <aside
      className={`group relative flex h-full flex-col items-center overflow-hidden rounded-2xl p-3 sm:p-4 ${t.card}`}
    >
      <Terqui
        pose={s.pose}
        crop={s.crop}
        className={
          s.crop ? "h-24 w-36 sm:h-36 sm:w-56" : "h-24 w-24 sm:h-40 sm:w-40"
        }
      />
      {/* Globo de diálogo: lo que Terqui te cuenta. */}
      <div
        className={`relative mt-2 flex w-full flex-1 flex-col rounded-2xl px-3 py-3 sm:px-4 ${t.bubble}`}
      >
        <span
          aria-hidden
          className={`absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 ${t.bubble}`}
        />
        <p
          className={`relative text-[10px] font-bold uppercase tracking-[0.16em] sm:text-[11px] ${t.eyebrow}`}
        >
          {s.eyebrow}
        </p>
        <p className="relative mt-1 font-[family-name:var(--font-display)] text-lg font-extrabold leading-tight tracking-tight sm:text-xl">
          {s.title}
        </p>
        <p
          className={`relative mt-1.5 text-xs leading-snug sm:text-sm ${t.text}`}
        >
          {s.text}
        </p>
        <div className="relative mt-auto pt-3">
          {s.cta.external ? (
            <a href={s.cta.href} target="_blank" rel="noopener noreferrer">
              {cta}
            </a>
          ) : (
            <Link href={s.cta.href}>{cta}</Link>
          )}
        </div>
      </div>
    </aside>
  );
}

// Dónde va cada tarjeta: después del 3.er equipo y luego cada 5 equipos. Así en celular (2 columnas)
// siempre queda a la derecha de un equipo, y en computador va cambiando de columna.
export function withServices<T>(
  items: T[],
  list: Service[],
): ({ kind: "product"; item: T } | { kind: "service"; service: Service })[] {
  const out: (
    | { kind: "product"; item: T }
    | { kind: "service"; service: Service }
  )[] = [];
  let next = 0;
  items.forEach((item, i) => {
    out.push({ kind: "product", item });
    const shown = i + 1;
    if (next < list.length && shown >= 3 && (shown - 3) % 5 === 0)
      out.push({ kind: "service", service: list[next++] });
  });
  return out;
}
