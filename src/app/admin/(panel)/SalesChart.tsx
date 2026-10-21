"use client";

import { useState } from "react";
import { formatCLP } from "@/lib/format";

export type ChartPoint = { label: string; sales: number; ads: number };

const SERIES = [
  { key: "sales", label: "Ventas", color: "#2a78d6" },
  { key: "ads", label: "Publicidad", color: "#eb6834" },
] as const;

const W = 640;
const H = 220;
const PAD = { top: 12, right: 8, bottom: 28, left: 8 };

function compact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}mil`;
  return `$${value}`;
}

// Ventas y gasto en publicidad por mes, en el mismo eje (los dos son pesos).
export function SalesChart({ data }: { data: ChartPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.flatMap((d) => [d.sales, d.ads]));
  const plotH = H - PAD.top - PAD.bottom;
  const groupW = (W - PAD.left - PAD.right) / data.length;
  const barW = Math.min(28, (groupW - 16) / 2);
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const gridValues = [0.5, 1].map((f) => max * f);

  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-xs text-[#3b4442]">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          role="img"
          aria-label="Ventas y publicidad por mes"
        >
          {gridValues.map((v) => (
            <g key={v}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(v)}
                y2={y(v)}
                stroke="#000"
                strokeOpacity={0.06}
              />
              <text x={W - PAD.right} y={y(v) - 4} textAnchor="end" fontSize={10} fill="#00000080">
                {compact(v)}
              </text>
            </g>
          ))}
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(0)}
            y2={y(0)}
            stroke="#000"
            strokeOpacity={0.15}
          />
          {data.map((d, i) => {
            const x0 = PAD.left + i * groupW + (groupW - (barW * 2 + 2)) / 2;
            return (
              <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect
                  x={PAD.left + i * groupW}
                  y={PAD.top}
                  width={groupW}
                  height={plotH}
                  fill={hover === i ? "#00000008" : "transparent"}
                />
                {SERIES.map((s, j) => {
                  const v = d[s.key];
                  const h = Math.max(v > 0 ? 2 : 0, y(0) - y(v));
                  const x = x0 + j * (barW + 2);
                  const r = Math.min(4, h / 2, barW / 2);
                  // Barra con esquinas redondeadas solo arriba.
                  const path =
                    h === 0
                      ? ""
                      : `M${x},${y(0)} V${y(0) - h + r} q0,-${r} ${r},-${r} H${x + barW - r} q${r},0 ${r},${r} V${y(0)} Z`;
                  return path && <path key={s.key} d={path} fill={s.color} />;
                })}
                <text
                  x={PAD.left + i * groupW + groupW / 2}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#00000099"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <div
            className="absolute top-0 pointer-events-none bg-white border border-[#e4e2dc] shadow-md rounded-lg px-3 py-2 text-xs space-y-0.5"
            style={{
              left: `${((hover + 0.5) / data.length) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-semibold capitalize">{data[hover].label}</p>
            {SERIES.map((s) => (
              <p key={s.key} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                {s.label}: {formatCLP(data[hover][s.key])}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
