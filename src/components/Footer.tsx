import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";
import { StoreIcon, WhatsAppIcon } from "./icons";
import { Logo } from "./Logo";

export function Footer({ categories }: { categories: string[] }) {
  const whatsapp = whatsappLink("Hola, tengo una consulta sobre TERC");
  return (
    <footer className="bg-pine text-white/75">
      <div className="shell py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-2">
          <Logo variant="light" className="h-16 w-auto" />
          <p className="max-w-sm text-sm leading-relaxed">
            Tecnología reacondicionada, revisada uno por uno y con garantía. {SITE.slogan}.
          </p>
        </div>
        {categories.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Equipos</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c}>
                  <Link href={`/?categoria=${encodeURIComponent(c)}#equipos`} className="hover:text-white">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Contacto</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-white">
                  <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                </a>
              </li>
            )}
            <li>
              <Link href="/por-que-terc" className="flex items-center gap-2 hover:text-white">
                <StoreIcon name="leaf" className="w-4 h-4" /> Por qué TERC
              </Link>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-white">
                <StoreIcon name="mail" className="w-4 h-4" /> {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <StoreIcon name="card" className="w-4 h-4" /> Pagos seguros con Mercado Pago
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell py-5 text-xs text-white/55 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <p>
            TERC es una marca de {SITE.company}. Tus boletas y facturas salen a nombre de Wiremax.
          </p>
          <p>© {new Date().getFullYear()} TERC · Tecnología y Equipos Reacondicionados Chile</p>
        </div>
      </div>
    </footer>
  );
}
