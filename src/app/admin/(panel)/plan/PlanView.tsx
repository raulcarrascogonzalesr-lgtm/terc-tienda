"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { formatCLP } from "@/lib/format";
import { addDadCardMove, deleteMovement } from "../actions";
import { ConfirmButton } from "../ConfirmButton";
import { LINES, OPENING_QUOTA, SPEND, type Line, type PlanMonth, type SpendKey } from "../plan";

// Colores de cada línea de negocio y de cada gasto: iguales en toda la página.
const LINE_COLOR: Record<Line, string> = {
  bat: "#e9a400",
  inv: "#eb6834",
  ene: "#7d9a2b",
  pc: "#2f7fd1",
  emp: "#8657d3",
};
const SPEND_COLOR: Record<SpendKey, string> = {
  google: "#4285f4",
  meta: "#c13584",
  otra_publicidad: "#f28b82",
  envios: "#14a3a3",
  comisiones: "#9aa3a0",
  embalaje: "#b3a26a",
  otros: "#6b716f",
};
const STRONG: Line[] = ["bat", "inv"];
const SIM_LINES: Line[] = ["bat", "inv", "pc", "emp"];
const ONE: Record<Line, string> = {
  bat: "batería",
  inv: "inversor",
  ene: "equipo de energía",
  pc: "computador",
  emp: "venta a empresa",
};
const RED = "#d23c2c";
const GREEN = "#0f8a47";

type Month = PlanMonth & { label: string; short: string };
type CardLog = { id: string; date: string; repayment: boolean; amount: number; text: string };

const LINE_KEYS = Object.keys(LINES) as Line[];
const SPEND_KEYS = Object.keys(SPEND) as SpendKey[];
const emptySim = (): Record<Line, number> => ({ bat: 0, inv: 0, ene: 0, pc: 0, emp: 0 });

function useTip() {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const on = (text: string) => ({
    onMouseMove: (e: React.MouseEvent) => setTip({ x: e.clientX, y: e.clientY, text }),
    onMouseLeave: () => setTip(null),
  });
  const node = tip ? (
    <div
      className="fixed z-50 pointer-events-none rounded-lg bg-[#0a2a2a] text-white text-xs px-2.5 py-1.5 max-w-[240px] shadow-lg"
      style={{ left: Math.min(tip.x + 12, window.innerWidth - 250), top: tip.y + 14 }}
    >
      {tip.text}
    </div>
  ) : null;
  return { on, node };
}

