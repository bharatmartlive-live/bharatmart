import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop } from '../../hooks/useShop';

export function CartFeedback() {
  const { cartFeedback } = useShop();

  if (!cartFeedback) return null;

  return (
    <div key={cartFeedback.id} className="fixed right-4 top-28 z-50 w-[min(340px,calc(100vw-2rem))] rounded-3xl border border-emerald-100 bg-white p-4 shadow-2xl animate-cart-pop">
      <div className="flex items-center gap-3">
        <img src={cartFeedback.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-black text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Added to cart
          </p>
          <p className="mt-1 truncate text-sm font-bold text-slate-800">{cartFeedback.title}</p>
        </div>
      </div>
      <Link to="/cart" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">
        <ShoppingCart className="h-4 w-4" /> View Cart
      </Link>
    </div>
  );
}
