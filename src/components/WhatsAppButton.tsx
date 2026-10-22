import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./icons";
import { Terqui } from "./Terqui";

// Botón flotante de WhatsApp con los colores de TERC: píldora verde profundo con el ícono en verde WhatsApp.
// En celular queda solo el ícono para no tapar la página. Terqui va sentado encima. No aparece hasta que se configure el número en src/lib/site.ts.
export function WhatsAppButton() {
  const href = whatsappLink("Hola, vengo de la tienda TERC y tengo una consulta");
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="¿Dudas? Escríbenos por WhatsApp"
      className="wa-enter group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-pine p-1.5 text-white shadow-xl shadow-pine/30 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:shadow-2xl sm:pr-5"
    >
      {/* Terqui sentado sobre el botón, balanceando las piernas. */}
      <Terqui
        pose="sentado"
        className="pointer-events-none absolute bottom-[calc(100%-9px)] left-1/2 h-14 w-14 -translate-x-1/2 sm:bottom-[calc(100%-12px)] sm:left-0 sm:h-20 sm:w-20 sm:translate-x-0"
      />
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25d366]">
        <span className="wa-ping absolute inset-0 rounded-full bg-[#25d366]" aria-hidden />
        <WhatsAppIcon className="relative w-7 h-7" />
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block font-[family-name:var(--font-display)] text-sm font-bold">¿Dudas? Escríbenos</span>
        <span className="flex items-center gap-1.5 text-xs text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden />
          Te respondemos por WhatsApp
        </span>
      </span>
    </a>
  );
}
