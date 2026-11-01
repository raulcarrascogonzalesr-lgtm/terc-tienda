import type { Metadata } from "next";
import { StoreIcon, WhatsAppIcon, type IconName } from "@/components/icons";
import { Terqui } from "@/components/Terqui";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Garantía y devoluciones | TERC",
  description:
    "1 año de garantía en todos los equipos reacondicionados de TERC y soporte por WhatsApp. Qué cubre, cuándo devolvemos el dinero y cómo pedirla.",
};

// Resumen que se lee de un vistazo, antes del detalle.
const SUMMARY: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "shield",
    title: "1 año de garantía",
    text: "Todos nuestros equipos tienen 12 meses de garantía, contados desde que lo recibes.",
  },
  {
    icon: "repair",
    title: "Si falla, lo solucionamos",
    text: "Reparación gratis, cambio o devolución del dinero. Los envíos los pagamos nosotros.",
  },
  {
    icon: "chat",
    title: "Soporte por WhatsApp",
    text: "Personas reales te ayudan con cualquier duda de tu equipo, antes y después de la garantía.",
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
  "El desgaste de la batería después de los primeros 6 meses.",
];

const STEPS = [
  {
    title: "Escríbenos",
    text: "Por WhatsApp o correo, con tu número de pedido, qué le pasa al equipo y, si puedes, una foto o video de la falla.",
  },
  {
    title: "Lo revisamos contigo",
    text: "Te respondemos por WhatsApp, normalmente el mismo día. Muchas veces se soluciona a distancia o en una videollamada, sin enviar nada.",
  },
  {
    title: "Te mandamos el envío pagado",
    text: "Si hay que revisarlo, te enviamos la etiqueta de despacho pagada por TERC, desde cualquier parte de Chile.",
  },
  {
    title: "Lo solucionamos",
    text: "Si la falla está cubierta, lo reparamos gratis, te lo cambiamos o te devolvemos el dinero, según el tramo de la garantía.",
  },
];

export default function WarrantyPage() {
  const whatsapp = whatsappLink("Hola TERC, necesito ayuda con la garantía de mi pedido");
  return (
    <div className="shell max-w-3xl py-10 space-y-8 text-muted leading-relaxed">
      <div className="relative overflow-hidden rounded-[2rem] bg-pine p-7 text-white sm:p-10">
        <StoreIcon name="shield" className="absolute -right-10 -top-6 h-64 w-64 text-white/[0.05]" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">Garantía y devoluciones</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl font-extrabold leading-none tracking-tight text-gold sm:text-7xl">
          1 año de garantía
        </h1>
        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight sm:text-3xl">
          en cada equipo, y soporte por WhatsApp.
        </p>
        <p className="mt-3 max-w-xl text-white/80">
          Queremos que compres tranquilo. Aquí te explicamos, en simple, qué cubre la garantía de tu equipo y cuándo
          devolvemos el dinero. Léela antes de comprar: al pagar, aceptas estas condiciones.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
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
          La mayoría llega en excelente estado, sin marcas visibles. Cuando un equipo tiene{" "}
          <strong className="text-ink">detalles estéticos leves</strong>, como pequeños roces o rayitas en la
          carcasa que no afectan su funcionamiento, lo indicamos claramente en su ficha. Esos detalles informados no
          son una falla y no dan derecho a devolución.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">2. La garantía TERC</h2>
        <p>
          Todos los equipos de TERC tienen <strong className="text-ink">1 año de garantía (12 meses)</strong>, contado
          desde el día en que recibes tu pedido. Cubre las fallas técnicas que el equipo tenga y que no te hayamos
          informado antes de la compra.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-mint-50 border border-pine-700/15 p-5">
            <p className="text-sm font-semibold text-ink">Primeros 6 meses</p>
            <p className="mt-1 text-sm">
              Si la falla está cubierta, <strong className="text-ink">tú eliges</strong>: reparar el equipo sin costo,
              cambiarlo por otro igual o equivalente, o que te devolvamos el dinero que pagaste por él.
            </p>
          </div>
          <div className="rounded-2xl bg-mint-50 border border-pine-700/15 p-5">
            <p className="text-sm font-semibold text-ink">Del mes 7 al mes 12</p>
            <p className="mt-1 text-sm">
              Reparamos el equipo sin costo. Si no se puede reparar, te lo cambiamos por uno igual o mejor. Y si tampoco
              tenemos uno para cambiarlo, te devolvemos el dinero.
            </p>
          </div>
        </div>
        <p>
          <strong className="text-ink">Batería y cargador.</strong> Tienen 6 meses de garantía, porque se gastan con el
          uso, igual que los neumáticos de un auto. Si en esos 6 meses la batería deja de cargar o dura mucho menos de
          lo informado en la ficha, la cambiamos.
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
          En los dos tramos, los envíos de ida y vuelta de la garantía los paga TERC, desde cualquier parte de Chile.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">3. {SITE.support.name}</h2>
        <div className="rounded-3xl bg-mint-50 px-2 pt-3">
          <Terqui
            pose="soporte"
            crop="escritorio"
            className="mx-auto block h-auto w-full max-w-[420px]"
            title="Terqui con audífonos en su escritorio, atendiendo a un cliente por WhatsApp"
          />
        </div>
        <p>
          Comprar en TERC no termina cuando llega tu equipo. Si tienes una duda, algo no te funciona o necesitas ayuda
          para configurarlo, escríbenos por WhatsApp: te responde una persona del equipo TERC, no un bot.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: "chat" as IconName,
              title: "Qué te ayudamos a resolver",
              text: "Dudas de uso, configuración inicial (Windows, correo, impresora, Wi-Fi), problemas que aparezcan y revisar si algo está cubierto por la garantía.",
            },
            {
              icon: "video" as IconName,
              title: "Asesoría por videollamada",
              text: `Si es más fácil verlo juntos, agendamos una videollamada gratis de hasta ${SITE.support.videoCallMinutes} minutos.`,
            },
            {
              icon: "clock" as IconName,
              title: "Horario",
              text: `${SITE.support.hours}. Te respondemos el mismo día dentro de ese horario. Si escribes fuera de horario o un domingo, te respondemos al día siguiente desde las 9:00.`,
            },
            {
              icon: "heart" as IconName,
              title: "Para quién",
              text: "Para todos los que compraron un equipo en TERC, durante la garantía y después.",
            },
          ].map((item) => (
            <li key={item.title} className="flex gap-3 rounded-2xl bg-surface border border-line/[0.06] p-5">
              <StoreIcon name={item.icon} className="mt-0.5 h-6 w-6 text-pine-700" />
              <div>
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">4. Sin devoluciones por arrepentimiento</h2>
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
        <h2 className="text-lg font-semibold text-ink">5. Cómo pedir la garantía</h2>
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
        <h2 className="text-lg font-semibold text-ink">6. Si el paquete llega dañado</h2>
        <p>
          Revisa la caja apenas la recibas. Si viene abierta, mojada o golpeada, sácale fotos y escríbenos lo antes
          posible, idealmente el mismo día. Nosotros hacemos el reclamo con la empresa de envíos y lo solucionamos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">7. Cómo devolvemos el dinero</h2>
        <p>
          Cuando corresponde devolver el dinero, lo hacemos por el mismo medio con que pagaste (Mercado Pago o
          Webpay) y emitimos la nota de crédito de tu boleta o factura. El tiempo en que lo ves reflejado depende de
          tu banco o de Mercado Pago.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">8. Tus derechos</h2>
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
