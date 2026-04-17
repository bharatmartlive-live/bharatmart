import { Facebook, Instagram, Mail, MapPin, Phone, ShieldCheck, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { socialLinks } from '../../data/socialLinks';

const icons = {
  Facebook,
  Instagram,
  YouTube: Youtube,
  WhatsApp: Phone
};

export function Footer() {
  return (
    <footer className="mt-16">
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 px-4 py-12 text-center text-white">
        <h2 className="text-3xl font-black tracking-wide md:text-4xl">Don't Miss Out!</h2>
        <p className="mt-3 text-lg">15% OFF on everything - offer ends 15 July 2026</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-white px-8 py-3 font-bold text-orange-600 shadow-soft transition hover:-translate-y-0.5 hover:bg-orange-50"
        >
          Shop Now
        </Link>
      </div>

      <div className="bg-slate-950 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.25fr,0.9fr,0.8fr,0.8fr]">
          <div>
            <img src={logo} alt="BharatMart logo" className="h-24 w-24 rounded-full object-cover shadow-lg" />
            <p className="mt-5 max-w-sm text-sm leading-6">
              BharatMart.live is India's trusted online shopping destination. We bring high-quality summer products,
              fast delivery, COD availability, and unbeatable prices across India.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> Verified & Trusted Seller
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map((link) => {
                const Icon = icons[link.name] || Mail;
                const disabled = !link.url;
                return (
                  <a
                    key={link.name}
                    href={link.url || '#'}
                    aria-label={link.name}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-brand hover:text-slate-950 ${
                      disabled ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    onClick={(event) => {
                      if (disabled) event.preventDefault();
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-white">Contact Us</h3>
            <div className="mt-5 space-y-4 text-sm">
              <p className="flex items-center gap-3"><Phone className="h-4 w-4" /> +91 98765 43210</p>
              <p className="flex items-center gap-3"><Mail className="h-4 w-4" /> support@bharatmart.live</p>
              <p className="flex items-center gap-3"><MapPin className="h-4 w-4" /> Mumbai, India</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-white">Quick Links</h3>
            <nav className="mt-5 grid gap-3 text-sm">
              <Link to="/about" className="hover:text-brand">About Us</Link>
              <Link to="/faq" className="hover:text-brand">FAQ</Link>
              <Link to="/testimonials" className="hover:text-brand">Testimonials</Link>
              <Link to="/checkout" className="hover:text-brand">Shipping Info</Link>
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-black text-white">Policies</h3>
            <nav className="mt-5 grid gap-3 text-sm">
              <Link to="/privacy-policy" className="hover:text-brand">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-brand">Terms & Conditions</Link>
              <Link to="/return-policy" className="hover:text-brand">Return Policy</Link>
              <Link to="/cart" className="hover:text-brand">Cart</Link>
            </nav>
          </div>
        </div>
        <div className="mx-auto max-w-7xl border-t border-white/10 px-4 py-6 text-center text-xs text-slate-500">
          © 2026 BharatMart.live. All rights reserved. Made with love in India.
        </div>
      </div>
    </footer>
  );
}