export function PlanView({
  months,
  current,
  units,
  card,
  opening,
  googleCampaigns,
  today,
}: {
  months: Month[];
  current: string;
  units: Record<Line, number>;
  card: { charged: number; repaid: number; owed: number; log: CardLog[] };
  opening: { spent: number; repaid: number };
  googleCampaigns: { id: string; name: string }[];
  today: string;
}) {
  const [selected, setSelected] = useState(months[months.length - 1].month);
  const [sim, setSim] = useState(emptySim);
  const [quota, setQuota] = useState(true);
  const { on, node: tipNode } = useTip();

  const month = months.find((m) => m.month === selected) ?? months[months.length - 1];
  const simulating = SIM_LINES.some((k) => sim[k] > 0);
  const quotaAmount = quota ? OPENING_QUOTA : 0;

  const totals = (m: Month, withSim: boolean) => {
    const profit = Object.fromEntries(
      LINE_KEYS.map((k) => [k, Math.max(m.profit[k], 0) + (withSim ? sim[k] * units[k] : 0)]),
    ) as Record<Line, number>;
    // Si una línea perdió plata (por ejemplo, una devolución), se suma como gasto.
    const losses = LINE_KEYS.reduce((s, k) => s + Math.max(-m.profit[k], 0), 0);
    const gain = LINE_KEYS.reduce((s, k) => s + profit[k], 0);
    // La cuota de apertura corre en el mes actual y en los meses con movimiento (no antes de abrir).
    const active = m.month === current || m.totalSpend > 0 || LINE_KEYS.some((k) => m.sales[k] > 0);
    const spend = m.totalSpend + losses + (active ? quotaAmount : 0);
    return { profit, gain, spend };
  };

  const { profit, gain, spend } = totals(month, true);
  const diff = gain - spend;
  const scale = Math.max(spend * 1.6, gain * 1.08, 1);
  const zeroPct = (spend / scale) * 100;
  const isCurrent = month.month === current;

  function pick(m: string) {
    setSelected(m);
    setSim(emptySim());
  }

  return (
    <div className="space-y-6">
      {/* Mes */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Elegir mes">
        {months.map((m) => (
          <button
            key={m.month}
            type="button"
            onClick={() => pick(m.month)}
            aria-pressed={m.month === selected}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold first-letter:uppercase transition ${
              m.month === selected
                ? "bg-[#0a2a2a] text-white border-[#0a2a2a]"
                : "bg-white text-[#0a2a2a] border-[#e4e2dc] hover:border-[#b5b2a8]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Barra de equilibrio */}
      <section className="bg-white rounded-xl border border-[#e4e2dc] p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-[22px] sm:text-[30px] font-bold leading-tight tracking-tight text-[#0a2a2a] max-w-3xl">
            {diff < 0 ? (
              <>
                {isCurrent ? "Llevas" : "Hiciste"}{" "}
                <span style={{ color: GREEN }}>{formatCLP(gain)}</span> de ganancia.{" "}
                {isCurrent ? "Te faltan" : "Faltaron"}{" "}
                <span style={{ color: RED }}>{formatCLP(-diff)}</span> para quedar en 0
              </>
            ) : spend === 0 && gain === 0 ? (
              <>Todavía no hay ventas ni gastos en este mes</>
            ) : (
              <>
                ¡Cubriste los gastos! {isCurrent ? "Ya vas" : "Quedaste"}{" "}
                <span style={{ color: GREEN }}>{formatCLP(diff)}</span> en ganancia
              </>
            )}
          </p>
          <span
            className="rounded-full px-3 py-1 text-sm font-bold"
            style={
              diff < 0
                ? { background: "#fde8e5", color: RED }
                : { background: "#e3f4ea", color: GREEN }
            }
          >
            {diff < 0 ? "Zona roja" : "Zona verde"}
            {simulating && " · simulado"}
          </span>
        </div>

        <div className="relative mt-10 mb-2 h-12">
          <div className="absolute inset-0 flex rounded-xl overflow-hidden">
            <div
              className="bg-[#fbd9d3] transition-all duration-500"
              style={{ width: `${zeroPct}%` }}
              {...on(`Gastos del mes: ${formatCLP(spend)}. Hasta aquí todavía no ganas nada.`)}
            />
            <div className="flex-1 bg-[#d6f0e0]" {...on("Todo lo que llegue aquí es ganancia")} />
          </div>
          <div
            className="absolute left-0 top-[7px] bottom-[7px] flex rounded-lg overflow-hidden transition-all duration-500"
            style={{ width: `${(gain / scale) * 100}%` }}
          >
            {LINE_KEYS.filter((k) => profit[k] > 0).map((k) => (
              <span
                key={k}
                className="h-full transition-all duration-500 hover:brightness-110"
                style={{ width: `${(profit[k] / gain) * 100}%`, background: LINE_COLOR[k] }}
                {...on(`${LINES[k]}: ${formatCLP(profit[k])} de ganancia`)}
              />
            ))}
          </div>
          <div
            className="absolute -top-6 -bottom-1.5 border-l-[3px] border-dashed border-[#0a2a2a] transition-all duration-500"
            style={{ left: `${zeroPct}%` }}
          >
            <b className="absolute -top-0.5 left-1.5 whitespace-nowrap text-xs">
              Punto 0 · {formatCLP(spend)}
            </b>
          </div>
        </div>
        <div className="flex justify-between text-xs font-semibold">
          <span style={{ color: RED }}>Zona roja: aún no cubres los gastos</span>
          <span style={{ color: GREEN }}>Zona verde: ganancia</span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-sm">
          {LINE_KEYS.map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <i className="inline-block w-3 h-3 rounded-[3px]" style={{ background: LINE_COLOR[k] }} />
              {LINES[k]}
            </span>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-dashed border-[#e4e2dc] flex flex-wrap items-center gap-2">
          <span className="font-semibold text-sm mr-1">¿Y si vendo…?</span>
          {SIM_LINES.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSim((s) => ({ ...s, [k]: s[k] + 1 }))}
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold transition hover:brightness-110 active:scale-95"
              style={{ background: LINE_COLOR[k], color: k === "bat" || k === "inv" ? "#0a2a2a" : "#fff" }}
              {...on(`Ganancia típica de una venta de ${LINES[k].toLowerCase()} en tu catálogo, sin IVA`)}
            >
              +1 {ONE[k]} (~{formatCLP(units[k])})
              {sim[k] > 0 && <span className="ml-1.5 rounded-full bg-white/70 px-1.5 text-[#0a2a2a]">×{sim[k]}</span>}
            </button>
          ))}
          {simulating && (
            <button
              type="button"
              onClick={() => setSim(emptySim())}
              className="rounded-full border border-[#e4e2dc] px-3.5 py-1.5 text-sm font-semibold text-[#6b716f] hover:border-[#b5b2a8]"
            >
              Borrar simulación
            </button>
          )}
          <label className="flex items-center gap-2 sm:ml-auto text-sm text-[#6b716f] cursor-pointer">
            <input
              type="checkbox"
              checked={quota}
              onChange={(e) => setQuota(e.target.checked)}
              className="h-4 w-4 accent-[#0f8a47]"
            />
            Incluir cuota de apertura ({formatCLP(OPENING_QUOTA)})
          </label>
        </div>
      </section>

      {/* Ganancia por línea */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3" aria-label="Ganancia por línea">
        {LINE_KEYS.map((k) => {
          const n = month.sales[k] + sim[k];
          const need = diff < 0 && units[k] > 0 ? Math.ceil(-diff / units[k]) : 0;
          return (
            <div
              key={k}
              className="bg-white rounded-xl border border-[#e4e2dc] border-t-[5px] p-4 min-w-0"
              style={{ borderTopColor: LINE_COLOR[k] }}
            >
              <p className="text-sm font-semibold flex flex-wrap items-center gap-1.5">
                {LINES[k]}
                {STRONG.includes(k) && (
                  <span className="rounded-full bg-[#f6f5f1] px-2 text-[11px] font-bold">fuerte</span>
                )}
              </p>
              <p className="text-[22px] font-bold tabular-nums" style={{ color: LINE_COLOR[k] }}>
                {formatCLP(profit[k])}
              </p>
              <p className="text-xs text-[#6b716f]">
                {n} {n === 1 ? "venta" : "ventas"}
                {need > 0 && SIM_LINES.includes(k) && ` · con ${need} más llegas al 0`}
              </p>
            </div>
          );
        })}
      </section>
      <p className="text-xs text-[#6b716f] -mt-3">
        Ganancia = lo cobrado sin IVA menos lo que te costó el equipo. Empresas = computadores vendidos
        con factura. Baterías, inversores y otra energía se cuentan por producto.
        {month.missingCost && (
          <span className="text-[#7a5200]">
            {" "}
            ! Hay ventas de productos sin costo cargado: la ganancia aparece más alta de lo real.
          </span>
        )}
      </p>

      <div className="grid lg:grid-cols-2 gap-4">
        <SpendCard month={month} quota={quotaAmount} on={on} />
        <DadCard card={card} googleCampaigns={googleCampaigns} today={today} />
      </div>

      <OpeningCard opening={opening} />

      <MonthsChart months={months} selected={selected} totals={totals} pick={pick} on={on} />
      {tipNode}
    </div>
  );
}

type On = (text: string) => {
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
};

function SpendCard({ month, quota, on }: { month: Month; quota: number; on: On }) {
  const total = month.totalSpend;
  return (
    <section className="bg-white rounded-xl border border-[#e4e2dc] p-5 sm:p-6 min-w-0">
      <h2 className="text-[15px] font-semibold">Invertido este mes</h2>
      <p className="text-sm text-[#6b716f] mb-3">
        Gastos del mes sin la apertura. Pasa el mouse por los colores.
      </p>
      <div className="flex h-6 rounded-lg overflow-hidden bg-[#f6f5f1] mb-4">
        {SPEND_KEYS.filter((k) => month.spend[k] > 0).map((k) => (
          <span
            key={k}
            className="h-full transition-all duration-500 hover:brightness-110"
            style={{ width: `${(month.spend[k] / total) * 100}%`, background: SPEND_COLOR[k] }}
            {...on(`${SPEND[k]}: ${formatCLP(month.spend[k])} (${Math.round((month.spend[k] / total) * 100)}%)`)}
          />
        ))}
      </div>
      <div className="space-y-1.5 text-sm">
        {SPEND_KEYS.filter((k) => month.spend[k] > 0 || k === "google" || k === "meta").map((k) => (
          <div key={k} className="flex justify-between gap-3">
            <span className="inline-flex items-center gap-2">
              <i className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: SPEND_COLOR[k] }} />
              {SPEND[k]}
              {k === "google" && <span className="text-[#6b716f]">· tarjeta del papá</span>}
            </span>
            <span className="tabular-nums">{formatCLP(month.spend[k])}</span>
          </div>
        ))}
        <div className="flex justify-between gap-3 font-bold border-t border-[#e4e2dc] pt-2 mt-1">
          <span>Total del mes</span>
          <span className="tabular-nums">{formatCLP(total)}</span>
        </div>
        {quota > 0 && (
          <p className="text-xs text-[#6b716f]">
            + {formatCLP(quota)} de cuota de apertura en la barra de arriba.
          </p>
        )}
      </div>
      <p className="text-xs text-[#6b716f] mt-3">
        Para anotar un gasto usa{" "}
        <Link href="/admin/registrar?tipo=gasto" className="underline">
          Pagué un gasto
        </Link>
        . Los de Google con la tarjeta del papá, en el recuadro de al lado.
      </p>
    </section>
  );
}

function DadCard({
  card,
  googleCampaigns,
  today,
}: {
  card: { charged: number; repaid: number; owed: number; log: CardLog[] };
  googleCampaigns: { id: string; name: string }[];
  today: string;
}) {
  const [state, action, pending] = useActionState(addDadCardMove, null);
  const [amount, setAmount] = useState("");
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state && "ok" in state) setAmount("");
  }, [state]);
  const paidPct = card.charged ? Math.min(100, (card.repaid / card.charged) * 100) : 100;

  return (
    <section className="bg-white rounded-xl border border-[#e4e2dc] p-5 sm:p-6 min-w-0">
      <h2 className="text-[15px] font-semibold">Tarjeta de tu papá · Google Ads</h2>
      <p className="text-sm text-[#6b716f] mb-2">
        Lo que Google cobró a su tarjeta menos lo que ya le devolviste.
      </p>
      <p className="text-[30px] font-extrabold tabular-nums" style={{ color: card.owed > 0 ? RED : GREEN }}>
        {card.owed > 0 ? `Le debes ${formatCLP(card.owed)}` : card.charged ? "¡Estás al día!" : "Sin cobros todavía"}
      </p>
      <div className="h-3 rounded-full bg-[#fde8e5] overflow-hidden my-2">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${paidPct}%`, background: GREEN }} />
      </div>
      <p className="text-sm text-[#6b716f]">
        Devuelto <b className="text-[#0a2a2a]">{formatCLP(card.repaid)}</b> de{" "}
        <b className="text-[#0a2a2a]">{formatCLP(card.charged)}</b>
      </p>

      <form ref={form} action={action} className="mt-4 flex flex-wrap items-end gap-2">
        <label className="text-xs text-[#6b716f]">
          Monto
          <input
            name="amount"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ej: 30.000"
            value={amount ? Number(amount).toLocaleString("es-CL") : ""}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            className="input block w-32 mt-1 tabular-nums"
          />
        </label>
        <label className="text-xs text-[#6b716f]">
          Fecha
          <input name="date" type="date" defaultValue={today} max={today} className="input block w-40 mt-1" />
        </label>
        {googleCampaigns.length > 0 && (
          <label className="text-xs text-[#6b716f]">
            Campaña (opcional)
            <select name="campaign_id" defaultValue="" className="input block w-44 mt-1">
              <option value="">Sin campaña</option>
              {googleCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            name="type"
            value="cobro"
            disabled={pending || !amount}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "#4285f4" }}
          >
            + Cobro de Google
          </button>
          <button
            type="submit"
            name="type"
            value="devolucion"
            disabled={pending || !amount}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: GREEN }}
          >
            + Le devolví
          </button>
        </div>
      </form>
      {state && "error" in state && <p className="text-sm text-[#b3362a] mt-2">{state.error}</p>}
      <p className="text-xs text-[#6b716f] mt-2">
        El cobro lo ves en Google Ads → Facturación → Transacciones. No sale de tu caja: es deuda con tu papá.
      </p>

      {card.log.length > 0 && (
        <ul className="mt-3 max-h-44 overflow-auto text-sm divide-y divide-[#efede8]">
          {card.log.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 py-1.5">
              <span className="min-w-0 truncate">
                <span className="text-[#6b716f] tabular-nums">{m.date.split("-").reverse().slice(0, 2).join("-")}</span>{" "}
                · {m.repayment ? "Le devolví" : "Cobro Google"}
              </span>
              <span className="flex items-center gap-3 shrink-0">
                <span className="tabular-nums font-semibold" style={{ color: m.repayment ? GREEN : "#0a2a2a" }}>
                  {m.repayment ? "−" : "+"}
                  {formatCLP(m.amount)}
                </span>
                <form action={deleteMovement.bind(null, m.id)}>
                  <ConfirmButton message="¿Borrar este registro?" className="text-xs text-[#a3a8a5] hover:text-[#b3362a]">
                    Borrar
                  </ConfirmButton>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OpeningCard({ opening }: { opening: { spent: number; repaid: number } }) {
  const left = Math.max(opening.spent - opening.repaid, 0);
  const pct = opening.spent ? Math.min(100, (opening.repaid / opening.spent) * 100) : 0;
  return (
    <section className="bg-white rounded-xl border border-[#e4e2dc] p-5 sm:p-6">
      <h2 className="text-[15px] font-semibold">Apertura · se devuelve con el tiempo</h2>
      <p className="text-sm text-[#6b716f] mb-3 max-w-3xl">
        Lo que costó partir la tienda (cajas con logo, burbuja, dominio, el primer empujón de publicidad).
        No se mezcla con los meses: cada mes devuelves una cuota. Lo devuelto sale de{" "}
        <Link href="/admin/registrar?tipo=devolucion" className="underline">
          Le devolví plata a mi papá
        </Link>
        .
      </p>
      {opening.spent === 0 ? (
        <p className="text-sm rounded-lg bg-[#fdf1d6] text-[#7a5200] px-3 py-2">
          Todavía no hay gastos marcados como apertura. En{" "}
          <Link href="/admin/finanzas" className="underline font-medium">
            Caja
          </Link>{" "}
          aprieta “Es apertura” en los gastos que fueron para partir.
        </p>
      ) : (
        <>
          <div className="h-4 rounded-full bg-[#fde8e5] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: GREEN }} />
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-sm mt-2">
            <span>
              Devuelto <b>{formatCLP(Math.min(opening.repaid, opening.spent))}</b> de{" "}
              <b>{formatCLP(opening.spent)}</b>
            </span>
            <span className="text-[#6b716f]">
              {left > 0
                ? `Faltan ${formatCLP(left)} · a ${formatCLP(OPENING_QUOTA)} al mes terminas en ${Math.ceil(left / OPENING_QUOTA)} ${Math.ceil(left / OPENING_QUOTA) === 1 ? "mes" : "meses"}`
                : "¡Apertura devuelta!"}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

function MonthsChart({
  months,
  selected,
  totals,
  pick,
  on,
}: {
  months: Month[];
  selected: string;
  totals: (m: Month, withSim: boolean) => { gain: number; spend: number };
  pick: (m: string) => void;
  on: On;
}) {
  const data = months.map((m) => ({ m, ...totals(m, m.month === selected) }));
  const max = Math.max(...data.map((d) => Math.max(d.gain, d.spend)), 1);
  return (
    <section className="bg-white rounded-xl border border-[#e4e2dc] p-5 sm:p-6">
      <h2 className="text-[15px] font-semibold">Mes a mes</h2>
      <p className="text-sm text-[#6b716f] mb-2">
        Rojo = gastos, color = ganancia. El número de arriba es cuánto quedó. Toca un mes para verlo arriba.
      </p>
      <div className="grid grid-cols-4 gap-3 items-end h-52 border-b-2 border-[#e4e2dc]">
        {data.map(({ m, gain, spend }) => {
          const res = gain - spend;
          return (
            <button
              key={m.month}
              type="button"
              onClick={() => pick(m.month)}
              className="flex flex-col items-center justify-end h-full gap-1 rounded-t-lg hover:bg-[#f6f5f1] transition"
              {...on(`${m.label}: gastos ${formatCLP(spend)} · ganancia ${formatCLP(gain)}`)}
            >
              <span className="text-xs font-bold tabular-nums" style={{ color: res >= 0 ? GREEN : RED }}>
                {formatCLP(res)}
              </span>
              <span className="flex items-end gap-1.5 h-40">
                <span
                  className="w-6 rounded-t-md transition-all duration-500"
                  style={{ height: `${(spend / max) * 160}px`, background: RED, opacity: 0.75 }}
                />
                <span
                  className="w-6 rounded-t-md transition-all duration-500"
                  style={{
                    height: `${(gain / max) * 160}px`,
                    background: `linear-gradient(${LINE_COLOR.bat}, ${LINE_COLOR.inv}, ${LINE_COLOR.pc})`,
                  }}
                />
              </span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-3 text-center text-sm pt-1.5">
        {months.map((m) => (
          <span key={m.month} className={`capitalize ${m.month === selected ? "font-extrabold underline" : ""}`}>
            {m.short}
          </span>
        ))}
      </div>
    </section>
  );
}
