import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

// Botón flotante; no aparece hasta que se configure el número en src/lib/site.ts.
export function WhatsAppButton() {
  const href = whatsappLink("Hola, vengo de la tienda TERC y tengo una consulta");
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/20 transition hover:scale-105"
    >
      <WhatsAppIcon className="w-7 h-7" />
    </a>
  );
}
