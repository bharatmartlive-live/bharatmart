import { ProductCard } from '../products/ProductCard';

export function ProductSection({ title, subtitle, products }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-5">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-ink md:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
