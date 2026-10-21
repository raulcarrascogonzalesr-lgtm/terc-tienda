import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
