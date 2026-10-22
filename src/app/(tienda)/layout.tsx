import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PreparingBanner } from "@/components/PreparingBanner";
import { ScrollReveal } from "@/components/ScrollReveal";
import { UtmCapture } from "@/components/UtmCapture";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { offer } from "@/lib/format";
import { listProducts } from "@/lib/products";
import { storeIsOpen } from "@/lib/store-status";

// Las páginas fijas de la tienda (carrito, Por qué TERC, Empresas) se rehacen cada minuto.
// En el hosting corren varios procesos y el aviso de "actualizar" del panel le llega solo a
// uno, así que sin esto una página podía quedarse con el estado viejo (por ejemplo, el carrito
// seguía diciendo "Estamos preparando la tienda" después de abrirla).
export const revalidate = 60;

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
      <ScrollReveal />
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
