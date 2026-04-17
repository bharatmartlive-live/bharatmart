import { Link, useSearchParams } from 'react-router-dom';

export function ThankYouPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center animate-page">
      <div className="rounded-[36px] bg-white p-8 shadow-soft md:p-12">
        <p className="mx-auto inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
          COD Order Confirmed
        </p>
        <h1 className="mt-6 text-4xl font-black text-ink md:text-5xl">Thank you for shopping with BharatMart.live</h1>
        <p className="mt-4 text-lg text-slate-600">
          Your order has been placed successfully. You can track it from your profile dashboard.
        </p>
        {orderId ? <p className="mt-4 text-sm font-bold text-orange-600">Order ID: #{orderId}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/login" className="rounded-full bg-ink px-6 py-3 font-bold text-white">
            View Dashboard
          </Link>
          <Link to="/" className="rounded-full border border-slate-200 px-6 py-3 font-bold text-slate-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
