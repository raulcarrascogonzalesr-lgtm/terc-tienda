import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Terqui } from "@/components/Terqui";
import { readUnsubscribeLink, unsubscribe } from "@/lib/email-preferences";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dejar de recibir correos | TERC",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function confirm(form: FormData) {
  "use server";
  const e = String(form.get("e") ?? "");
  const t = String(form.get("t") ?? "");
  const email = readUnsubscribeLink(e, t);
  const ok = email ? await unsubscribe(email) : false;
  redirect(`/correos/baja?e=${encodeURIComponent(e)}&t=${encodeURIComponent(t)}&${ok ? "listo=1" : "error=1"}`);
}

// Se pide confirmar con un botón (y no al abrir el enlace) porque algunos antivirus de correo
// abren los enlaces solos y darían de baja a la persona sin querer.
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const e = one(params.e) ?? "";
  const t = one(params.t) ?? "";
  const email = readUnsubscribeLink(e, t);

  let title: string;
  let body: React.ReactNode;
  if (!email) {
    title = "Este enlace no funciona";
    body = (
      <p>
        Puede que se haya cortado al copiarlo. Escríbenos a{" "}
        <a href={`mailto:${SITE.email}`} className="underline">
          {SITE.email}
        </a>{" "}
        y te sacamos de la lista a mano.
      </p>
    );
  } else if (one(params.listo)) {
    title = "Listo, no te escribiremos más";
    body = (
      <p>
        <strong>{email}</strong> ya no recibirá consejos ni novedades de TERC. Si tienes un pedido en curso, igual te
        avisaremos cuando se pague, se envíe y llegue.
      </p>
    );
  } else {
    title = "¿Dejar de recibir correos de TERC?";
    body = (
      <>
        <p>
          <strong>{email}</strong> dejará de recibir consejos y novedades. Los correos de un pedido
          en curso (pago, envío y entrega) igual te llegarán.
        </p>
        {one(params.error) && <p className="text-red-700">No pudimos guardarlo. Intenta de nuevo en un rato.</p>}
        <form action={confirm} className="pt-2">
          <input type="hidden" name="e" value={e} />
          <input type="hidden" name="t" value={t} />
          <button
            type="submit"
            className="rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition hover:bg-cta"
          >
            Sí, no quiero recibir más correos
          </button>
        </form>
      </>
    );
  }

  return (
    <div className="shell max-w-lg py-12 text-center space-y-4 text-muted leading-relaxed">
      <Terqui pose={one(params.listo) ? "hola" : "duda"} className="mx-auto w-36 h-36" />
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      {body}
      <p className="pt-4 text-sm">
        <Link href="/" className="underline">
          Volver a la tienda
        </Link>
      </p>
    </div>
  );
}
