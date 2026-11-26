import { StoreIcon } from "@/components/icons";
import { formatCLP } from "@/lib/format";
import { transferRows, transferSubject } from "@/lib/transfer";

// Cuenta, monto y asunto para transferir. Se muestra apenas el cliente envía su pedido.
export function TransferDetails({ number, total }: { number: string; total: number | null }) {
  const rows: [string, string][] = [
    ...(total ? ([["Monto a transferir", formatCLP(total)]] as [string, string][]) : []),
    ...transferRows(),
    ["Asunto", transferSubject(number)],
  ];
  return (
    <div className="rounded-3xl bg-mint-50 p-5 text-left ring-1 ring-pine-700/15">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-700">
        <StoreIcon name="bank" className="h-4 w-4" /> Datos para transferir
      </p>
      <dl className="mt-3 divide-y divide-line/[0.08] text-sm">
        {rows.map(([label, value], i) => (
          <div key={label} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 py-2">
            <dt className="text-muted">{label}</dt>
            <dd className={`select-all font-semibold text-ink ${i === 0 && total ? "text-lg font-extrabold text-pine-700" : ""}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
