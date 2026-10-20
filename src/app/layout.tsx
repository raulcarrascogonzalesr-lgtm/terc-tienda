import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "TERC | Tecnología reacondicionada",
  description:
    "Equipos reacondicionados con garantía, revisados y listos para usar. Envíos a todo Chile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <body className="antialiased min-h-screen flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">{children}</main>
          <footer className="border-t border-black/10 py-6 text-center text-sm text-black/60">
            TERC · Tecnología y Equipos Reacondicionados Chile
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
