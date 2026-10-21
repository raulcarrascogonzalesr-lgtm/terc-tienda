"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, string> = {
  inicio: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  pedidos: "M6 2h12l2 5v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7zM4 7h16M9 11a3 3 0 0 0 6 0",
  productos: "M4 5h16v11H4zM2 19h20M10 16v3M14 16v3",
  finanzas: "M3 7h18v12H3zM3 11h18M7 15h3M16 3l-4 4-4-4",
  resultados: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  campanas: "M3 10v4h4l6 5V5L7 10zM17 8a5 5 0 0 1 0 8M20 5a9 9 0 0 1 0 14",
  liquidacion: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
};

const LINKS = [
  { href: "/admin", label: "Inicio", icon: "inicio" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "pedidos" },
  { href: "/admin/productos", label: "Productos", icon: "productos" },
  { href: "/admin/finanzas", label: "Caja", icon: "finanzas" },
  { href: "/admin/resultados", label: "¿Gané o perdí?", icon: "resultados" },
  { href: "/admin/campanas", label: "Campañas", icon: "campanas" },
  { href: "/admin/liquidacion", label: "Liquidación", icon: "liquidacion" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors ${
              active
                ? "bg-white/15 text-white font-semibold"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d={ICONS[link.icon]} />
            </svg>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
