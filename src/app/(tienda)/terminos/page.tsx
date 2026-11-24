import type { Metadata } from "next";
import Link from "next/link";
import { ENERGY_INFO } from "@/lib/energy";
import { SITE } from "@/lib/site";
import { warrantyLabel } from "@/lib/warranty";

export const metadata: Metadata = {
  title: "Términos y condiciones | TERC",
  description: "Quién vende en terc.cl, cómo se paga, cómo se envía y qué derechos tienes al comprar en TERC.",
  alternates: { canonical: "/terminos" },
};

// Términos de compra. Google Merchant Center pide que la tienda explique quién vende, cómo se paga,
// cómo se envía y la política de devoluciones (ver hilo "Vender productos de Energía en Google y Meta").
export default function TermsPage() {
  const phone = SITE.whatsapp ? `+${SITE.whatsapp.replace(/^56(9)(\d{4})(\d{4})$/, "56 $1 $2 $3")}` : null;
  return (
    <div className="shell max-w-2xl py-10 space-y-6 text-muted leading-relaxed">
      <h1 className="text-2xl font-bold text-ink">Términos y condiciones</h1>

      <section className="space-y-2">
        <h2 className="font-semibold text-ink">1. Quién vende</h2>
        <p>
          TERC (Tecnología y Equipos Reacondicionados Chile) es una marca de <strong className="text-ink">{SITE.company}</strong>
          {SITE.rut ? `, RUT ${SITE.rut}` : ""}
          {SITE.address ? `, con domicilio en ${SITE.address}` : ""}. Todas las ventas de terc.cl las hace esa empresa, y las
          boletas y facturas salen a su nombre.
        </p>
        <p>
          Contacto: {phone ? <>teléfono y WhatsApp {phone}, </> : null}
          correo{" "}
          <a href={`mailto:${SITE.email}`} className="underline">
            {SITE.email}
          </a>
          . Atendemos {SITE.support.hours.toLowerCase()}.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-ink">2. Qué vendemos</h2>
        <p>
          <strong className="text-ink">Computadores y notebooks reacondicionados:</strong> equipos usados de empresas, revisados y
          probados uno por uno, con {warrantyLabel(SITE.warrantyMonths)} de garantía TERC. Cada ficha muestra el estado estético,
          las características y lo que incluye.
        </p>
        <p>
          <strong className="text-ink">Productos de Energía:</strong> baterías de litio, UPS, inversores, paneles solares y otros
          productos nuevos, con garantía de fábrica. TERC solo los vende: no hace instalaciones eléctricas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-ink">3. Precios y pago</h2>
        <p>
          Los precios están en pesos chilenos e incluyen IVA. El precio que pagas es el que ves en la ficha y en el carrito; el
          costo de envío se muestra antes de pagar.
        </p>
        <p>
          <strong className="text-ink">Computadores:</strong> se pagan en la página con los medios que aparecen en el carrito: Mercado Pago
          (tarjeta, cuotas o saldo) y, cuando está disponible, Webpay. TERC no ve ni guarda los datos de tu tarjeta.
        </p>
        <p>
          <strong className="text-ink">Energía:</strong> envías una solicitud sin pagar nada. Te confirmamos stock y total el mismo
          día hábil, te mandamos los datos para transferir y tienes {ENERGY_INFO.holdHours} horas para hacerlo. La compra queda
          hecha cuando recibimos la transferencia.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-ink">4. Envío y entrega</h2>
        <p>
          <strong className="text-ink">Computadores:</strong> enviamos a todo Chile por courier. Al pagar te mostramos el costo y
          el plazo estimado según tu comuna, y te mandamos el número de seguimiento por correo.
        </p>
        <p>
          <strong className="text-ink">Energía:</strong> {ENERGY_INFO.delivery} La fecha de entrega se coordina contigo por WhatsApp.
        </p>
        {SITE.pickup && (
          <p>
            Si lo necesitas, también se puede retirar en {SITE.pickup}, coordinando antes por WhatsApp.
          </p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-ink">5. Garantía, cambios y devoluciones</h2>
        <p>
          La garantía, cómo pedirla, qué pasa si un paquete llega dañado y por qué no aplica el derecho a retracto están explicados
          en{" "}
          <Link href="/garantia-y-devoluciones" className="underline">
            Garantía y devoluciones
          </Link>
          . Esto no limita los derechos que te da la Ley 19.496 de protección al consumidor.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-ink">6. Tus datos</h2>
        <p>
          Usamos tus datos solo para procesar y entregar tu compra y darte soporte. El detalle está en{" "}
          <Link href="/privacidad" className="underline">
            Privacidad y cookies
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
