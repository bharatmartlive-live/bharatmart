import { Eye, PlayCircle, ShoppingCart, ShieldCheck, Truck } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveViewers } from '../hooks/useLiveViewers';
import { useShop } from '../hooks/useShop';

export function ProductDetailsPage() {
  const { slug } = useParams();
  const { products, addToCart } = useShop();
  const product = products.find((item) => item.slug === slug || String(item.id) === slug);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeMedia, setActiveMedia] = useState('image');
  const viewers = useLiveViewers('product');

  if (!product) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500">Product not found.</div>;
  }

  const discountedPrice = product.price - (product.price * product.discount) / 100;
  const media = product.imageUrls || [];
  const lowStock = Number(product.stock) <= 5;
  const specifications = product.specifications || [];

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 animate-page sm:px-4 sm:py-8">
      <div className="mb-4 text-sm text-slate-500">Home / Products / {product.title}</div>
      <div className="grid gap-7 lg:grid-cols-[1.05fr,0.95fr] lg:gap-10">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-soft sm:rounded">
            <span className="absolute left-4 top-4 z-10 rounded bg-red-500 px-3 py-1 text-xs font-black text-white">
              {product.discount}% OFF
            </span>
            {activeMedia === 'video' && product.video_url ? (
              <video key={product.video_url} controls playsInline preload="metadata" className="h-[320px] w-full bg-black object-contain sm:h-[440px]">
                <source src={product.video_url} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            ) : (
              <img
                src={media[activeIndex]}
                alt={product.title}
                className="h-[320px] w-full object-contain p-4 transition duration-500 hover:scale-[1.02] sm:h-[440px] sm:p-6"
              />
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {media.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setActiveMedia('image');
                }}
                className={`shrink-0 overflow-hidden rounded-lg border p-1 transition active:scale-95 hover:-translate-y-0.5 ${
                  activeMedia === 'image' && activeIndex === index ? 'border-orange-500' : 'border-slate-200'
                }`}
              >
                <img src={src} alt="" className="h-16 w-16 object-cover" />
              </button>
            ))}
            {product.video_url ? (
              <button
                type="button"
                onClick={() => setActiveMedia('video')}
                className={`relative flex h-[74px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-950 text-white transition active:scale-95 hover:-translate-y-0.5 ${
                  activeMedia === 'video' ? 'border-orange-500' : 'border-slate-200'
                }`}
              >
                <PlayCircle className="h-8 w-8" />
                <span className="absolute bottom-1 text-[10px] font-bold">Video</span>
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            <Eye className="h-4 w-4" /> {viewers.toLocaleString('en-IN')} people viewing now
          </div>
          <h1 className="mt-5 text-2xl font-black leading-tight text-ink sm:text-3xl md:text-4xl">{product.title}</h1>
          <p className="mt-2 text-sm font-bold text-emerald-600">4.7 rating - Verified Seller</p>

          <div className="mt-5 rounded bg-orange-50 p-5">
            <div className="flex flex-wrap items-end gap-3">
              <p className="text-3xl font-black text-ink sm:text-4xl">Rs {Math.round(discountedPrice)}</p>
              <p className="pb-1 text-lg text-slate-400 line-through">Rs {product.price}</p>
              <p className="pb-1 text-sm font-bold text-emerald-600">{product.discount}% off</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              Only {product.stock} pcs left! Buy fast
            </p>
            <p className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-700">
              Flat 15% OFF - Limited Time Offer
            </p>
            {lowStock ? (
              <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                Low stock alert: if sold out, expected restock is around 14 days.
              </p>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              className="inline-flex items-center justify-center gap-2 rounded bg-orange-500 px-6 py-3 text-sm font-bold text-white transition active:scale-95 hover:bg-orange-600"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              className="rounded border border-orange-500 px-6 py-3 text-sm font-bold text-orange-600 transition active:scale-95 hover:bg-orange-50"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            Cash on Delivery Available - Pay safely at your doorstep
          </div>

          <div className="mt-5 rounded border border-slate-200 bg-white p-5">
            <h2 className="font-black text-ink">Product Description</h2>
            {specifications.length ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                {specifications.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className={`grid grid-cols-[0.85fr,1.15fr] text-sm ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
                  >
                    <div className="px-3 py-3 font-medium text-slate-500 sm:px-4">{item.label}</div>
                    <div className="px-3 py-3 font-semibold text-slate-900 sm:px-4">{item.value}</div>
                  </div>
                ))}
              </div>
            ) : null}
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>{product.description}</li>
              <li>Space-saving portable design for everyday home, office, and travel use.</li>
            </ul>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Best Price', 'Save with summer coupons'],
              ['Trusted Seller', 'Verified BharatMart store'],
              ['Fast Shipping', 'Trackable order updates'],
              ['Secure Payment', 'COD and prepaid available']
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg bg-slate-50 p-4 text-sm transition hover:-translate-y-0.5 hover:shadow-soft">
                <p className="flex items-center gap-2 font-bold text-ink"><ShieldCheck className="h-4 w-4 text-emerald-500" /> {title}</p>
                <p className="mt-1 text-slate-500"><Truck className="mr-1 inline h-4 w-4" />{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

