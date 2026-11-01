import Link from "next/link";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { Mark } from "@/components/Mark";
import { Terqui } from "@/components/Terqui";
import { SITE } from "@/lib/site";
import { warrantyLabel } from "@/lib/warranty";

// Portada: lo que TERC vende además del equipo. La garantía de 1 año y el soporte por WhatsApp
// van en grande, y abajo el resto de lo que se lleva el cliente.
// Los textos vienen de /mnt/project-files/tienda-web/garantia/textos-garantia-1-ano.md (31-10-2026);
// no prometer "24/7", "respuesta inmediata" ni compararse con otras tiendas.

const PILLARS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "shield",
    title: "1 año de garantía",
    text: "Reparación, cambio o devolución. El envío corre por nuestra cuenta.",
  },
  {
    icon: "chat",
    title: "Soporte por WhatsApp",
    text: "Te responde una persona, el mismo día, de lunes a sábado de 9:00 a 22:00.",
  },
  {
    icon: "video",
    title: "Asesoría por videollamada",
    text: `Agenda ${SITE.support.videoCallMinutes} minutos gratis para configurar tu equipo o resolver dudas.`,
  },
  {
    icon: "checklist",
    title: "Revisado uno por uno",
    text: "Probamos cada equipo antes de enviarlo y te contamos su estado real.",
  },
  {
    icon: "heart",
    title: "Trato cercano",
    text: "Te ayudamos a elegir antes de comprar y seguimos ahí después.",
  },
];

// Conversación de ejemplo para que se entienda el servicio de un vistazo.
const CHAT: { me?: boolean; text: string }[] = [
  { me: true, text: "¡Hola! Me llegó el notebook para la consulta. ¿Me ayudan a conectar la impresora y el correo?" },
  {
    text: `¡Hola! Claro 😊 Si quieres, agendamos una videollamada de ${SITE.support.videoCallMinutes} min y lo dejamos listo juntos.`,
  },
  { me: true, text: "¡Perfecto! Mañana a las 11 me acomoda." },
];

// Con qué ayuda el soporte (textos del documento de garantía).
const SUPPORT_HELP: { icon: IconName; text: string }[] = [
  { icon: "chat", text: "Dudas de uso, antes y después de comprar" },
  { icon: "repair", text: "Configuración: Windows, correo, impresora y Wi-Fi" },
  { icon: "shield", text: "Problemas con tu equipo y la garantía" },
  { icon: "video", text: `Videollamada gratis de ${SITE.support.videoCallMinutes} minutos` },
];

