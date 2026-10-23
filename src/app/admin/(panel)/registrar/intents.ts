import type { MovementKind } from "@/lib/types";
import { ICONS } from "../icons";

// Las cosas que pueden pasar con la plata, en palabras simples.
export type IntentKey = "entrada" | "venta" | "compra" | "gasto" | "reembolso" | "devolucion";

// Qué documento pide cada una: de compra (factura, boleta…), de venta o nota de crédito.
export type DocMode = "compra" | "venta" | "nota" | null;

type Option = { label: string; help: string };

export const INTENTS: Record<
  IntentKey,
  {
    title: string;
    text: string;
    icon: string;
    kind: MovementKind;
    options: Record<string, Option>;
    docs: DocMode;
  }
> = {
  entrada: {
    title: "Entró plata al negocio",
    text: "El préstamo de tu papá, un aporte o cualquier ingreso que no sea una venta.",
    icon: ICONS.entrada,
    kind: "ingreso",
    docs: null,
    options: {
      prestamo: { label: "Préstamo recibido", help: "Plata que te prestan y que vas a devolver." },
      aporte: { label: "Aporte de capital", help: "Plata que se invierte y no se devuelve." },
      otro_ingreso: { label: "Otro ingreso", help: "Por ejemplo, un reembolso." },
    },
  },
  venta: {
    title: "Vendí fuera de la web",
    text: "Una venta a un conocido, por WhatsApp o en persona. Igual lleva boleta o factura.",
    icon: ICONS.venta,
    kind: "ingreso",
    docs: "venta",
    options: {
      venta_directa: { label: "Venta fuera de la web", help: "" },
    },
  },
  compra: {
    title: "Compré equipos para vender",
    text: "Notebooks, celulares o accesorios del proveedor. Pasan a ser tu stock.",
    icon: ICONS.compra,
    kind: "egreso",
    docs: "compra",
    options: {
      compra_equipos: { label: "Compra de equipos", help: "" },
    },
  },
  gasto: {
    title: "Pagué un gasto",
    text: "Publicidad, envíos, comisiones, cajas, hosting, reparaciones y otros gastos del negocio.",
    icon: ICONS.gasto,
    kind: "egreso",
    docs: "compra",
    options: {
      publicidad: { label: "Publicidad", help: "Anuncios en Instagram, Facebook, Google…" },
      envios: { label: "Envíos", help: "Starken, Chilexpress, Blue Express…" },
      comisiones: { label: "Comisiones", help: "Lo que cobra Mercado Pago, Transbank (Webpay) o Mercado Libre." },
      garantia: { label: "Garantías y reparaciones", help: "Arreglar o cambiar un equipo." },
      herramientas: { label: "Hosting y servicios", help: "Hosting, dominio, programas." },
      embalaje: { label: "Cajas y embalaje", help: "Cajas con logo, plumavit, cinta, stickers." },
      otro_gasto: { label: "Otro gasto", help: "Cualquier otro gasto del negocio." },
    },
  },
  reembolso: {
    title: "Le devolví plata a un cliente",
    text: "Una devolución con nota de crédito. Resta de tus ventas y del IVA.",
    icon: ICONS.reembolso,
    kind: "egreso",
    docs: "nota",
    options: {
      devolucion_cliente: { label: "Devolución a un cliente", help: "" },
    },
  },
  devolucion: {
    title: "Le devolví plata a mi papá",
    text: "Un abono al préstamo. Baja la deuda y no cuenta como gasto.",
    icon: ICONS.devolucion,
    kind: "egreso",
    docs: null,
    options: {
      devolucion_prestamo: { label: "Devolución del préstamo", help: "" },
    },
  },
};

export function isIntent(value: string | undefined): value is IntentKey {
  return !!value && value in INTENTS;
}
