import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { UtmCapture } from "@/components/UtmCapture";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { offer } from "@/lib/format";
import { listProducts } from "@/lib/products";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const products = await listProducts();
  const categories = [...new Set(products.map((p) => p.category))].sort();
  const hasOffers = products.some((p) => offer(p));
  return (
    <CartProvider>
      <UtmCapture />
      <div className="min-h-screen flex flex-col bg-paper text-ink">
        <Header categories={categories} hasOffers={hasOffers} />
        <main className="flex-1 w-full">{children}</main>
        <Footer categories={categories} />
      </div>
      <WhatsAppButton />
    </CartProvider>
  );
}
