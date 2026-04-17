import { Link } from 'react-router-dom';
import { useShop } from '../hooks/useShop';

export function CartPage() {
  const { cartItems, cartSubtotal, updateQuantity } = useShop();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <h1 className="text-3xl font-black text-ink">Your Cart</h1>
          <div className="mt-6 space-y-4">
            {cartItems.length ? (
              cartItems.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                  <img src={item.imageUrls?.[0]} alt={item.title} className="h-28 w-28 rounded-3xl object-cover" />
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-ink">{item.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">Rs {Math.round(item.price - (item.price * item.discount) / 100)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-10 w-10 rounded-full border border-slate-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-10 w-10 rounded-full border border-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500">Your cart is empty.</p>
            )}
          </div>
        </div>

        <aside className="rounded-[32px] bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black text-ink">Order Summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs {Math.round(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="flex justify-between text-lg font-bold text-ink">
              <span>Total</span>
              <span>Rs {Math.round(cartSubtotal)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-6 inline-flex w-full justify-center rounded-full bg-brand px-5 py-3 font-semibold text-navy"
          >
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
