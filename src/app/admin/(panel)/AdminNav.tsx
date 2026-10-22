"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ICONS } from "./icons";
import { Icon } from "./ui";

const GROUPS = [
  {
    title: "General",
    links: [{ href: "/admin", label: "Inicio", icon: ICONS.inicio }],
  },
  {
    title: "Tienda",
    links: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ICONS.pedidos },
      { href: "/admin/productos", label: "Productos", icon: ICONS.productos },
      { href: "/admin/cotizaciones", label: "Cotizaciones", icon: ICONS.cotizaciones },
    ],
  },
  {
    title: "Finanzas",
    links: [
      { href: "/admin/finanzas", label: "Caja", icon: ICONS.finanzas },
      { href: "/admin/resultados", label: "¿Gané o perdí?", icon: ICONS.resultados },
      { href: "/admin/iva", label: "IVA e impuestos", icon: ICONS.iva },
      { href: "/admin/campanas", label: "Campañas", icon: ICONS.campanas },
      { href: "/admin/liquidacion", label: "Liquidación", icon: ICONS.liquidacion },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex lg:flex-col gap-1 lg:gap-6 overflow-x-auto -mx-1 px-1">
      {GROUPS.map((group) => (
        <div key={group.title} className="flex lg:flex-col gap-1">
          <p className="hidden lg:block px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            {group.title}
          </p>
          {group.links.map((link) => {
            const active =
              link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                  active
                    ? "bg-white/[.08] text-white font-medium"
                    : "text-white/65 hover:text-white hover:bg-white/[.05]"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#b3a26a] hidden lg:block" />
                )}
                <Icon path={link.icon} className="w-[18px] h-[18px]" />
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
