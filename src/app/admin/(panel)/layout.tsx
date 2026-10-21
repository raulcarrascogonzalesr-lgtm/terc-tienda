import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../login/actions";
import { AdminNav } from "./AdminNav";

// Cada visita revisa la sesión; nunca se guarda una copia estática.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="lg:flex min-h-screen">
      <aside className="print:hidden bg-[#0b3d3a] text-white lg:w-60 lg:min-h-screen lg:sticky lg:top-0 lg:h-screen flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between lg:block">
          <Link href="/admin" className="text-2xl font-black tracking-tight">
            TERC
          </Link>
          <p className="text-xs text-white/60 lg:mt-1">Panel de gestión</p>
        </div>
        <AdminNav />
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 lg:block lg:space-y-2 text-xs text-white/60">
          <Link href="/" className="block hover:text-white">
            Ver la tienda ↗
          </Link>
          <p className="truncate">{user.email}</p>
          <form action={logout}>
            <button type="submit" className="hover:text-white">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 sm:p-8 max-w-6xl">{children}</main>
    </div>
  );
}
