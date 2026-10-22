import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PreparingBanner } from "@/components/PreparingBanner";
import { UtmCapture } from "@/components/UtmCapture";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { offer } from "@/lib/format";
import { listProducts } from "@/lib/products";
import { storeIsOpen } from "@/lib/store-status";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [products, open] = await Promise.all([listProducts(), storeIsOpen()]);
  const categories = [...new Set(products.map((p) => p.category))].sort();
  const offers = products.filter((p) => offer(p));
  // "Solo por tiempo limitado" se dice únicamente de las ofertas que tienen fecha de término.
  const limited = offers.filter((p) => p.offer_ends_at);
  const limitedOffers = limited.length > 0;
  const offerPercent = Math.max(0, ...(limitedOffers ? limited : offers).map((p) => offer(p)!.percent));
  return (
    <CartProvider storeOpen={open}>
      <UtmCapture />
      <div className="min-h-screen flex flex-col bg-paper text-ink">
        {!open && <PreparingBanner />}
        <Header categories={categories} offerPercent={offerPercent} limitedOffers={limitedOffers} />
        <main className="flex-1 w-full">{children}</main>
        <Footer categories={categories} />
      </div>
      <WhatsAppButton />
    </CartProvider>
  );
}
