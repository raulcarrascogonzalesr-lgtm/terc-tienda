import { SITE } from "@/lib/site";
import { StoreIcon } from "./icons";

// Aviso mientras las compras están cerradas desde el panel.
export function PreparingBanner() {
  return (
    <div className="bg-gold text-pine">
      <div className="shell py-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm">
        <StoreIcon name="leaf" className="w-4 h-4" />
        <strong className="font-semibold">Estamos preparando la tienda.</strong>
        <span>
          Ya puedes ver los equipos y precios; muy pronto podrás comprar. ¿Te interesa uno?{" "}
          <a href={`mailto:${SITE.email}`} className="font-semibold underline">
            Escríbenos
          </a>
        </span>
      </div>
    </div>
  );
}
