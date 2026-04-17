import { Headphones, Moon, Search, ShoppingCart, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useShop } from '../../hooks/useShop';
import { api } from '../../lib/api';
import { clearStoredCustomer, getStoredCustomer, getTrackingColor, getTrackingLabel } from '../../lib/customer';
import logo from '../../assets/logo.svg';

const navLinks = [
  ['All Products', '/'],
  ['Hot Deals', '/hot-deals'],
  ['About Us', '/about'],
  ['FAQ', '/faq'],
  ['Testimonials', '/testimonials']
];

const supportUrl = 'https://wa.me/918826333790?text=I%20need%20support%20related%20to%20some%20product%20on%20bharatmart.live';

export function Header() {
  const { cartCount } = useShop();
  const [customer, setCustomer] = useState(() => getStoredCustomer());
  const [orders, setOrders] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const syncCustomer = () => setCustomer(getStoredCustomer());
    window.addEventListener('bharatmart-customer-change', syncCustomer);
    window.addEventListener('storage', syncCustomer);
    return () => {
      window.removeEventListener('bharatmart-customer-change', syncCustomer);
      window.removeEventListener('storage', syncCustomer);
    };
  }, []);

  useEffect(() => {
    if (!customer?.email) {
      setOrders([]);
      return;
    }

    api
      .get(`/orders/customer/${encodeURIComponent(customer.email)}`)
      .then((response) => setOrders(response.data.data || []))
      .catch(() => setOrders([]));
  }, [customer]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="BharatMart logo" className="h-16 w-16 rounded-full object-cover shadow-sm" />
        </Link>

        <div className="relative flex-1 lg:max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search products..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-14 text-sm outline-none ring-brand transition focus:ring-2"
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600">
            <Search className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-slate-700 lg:justify-start lg:gap-4">
          <a href={supportUrl} target="_blank" rel="noreferrer" className="hidden items-center gap-2 transition hover:text-orange-600 md:inline-flex">
            <Headphones className="h-4 w-4" /> Support
          </a>
          <button type="button" className="hidden rounded-full p-2 transition hover:bg-slate-100 md:inline-flex">
            <Moon className="h-5 w-5" />
          </button>

          {customer ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 font-bold transition hover:border-orange-300 hover:text-orange-600"
              >
                <UserRound className="h-4 w-4" /> Profile
              </button>
              {profileOpen ? (
                <div className="absolute right-0 mt-3 w-[min(20rem,calc(100vw-1rem))] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
                  <p className="font-black text-ink">{customer.name}</p>
                  <p className="text-xs text-slate-500">{customer.email}</p>
                  <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
                    {orders.length ? (
                      orders.slice(0, 4).map((order) => (
                        <div key={order.id} className="rounded-2xl bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-ink">Order #{order.id}</p>
                            <span className={`rounded-full px-2 py-1 text-xs font-bold ${getTrackingColor(order.status)}`}>
                              {getTrackingLabel(order.status)}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500">Total Rs {Math.round(order.total_price)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">No orders yet.</p>
                    )}
                  </div>
                  <Link to="/login" className="mt-4 block rounded-full bg-ink px-4 py-2 text-center text-sm font-bold text-white">
                    Open Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      clearStoredCustomer();
                      setProfileOpen(false);
                    }}
                    className="mt-2 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <NavLink to="/login" className="inline-flex items-center gap-2 transition hover:text-orange-600">
              <UserRound className="h-4 w-4" /> Login
            </NavLink>
          )}

          <NavLink to="/cart" className="relative inline-flex items-center gap-2 transition hover:text-orange-600">
            <ShoppingCart className="h-6 w-6" />
            {cartCount ? (
              <span className="absolute -right-3 -top-2 rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </NavLink>
        </nav>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/80">
        <nav className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-3 py-3 text-sm font-semibold text-slate-600 sm:px-4">
          {navLinks.map(([label, href]) => (
            <Link key={label} to={href} className="whitespace-nowrap transition hover:text-orange-600">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}



