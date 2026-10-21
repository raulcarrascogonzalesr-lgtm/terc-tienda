import type { MovementKind } from "@/lib/types";
import { ICONS } from "../icons";

// Las cuatro cosas que pueden pasar con la plata, en palabras simples.
export type IntentKey = "entrada" | "compra" | "gasto" | "devolucion";

type Option = { label: string; help: string };

export const INTENTS: Record<
  IntentKey,
  {
    title: string;
    text: string;
    icon: string;
    kind: MovementKind;
    options: Record<string, Option>;
    documents: boolean;
  }
> = {
  entrada: {
    title: "Entró plata al negocio",
    text: "El préstamo de tu papá, un aporte o cualquier ingreso que no sea una venta de la web.",
    icon: ICONS.entrada,
    kind: "ingreso",
    documents: false,
    options: {
      prestamo: { label: "Préstamo recibido", help: "Plata que te prestan y que vas a devolver." },
      aporte: { label: "Aporte de capital", help: "Plata que se invierte y no se devuelve." },
      otro_ingreso: { label: "Otro ingreso", help: "Por ejemplo, un reembolso." },
    },
  },
  compra: {
    title: "Compré equipos para vender",
    text: "Notebooks, celulares o accesorios del proveedor. Pasan a ser tu stock.",
    icon: ICONS.compra,
    kind: "egreso",
    documents: true,
    options: {
      compra_equipos: { label: "Compra de equipos", help: "" },
    },
  },
  gasto: {
    title: "Pagué un gasto",
    text: "Publicidad, envíos, comisiones, hosting, reparaciones y otros gastos del negocio.",
    icon: ICONS.gasto,
    kind: "egreso",
    documents: true,
    options: {
      publicidad: { label: "Publicidad", help: "Anuncios en Instagram, Facebook, Google…" },
      envios: { label: "Envíos", help: "Starken, Chilexpress, Blue Express…" },
      comisiones: { label: "Comisiones", help: "Lo que cobra Mercado Pago o Mercado Libre." },
      garantia: { label: "Garantías y reparaciones", help: "Arreglar o cambiar un equipo." },
      herramientas: { label: "Hosting y servicios", help: "Hosting, dominio, programas." },
      otro_gasto: { label: "Otro gasto", help: "Cualquier otro gasto del negocio." },
    },
  },
  devolucion: {
    title: "Le devolví plata a mi papá",
    text: "Un abono al préstamo. Baja la deuda y no cuenta como gasto.",
    icon: ICONS.devolucion,
    kind: "egreso",
    documents: false,
    options: {
      devolucion_prestamo: { label: "Devolución del préstamo", help: "" },
    },
  },
};

export function isIntent(value: string | undefined): value is IntentKey {
  return !!value && value in INTENTS;
}