export function PeaceOfMind({ warranty, whatsapp }: { warranty: number; whatsapp: string | null }) {
  const label = warrantyLabel(warranty);
  return (
    <section className="shell pt-12">
      <div data-reveal className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.22em] text-pine-700">Lo que compras en TERC</span>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
          No vendemos solo un computador: vendemos la tranquilidad de comprarlo bien.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-muted sm:text-lg">
          Para quienes trabajan o estudian con su computador y no tienen tiempo para problemas: garantía de verdad y
          personas que te ayudan antes y después de comprar.
        </p>
      </div>

      {/* Garantía */}
      <div
        data-reveal
        className="relative mt-8 grid gap-6 overflow-hidden rounded-[2rem] bg-pine p-6 text-white sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-10"
      >
        <StoreIcon name="shield" className="absolute -left-16 -top-10 h-96 w-96 text-white/[0.04]" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold">
            <StoreIcon name="shield" className="h-4 w-4" /> Garantía TERC
          </span>
          <div className="mt-4 flex items-end gap-1 sm:gap-3">
            <p className="whitespace-nowrap font-[family-name:var(--font-display)] text-[4.6rem] font-extrabold leading-[0.85] tracking-tight text-gold sm:text-[10rem]">
              {label}
            </p>
            <Terqui pose="corazon" className="pointer-events-none -mb-1 h-20 w-20 shrink-0 sm:h-36 sm:w-36" />
          </div>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight sm:text-4xl">
            de garantía en cada equipo.
          </p>
          <p className="mt-3 max-w-md text-base text-white/80 sm:text-lg">
            Si algo falla, lo reparamos, te lo cambiamos o te devolvemos tu plata. Y el envío lo pagamos nosotros.
          </p>
          <Link
            href="/garantia-y-devoluciones"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline"
          >
            Ver cómo funciona la garantía <StoreIcon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
        <ul className="relative grid gap-2.5">
          {[
            ["Primeros 6 meses", "tú eliges: reparar, cambiar o devolver tu plata."],
            ["Del mes 7 al 12", "lo reparamos gratis, y si no se puede, te lo cambiamos."],
            ["Envíos gratis", "de ida y vuelta, desde cualquier parte de Chile."],
            ["Desde que lo recibes", "cuenta tu año completo."],
          ].map(([title, text]) => (
            <li key={title} className="flex items-start gap-3 rounded-2xl bg-white/[0.07] px-4 py-3.5">
              <StoreIcon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <span className="text-[15px] leading-snug text-white/75">
                <b className="text-white">{title}:</b> {text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Soporte por WhatsApp: Terqui atendiendo en su escritorio */}
      <div
        data-reveal
        className="relative mt-4 grid gap-x-10 gap-y-6 overflow-hidden rounded-[2rem] bg-mint-50 p-6 text-ink sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center"
      >
        <Mark className="absolute -left-6 -top-6 w-40 opacity-[0.06]" />
        {/* En celular: primero Terqui atendiendo, después el texto y al final la conversación de ejemplo */}
        <div className="relative order-2 lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-pine px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            <WhatsAppIcon className="h-4 w-4 text-[#25d366]" /> {SITE.support.name}
          </span>
          <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Te acompañamos después de la compra.
          </h3>
          <p className="mt-3 text-base text-muted sm:text-lg">
            Soporte por WhatsApp con personas reales, no bots. Te ayudamos con dudas, problemas y a configurar tu
            equipo, y si lo necesitas agendamos una videollamada contigo.
          </p>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {SUPPORT_HELP.map((h) => (
              <li key={h.text} className="flex items-center gap-3 rounded-2xl bg-surface px-3.5 py-3 text-sm ring-1 ring-line/[0.06]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-50 text-pine-700">
                  <StoreIcon name={h.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="leading-snug">{h.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-cta px-5 py-3 text-sm font-semibold text-white transition hover:bg-cta-hover"
              >
                <WhatsAppIcon className="h-5 w-5" /> Escribir al soporte
              </a>
            )}
            <p className="flex items-start gap-2 text-[13px] text-muted">
              <StoreIcon name="clock" className="mt-0.5 h-4 w-4 text-pine-700" />
              <span>
                {SITE.support.hours}.
                <br />
                Respondemos {SITE.support.response}.
              </span>
            </p>
          </div>
        </div>

        <div className="relative order-1 -mx-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:mx-0 lg:self-end">
          <Terqui
            pose="soporte"
            crop="escritorio"
            className="mx-auto block h-auto w-full max-w-[520px]"
            title="Terqui con audífonos en su escritorio, atendiendo a un cliente por WhatsApp"
          />
        </div>
        <div className="relative order-3 lg:order-none lg:col-start-2 lg:row-start-2 lg:-mt-10 lg:self-start">
          <div
            className="relative mx-auto max-w-[440px] rounded-3xl bg-surface p-4 shadow-sm ring-1 ring-line/[0.06]"
            aria-label="Ejemplo de conversación"
          >
            <div className="flex items-center gap-2.5 border-b border-line/[0.06] pb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine">
                <Mark className="w-5" ink="#ffffff" />
              </span>
              <span className="text-sm leading-tight">
                <b className="block text-ink">Soporte TERC</b>
                <span className="text-xs text-muted">Te responde una persona</span>
              </span>
              <span className="ml-auto text-[11px] text-muted">Ejemplo</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {CHAT.map((m) => (
                <li
                  key={m.text}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${m.me ? "ml-auto rounded-br-md bg-[#d9fdd3] text-[#0a2a2a]" : "rounded-bl-md bg-paper text-ink"}`}
                >
                  {m.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {PILLARS.map((p, i) => (
          <li
            key={p.title}
            data-reveal
            style={{ "--d": `${i * 70}ms` } as React.CSSProperties}
            className={`rounded-3xl bg-surface p-4 ring-1 ring-line/[0.06] sm:p-5 ${i === PILLARS.length - 1 ? "col-span-2 lg:col-span-1" : ""}`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint-50 text-pine-700">
              <StoreIcon name={p.icon} className="h-5 w-5" />
            </span>
            <b className="mt-3 block text-[15px] leading-tight text-ink">{p.title}</b>
            <span className="mt-1 block text-[13px] text-muted">{p.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
