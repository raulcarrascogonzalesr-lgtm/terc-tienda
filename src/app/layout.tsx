import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

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
    <html lang="es-CL" className={inter.variable}>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
