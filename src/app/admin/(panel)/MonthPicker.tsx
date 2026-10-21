"use client";

import { usePathname, useRouter } from "next/navigation";

// Selector de mes que cambia ?mes= en la dirección.
export function MonthPicker({
  months,
  value,
}: {
  months: { value: string; label: string }[];
  value: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <select
      value={value}
      onChange={(e) => router.push(`${pathname}?mes=${e.target.value}`)}
      className="input w-auto"
      aria-label="Mes"
    >
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label.charAt(0).toUpperCase() + m.label.slice(1)}
        </option>
      ))}
    </select>
  );
}
