import { SITE, whatsappLink } from "@/lib/site";
import { StoreIcon } from "./icons";

// Aviso mientras las compras están cerradas desde el panel.
export function PreparingBanner() {
  // Si hay WhatsApp, "Escríbenos" abre el chat; si no, el correo.
  const whatsapp = whatsappLink("Hola, me interesa un equipo de la tienda TERC");
  return (
    <div className="bg-gold text-pine">
      <div className="shell py-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm">
        <StoreIcon name="leaf" className="w-4 h-4" />
        <strong className="font-semibold">Estamos preparando la tienda.</strong>
        <span>
          Ya puedes ver los equipos y precios; muy pronto podrás comprar. ¿Te interesa uno?{" "}
          <a
            href={whatsapp ?? `mailto:${SITE.email}`}
            {...(whatsapp && { target: "_blank", rel: "noopener" })}
            className="font-semibold underline"
          >
            Escríbenos
          </a>
        </span>
      </div>
    </div>
  );
}
