import { ShieldCheck, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop } from '../../hooks/useShop';

const discountedPrice = (product) => product.price - (product.price * product.discount) / 100;

export function ProductCard({ product }) {
  const { addToCart } = useShop();
  const image = product.imageUrls?.[0];

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <Link to={`/products/${product.slug || product.id}`} className="block overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={product.title}
          loading="lazy"
          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-bold text-ink">{product.title}</h3>
          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-600">
            -{product.discount}%
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
          <ShieldCheck className="h-4 w-4" /> COD Available
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-black text-ink">Rs {Math.round(discountedPrice(product))}</p>
            <p className="text-sm text-slate-400 line-through">Rs {product.price}</p>
          </div>
          <button
            type="button"
            onClick={() => addToCart(product.id)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition active:scale-95 hover:bg-brand hover:text-navy"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}


