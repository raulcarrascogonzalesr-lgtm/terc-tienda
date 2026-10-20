import Link from "next/link";
import { ClearCartOnSuccess } from "./ClearCartOnSuccess";

const MESSAGES: Record<string, { title: string; text: string }> = {
  exito: {
    title: "¡Gracias por tu compra!",
    text: "Recibimos tu pago. Te enviaremos un correo con el detalle y el seguimiento del envío.",
  },
  pendiente: {
    title: "Tu pago está en proceso",
    text: "Te avisaremos por correo apenas Mercado Pago lo confirme.",
  },
  error: {
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
    <div className="max-w-lg space-y-4">
      {estado === "exito" && <ClearCartOnSuccess />}
      <h1 className="text-2xl font-bold">{message.title}</h1>
      <p>{message.text}</p>
      <Link href={estado === "error" ? "/carrito" : "/"} className="text-brand underline">
        {estado === "error" ? "Volver al carrito" : "Seguir comprando"}
      </Link>
    </div>
  );
}
