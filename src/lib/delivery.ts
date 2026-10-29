import { todayInChile } from "./format";
import { SITE } from "./site";

// Fecha estimada de llegada, en días hábiles (sin sábados ni domingos) desde hoy en Chile.
// Es aproximada: no cuenta feriados, por eso siempre se muestra como "aprox.".

const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function addBusinessDays(date: Date, days: number) {
  const d = new Date(date);
  while (days > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) days--;
  }
  return d;
}

export function deliveryWindow(onDemand: boolean, now = new Date()) {
  const [min, max] = SITE.deliveryDays[onDemand ? "onDemand" : "stock"];
  const today = new Date(`${todayInChile(now)}T12:00:00Z`);
  return { from: addBusinessDays(today, min), to: addBusinessDays(today, max) };
}

const dayMonth = (d: Date) => `${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;

// "entre el martes 3 y el jueves 5 de noviembre" (o "…31 de octubre y el martes 4 de noviembre").
export function deliveryText(onDemand: boolean, now = new Date()) {
  const { from, to } = deliveryWindow(onDemand, now);
  const first = from.getUTCMonth() === to.getUTCMonth() ? `${from.getUTCDate()}` : dayMonth(from);
  return `entre el ${DAYS[from.getUTCDay()]} ${first} y el ${DAYS[to.getUTCDay()]} ${dayMonth(to)}`;
}

// Versión corta: "entre el 3 y el 5 de noviembre".
export function deliveryShort(onDemand: boolean, now = new Date()) {
  const { from, to } = deliveryWindow(onDemand, now);
  const first = from.getUTCMonth() === to.getUTCMonth() ? `${from.getUTCDate()}` : dayMonth(from);
  return `entre el ${first} y el ${dayMonth(to)}`;
}
