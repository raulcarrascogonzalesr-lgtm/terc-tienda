import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { UtmCapture } from "@/components/UtmCapture";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <UtmCapture />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-black/10 py-6 text-center text-sm text-black/60">
          TERC · Tecnología y Equipos Reacondicionados Chile
        </footer>
      </div>
    </CartProvider>
  );
}
