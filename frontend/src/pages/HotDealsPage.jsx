import { ProductSection } from '../components/home/ProductSection';
import { useShop } from '../hooks/useShop';

export function HotDealsPage() {
  const { products } = useShop();
  const hotDeals = products
    .filter((product) => product.category === 'Hot Deals' || Number(product.discount) >= 20)
    .sort((a, b) => Number(b.discount) - Number(a.discount));

  return (
    <section className="animate-page">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-[32px] bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white shadow-soft">
          <p className="text-sm font-black uppercase tracking-[0.24em]">Realtime Trending</p>
          <h1 className="mt-3 text-4xl font-black">Hot Deals</h1>
          <p className="mt-3 max-w-2xl text-orange-50">
            Live deal shelf showing high-discount and trending products customers are checking right now.
          </p>
        </div>
      </div>
      <ProductSection
        title="Trending Hot Deals"
        subtitle="Sorted by strongest discounts and active offer positioning."
        products={hotDeals}
      />
    </section>
  );
}
