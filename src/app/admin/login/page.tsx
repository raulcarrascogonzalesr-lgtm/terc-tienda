import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar | Panel TERC", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdminUser()) redirect("/admin");
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-black/5 p-8 space-y-6">
        <div className="space-y-1">
          <Logo className="h-14 w-auto" />
          <h1 className="text-lg font-semibold">Panel de administración</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
