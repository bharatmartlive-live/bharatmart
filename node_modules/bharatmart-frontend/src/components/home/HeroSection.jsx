import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Zap } from 'lucide-react';
import { useLiveViewers } from '../../hooks/useLiveViewers';

export function HeroSection() {
  const viewers = useLiveViewers('home');

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.25fr,0.75fr] lg:py-14">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-[32px] bg-navy bg-hero-grid bg-[size:22px_22px] px-6 py-12 text-white shadow-soft md:px-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,159,28,0.32),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(29,114,242,0.22),_transparent_30%)]" />
        <div className="relative max-w-xl">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand">
              <Zap className="h-3.5 w-3.5" /> Summer Sale 2026
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100">
              <Eye className="h-3.5 w-3.5" /> {viewers.toLocaleString('en-IN')} people watching now
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            Beat the heat with premium trending essentials.
          </h1>
          <p className="mt-4 text-base text-slate-200 md:text-lg">
            Discover cooling tech, hydration must-haves, travel-friendly accessories, and
            limited-time flash deals engineered to convert fast.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/checkout"
              className="rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-navy transition hover:bg-yellow-300"
            >
              Shop Offers
            </Link>

          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 animate-page">
        <div className="rounded-[28px] bg-gradient-to-br from-brand to-yellow-300 p-6 text-navy shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.24em]">Hot Deals</p>
          <h2 className="mt-3 text-3xl font-black">Up to 55% Off</h2>
          <p className="mt-2 text-sm font-medium">Cooling appliances, travel bottles, skin care, and more.</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Checkout Bonus
          </p>
          <h3 className="mt-3 text-2xl font-bold text-ink">Extra coupon savings on prepaid orders</h3>
          <p className="mt-2 text-sm text-slate-600">
            Stack eligible summer coupon codes during checkout for higher conversion and repeat order value.
          </p>
        </div>
      </div>
    </section>
  );
}

