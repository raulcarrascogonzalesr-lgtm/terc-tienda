import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar | Panel TERC", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdminUser()) redirect("/admin");
  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl border border-black/10 p-6 space-y-6">
      <h1 className="text-xl font-bold">Panel de administración</h1>
      <LoginForm />
    </div>
  );
}
