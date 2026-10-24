import type { Metadata } from "next";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Garantía y devoluciones | TERC",
  description:
    "Cómo funciona la garantía de los equipos reacondicionados de TERC, cuándo devolvemos el dinero y cómo pedirlo.",
};

// Resumen que se lee de un vistazo, antes del detalle.
const SUMMARY: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "leaf",
    title: "Son equipos reacondicionados",
    text: "Usados, revisados y 100% operativos. Pueden tener detalles estéticos leves.",
  },
  {
    icon: "shield",
    title: "Garantía por fallas técnicas",
    text: "Si falla, tú eliges: reparación gratis, cambio o devolución del dinero. El envío lo pagamos nosotros.",
  },
  {
    icon: "receipt",
    title: "Sin devoluciones por arrepentimiento",
    text: "No aceptamos devoluciones si el equipo funciona bien y es como lo describimos.",
  },
];

const COVERED = [
  "El equipo no enciende, se apaga solo o se reinicia sin razón.",
  "Fallas de pantalla, teclado, touchpad, parlantes, cámara, puertos, Wi-Fi o carga.",
  "Fallas de disco, memoria u otra pieza interna.",
  "El cargador que viene con el equipo no funciona.",
  "El equipo no es el que compraste (otro modelo o características distintas a las de la ficha).",
];

const NOT_COVERED = [
  "Los detalles estéticos que informamos en la ficha (roces o rayitas leves).",
  "Golpes, caídas, líquidos o daños ocurridos después de recibir el equipo.",
  "Equipos abiertos, modificados o reparados por otra persona.",
  "Problemas de programas, virus o archivos que instalaste tú.",
  "El desgaste normal por uso después de la compra.",
];

const STEPS = [
  {
    title: "Escríbenos",
    text: "Por WhatsApp o correo, con tu número de pedido, qué le pasa al equipo y, si puedes, una foto o video de la falla.",
  },
  {
    title: "Lo revisamos contigo",
    text: "Te respondemos normalmente dentro de 2 días hábiles. Muchas veces se soluciona a distancia, sin enviar nada.",
  },
  {
    title: "Te mandamos el envío pagado",
    text: "Si hay que revisarlo, te enviamos la etiqueta de despacho pagada por TERC, desde cualquier parte de Chile.",
  },
  {
    title: "Tú eliges la solución",
    text: "Si la falla está cubierta, lo reparamos gratis, te lo cambiamos o te devolvemos el dinero. Tú decides.",
  },
];

export default function WarrantyPage() {
  const whatsapp = whatsappLink("Hola TERC, necesito ayuda con la garantía de mi pedido");
  return (
    <div className="shell max-w-3xl py-10 space-y-8 text-muted leading-relaxed">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Garantía y devoluciones</h1>
        <p>
          Queremos que compres tranquilo. Aquí te explicamos, en simple, qué cubre la garantía de tu equipo y cuándo
          devolvemos el dinero. Léela antes de comprar: al pagar, aceptas estas condiciones.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {SUMMARY.map((s) => (
          <li key={s.title} className="rounded-2xl bg-mint-50 border border-pine-700/15 p-5">
            <StoreIcon name={s.icon} className="w-6 h-6 text-pine-700" />
            <p className="mt-2 text-sm font-semibold text-ink">{s.title}</p>
            <p className="mt-1 text-sm">{s.text}</p>
          </li>
        ))}
      </ul>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">1. Qué significa que un equipo sea reacondicionado</h2>
        <p>
          Todos los equipos de TERC son <strong className="text-ink">usados y reacondicionados</strong>: no son
          nuevos. Antes de venderlos los revisamos uno por uno y nos aseguramos de que funcionen al 100%.
        </p>
        <p>
          Como ya tuvieron un primer dueño, pueden tener <strong className="text-ink">detalles estéticos leves</strong>,
          como pequeños roces o rayitas en la carcasa, que no afectan su funcionamiento. En la ficha de cada equipo
          indicamos su estado. Esos detalles informados no son una falla y no dan derecho a devolución.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">2. La garantía TERC</h2>
        <p>
          Cada equipo tiene la garantía que aparece en su ficha, contada desde el día en que lo recibes. Cubre las
          fallas técnicas que el equipo tenga y que no te hayamos informado antes de la compra.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-surface border border-line/[0.06] p-5">
            <p className="text-sm font-semibold text-ink">Sí cubre</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
              {COVERED.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-surface border border-line/[0.06] p-5">
            <p className="text-sm font-semibold text-ink">No cubre</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
              {NOT_COVERED.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
        <p>
          Si la falla está cubierta, <strong className="text-ink">tú eliges</strong> entre: reparar el equipo sin
          costo, cambiarlo por otro igual o equivalente, o que te devolvamos el dinero que pagaste por él. Los costos
          de envío de la garantía, de ida y de vuelta, los paga TERC.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">3. Sin devoluciones por arrepentimiento</h2>
        <p>
          Conforme al artículo 3 bis letra b) de la Ley 19.496, en las compras en terc.cl{" "}
          <strong className="text-ink">no aplica el derecho a retracto</strong>. Esto significa que no aceptamos
          devoluciones ni devolvemos el dinero si el equipo funciona bien y es como lo describimos, por ejemplo si
          cambiaste de opinión, encontraste otro más barato o esperabas un equipo nuevo.
        </p>
        <p>
          Esto no aplica si el equipo llega con una falla técnica o es distinto a lo que muestra la ficha: en ese
          caso lo solucionamos con la garantía. Si tienes dudas antes de comprar, escríbenos y te ayudamos a elegir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">4. Cómo pedir la garantía</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3 rounded-2xl bg-surface border border-line/[0.06] p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine text-sm font-semibold text-gold">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{s.title}</p>
                <p className="mt-1 text-sm">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p>
          Cuando nos envíes el equipo, mándalo con su cargador y bien embalado. Si al revisarlo vemos que la falla no
          está cubierta (por ejemplo, un golpe), te lo explicamos con fotos antes de hacer cualquier cosa.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">5. Si el paquete llega dañado</h2>
        <p>
          Revisa la caja apenas la recibas. Si viene abierta, mojada o golpeada, sácale fotos y escríbenos lo antes
          posible, idealmente el mismo día. Nosotros hacemos el reclamo con la empresa de envíos y lo solucionamos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">6. Cómo devolvemos el dinero</h2>
        <p>
          Cuando corresponde devolver el dinero, lo hacemos por el mismo medio con que pagaste (Mercado Pago o
          Webpay) y emitimos la nota de crédito de tu boleta o factura. El tiempo en que lo ves reflejado depende de
          tu banco o de Mercado Pago.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">7. Tus derechos</h2>
        <p>
          Vende {SITE.company}, a través de su marca TERC. Esta política no limita los derechos que te da la Ley
          19.496 sobre Protección de los Derechos de los Consumidores. Si no quedas conforme con nuestra respuesta,
          puedes acudir al{" "}
          <a href="https://www.sernac.cl" target="_blank" rel="noopener" className="underline">
            SERNAC
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-pine p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">¿Necesitas usar la garantía o tienes dudas?</p>
          <p className="text-sm text-white/75">Escríbenos y lo vemos contigo.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-pine hover:bg-mint-50"
            >
              <WhatsAppIcon className="w-5 h-5 text-[#25d366]" /> WhatsApp
            </a>
          )}
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
          >
            <StoreIcon name="mail" className="w-4 h-4" /> {SITE.email}
          </a>
        </div>
      </section>
    </div>
  );
}
