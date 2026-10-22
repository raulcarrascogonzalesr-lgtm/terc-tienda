import Link from "next/link";
import { Terqui, type TerquiPose } from "@/components/Terqui";
import { ClearCartOnSuccess } from "./ClearCartOnSuccess";

const MESSAGES: Record<string, { title: string; text: string; pose: TerquiPose }> = {
  exito: {
    pose: "listo",
    title: "¡Gracias por tu compra!",
    text: "Recibimos tu pago. Te enviaremos un correo con el detalle y el seguimiento del envío.",
  },
  pendiente: {
    pose: "hola",
    title: "Tu pago está en proceso",
    text: "Te avisaremos por correo apenas Mercado Pago lo confirme.",
  },
  error: {
    pose: "apunta",
    title: "El pago no se completó",
    text: "No se hizo ningún cargo. Puedes volver al carrito e intentarlo de nuevo.",
  },
};

export default async function PaymentResultPage({
  params,
}: {
  params: Promise<{ estado: string }>;
}) {
  const { estado } = await params;
  const message = MESSAGES[estado] ?? MESSAGES.error;

  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col items-center text-center">
      {estado === "exito" && <ClearCartOnSuccess />}
      <Terqui pose={message.pose} className="w-40 h-40" />
      <h1 className="mt-2 text-2xl font-bold text-ink">{message.title}</h1>
      <p className="mt-2 text-muted">{message.text}</p>
      <Link
        href={estado === "error" ? "/carrito" : "/"}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition hover:bg-pine-700"
      >
        {estado === "error" ? "Volver al carrito" : "Seguir comprando"}
      </Link>
    </div>
  );
}
