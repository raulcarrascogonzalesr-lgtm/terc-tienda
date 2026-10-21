import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../login/actions";

export const metadata: Metadata = { title: "Panel TERC", robots: { index: false } };

// Cada visita revisa la sesión; nunca se guarda una copia estática.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-black/10 px-4 py-3 text-sm">
        <span className="font-bold">Panel</span>
        <Link href="/admin" className="font-medium hover:text-brand">
          Pedidos
        </Link>
        <Link href="/admin/productos" className="font-medium hover:text-brand">
          Productos
        </Link>
        <span className="flex-1" />
        <span className="text-black/60">{user.email}</span>
        <form action={logout}>
          <button type="submit" className="text-red-700">
            Salir
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
