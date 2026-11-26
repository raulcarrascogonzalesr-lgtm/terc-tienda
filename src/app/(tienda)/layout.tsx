import { Analytics } from "@/components/Analytics";
import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PreparingBanner } from "@/components/PreparingBanner";
import { ScrollReveal } from "@/components/ScrollReveal";
import { UtmCapture } from "@/components/UtmCapture";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { blackFriday } from "@/lib/black-friday";
import { energyMenu, splitWorlds } from "@/lib/energy";
import { offer } from "@/lib/format";
import { listProducts } from "@/lib/products";
import { getShippingFund } from "@/lib/shipping-fund";
import { storeIsOpen } from "@/lib/store-status";

// Las páginas fijas de la tienda (carrito, Por qué TERC, Empresas) se rehacen cada minuto.
// En el hosting corren varios procesos y el aviso de "actualizar" del panel le llega solo a
// uno, así que sin esto una página podía quedarse con el estado viejo (por ejemplo, el carrito
// seguía diciendo "Estamos preparando la tienda" después de abrirla).
export const revalidate = 60;

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [products, open, fund] = await Promise.all([listProducts(), storeIsOpen(), getShippingFund()]);
  // Dos mundos (TERC 2.1): equipos reacondicionados y Energía. El menú de Energía se ve siempre;
  // mientras no haya productos muestra todas sus categorías ("Muy pronto").
  const { pcs, energy } = splitWorlds(products);
  const categories = [...new Set(pcs.map((p) => p.category))].sort();
  const energyCategories = energyMenu(energy).map(({ name, short }) => ({ name, short }));
  const offers = pcs.filter((p) => offer(p));
  // "Solo por tiempo limitado" se dice únicamente de las ofertas que tienen fecha de término.
  const limited = offers.filter((p) => p.offer_ends_at);
  const limitedOffers = limited.length > 0;
  const offerPercent = Math.max(0, ...(limitedOffers ? limited : offers).map((p) => offer(p)!.percent));
  // Nombre de la promoción, si alguna oferta tiene uno (por ejemplo "Remate de Terqui").
  const offerName = offers.find((p) => p.offer_name)?.offer_name ?? null;
  // Black Friday: cuenta Energía y equipos, y cambia la franja de arriba a negro y dorado.
  const bf = blackFriday(products);
  return (
    <CartProvider storeOpen={open}>
      <UtmCapture />
      <ScrollReveal />
      <div className="min-h-screen flex flex-col bg-paper text-ink">
        {!open && <PreparingBanner />}
        <Header
          categories={categories}
          energyCategories={energyCategories}
          energySlugs={energy.map((p) => p.slug)}
          offerPercent={offerPercent}
          limitedOffers={limitedOffers}
          offerName={offerName}
          freeShipping={fund > 0}
          blackFriday={bf.active ? { ends: bf.ends, maxPercent: bf.maxPercent } : null}
        />
        <main className="flex-1 w-full">{children}</main>
        <Footer categories={categories} energyCategories={energyCategories} />
      </div>
      <WhatsAppButton />
      <Analytics />
    </CartProvider>
  );
}
