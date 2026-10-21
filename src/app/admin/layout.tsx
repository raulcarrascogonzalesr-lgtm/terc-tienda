import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel TERC", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f1f2ee] text-[#1c1c1c]">{children}</div>;
}
