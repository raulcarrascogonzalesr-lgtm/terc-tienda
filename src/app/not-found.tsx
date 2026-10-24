import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Terqui } from "@/components/Terqui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-12 text-center text-ink">
      <Link href="/" aria-label="TERC, ir al inicio">
        <Logo className="h-14 w-auto" />
      </Link>
      <Terqui pose="lupa" className="mt-8 w-44 h-44" />
      <h1 className="mt-2 text-2xl sm:text-3xl font-bold">Uy, esta página no existe</h1>
      <p className="mt-2 max-w-sm text-muted">
        Puede que el equipo ya se haya vendido o que el enlace esté mal escrito.
      </p>
      <Link
        href="/#equipos"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition hover:bg-pine-700"
      >
        Ver equipos disponibles
      </Link>
    </main>
  );
}
