import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Tipografía del logo y los títulos (identidad TERC V1).
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  // Para que la imagen al compartir (opengraph-image.png) use la dirección real de la tienda.
  metadataBase: new URL("https://terc.cl"),
  title: "TERC | Tecnología reacondicionada",
  description:
    "Equipos reacondicionados con garantía, revisados y listos para usar. Envíos a todo Chile.",
  other: { "facebook-domain-verification": SITE.metaDomainVerification },
  verification: { google: SITE.googleSiteVerification },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
