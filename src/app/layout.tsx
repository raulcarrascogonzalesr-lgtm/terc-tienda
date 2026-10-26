import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { DEFAULT_DESCRIPTION, SITE_URL } from "@/lib/seo";
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
  metadataBase: new URL(SITE_URL),
  title: "TERC | Computadores reacondicionados con garantía en Chile",
  description: DEFAULT_DESCRIPTION,
  openGraph: { siteName: "TERC", locale: "es_CL", type: "website" },
  other: { "facebook-domain-verification": SITE.metaDomainVerification },
  verification: { google: SITE.googleSiteVerification },
};

// Aplica el modo oscuro antes de pintar la página, para que no parpadee en blanco.
// Solo en la tienda: el panel /admin siempre va en claro.
const THEME_SCRIPT = `try{if(!location.pathname.startsWith("/admin")&&localStorage.getItem("terc-tema")==="oscuro")document.documentElement.dataset.theme="dark"}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
