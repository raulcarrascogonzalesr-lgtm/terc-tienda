import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { ResetCookies } from "./ResetCookies";

export const metadata: Metadata = {
  title: "Privacidad y cookies | TERC",
  description: "Qué datos usa TERC, para qué y cómo puedes pedir que los corrijamos o eliminemos.",
};

export default function PrivacyPage() {
  return (
    <div className="shell max-w-2xl py-10 space-y-6 text-muted leading-relaxed">
      <h1 className="text-2xl font-bold text-ink">Privacidad y cookies</h1>
      <p>
        TERC es una marca de {SITE.company}. Esta página explica qué datos usamos cuando compras o navegas en
        terc.cl.
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold text-ink">Datos de tu compra</h2>
        <p>
          Cuando compras te pedimos nombre, correo, teléfono y dirección. Los usamos solo para procesar tu pedido,
          enviarlo y darte la garantía. Para eso los compartimos con Mercado Pago, que procesa el pago (TERC no ve
          ni guarda los datos de tu tarjeta), y con la empresa de envíos que lleva tu equipo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-ink">Correos que te enviamos</h2>
        <p>
          Los datos de tu compra los guarda {SITE.company}, la empresa a la que pertenece TERC. Con tu compra te
          escribimos para avisarte del pago, el envío y la entrega. Después te mandamos unos pocos correos sobre el
          equipo que compraste: consejos para cuidarlo y un aviso antes de que venza tu garantía.
        </p>
        <p>
          Solo si marcas la casilla &ldquo;Quiero recibir consejos y novedades&rdquo; al pagar (viene sin marcar), te
          enviamos también novedades de TERC, como un código para recomendarnos a tus amigos. No vendemos ni
          compartimos tu correo con nadie para publicidad.
        </p>
        <p>
          Cada uno de estos correos trae al final el enlace &ldquo;No quiero recibir más correos de TERC&rdquo;. Con
          un clic dejas de recibirlos. También puedes pedirlo respondiendo cualquier correo nuestro.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-ink">Cookies</h2>
        <p>
          Algunas cookies son necesarias para que la tienda funcione, como las que recuerdan tu carrito y tu elección
          sobre cookies.
        </p>
        <p>
          Si las aceptas, también usamos el píxel de Meta (Facebook e Instagram) y Google Analytics. Nos ayudan a
          saber cuántas personas visitan la tienda, qué productos miran y qué anuncios funcionan. Si eliges
          &ldquo;Solo las necesarias&rdquo;, no se cargan.
        </p>
        <ResetCookies />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-ink">Tus derechos</h2>
        <p>
          Puedes pedirnos ver, corregir o eliminar tus datos escribiendo a{" "}
          <a href={`mailto:${SITE.email}`} className="underline">
            {SITE.email}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
