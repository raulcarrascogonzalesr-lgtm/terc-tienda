import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../login/actions";
import { AdminNav } from "./AdminNav";
import { ICONS } from "./icons";
import { Icon } from "./ui";

// Cada visita revisa la sesión; nunca se guarda una copia estática.
export const dynamic = "force-dynamic";

// Guía paso a paso del panel (documento privado de Raúl).
const GUIDE_URL = "https://claude.ai/artifact/5HvatsQDhSh3aBEGAgLA15";

const today = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Santiago",
});

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="lg:flex min-h-screen lg:bg-[linear-gradient(to_right,#0c2f2c_16rem,transparent_16rem)] print:bg-none">
      <aside className="print:hidden bg-[#0c2f2c] text-white lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen flex flex-col gap-4 lg:gap-8 p-4 lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-[0.18em]">TERC</span>
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/45">Gestión</span>
          </Link>
          <Link
            href="/admin/registrar"
            className="lg:hidden inline-flex items-center gap-1.5 rounded-md bg-white text-[#0c2f2c] px-3 py-1.5 text-sm font-semibold"
          >
            <Icon path={ICONS.mas} className="w-4 h-4" />
            Registrar
          </Link>
        </div>
        <Link
          href="/admin/registrar"
          className="hidden lg:flex items-center justify-center gap-2 rounded-lg bg-white text-[#0c2f2c] px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-[#f1efe8]"
        >
          <Icon path={ICONS.mas} className="w-4 h-4" />
          Registrar movimiento
        </Link>
        <AdminNav />
        <div className="hidden lg:block mt-auto border-t border-white/10 pt-4 space-y-2 text-xs text-white/55">
          <p className="truncate" title={user.email ?? undefined}>
            {user.email}
          </p>
          <a
            href={GUIDE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-white"
          >
            Guía de uso ↗
          </a>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white">
              Ver tienda ↗
            </Link>
            <form action={logout}>
              <button type="submit" className="hover:text-white">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="print:hidden flex items-center justify-between gap-4 px-4 sm:px-8 lg:px-10 pt-4 sm:pt-6 text-xs text-[#6b716f]">
          <span className="first-letter:uppercase">{today.format(new Date())}</span>
          <span className="flex gap-4 lg:hidden">
            <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer">
              Guía
            </a>
            <Link href="/" className="hover:text-[#14201f]">
              Ver tienda ↗
            </Link>
            <form action={logout}>
              <button type="submit" className="hover:text-[#14201f]">
                Salir
              </button>
            </form>
          </span>
        </div>
        <main className="px-4 sm:px-8 lg:px-10 py-6 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
