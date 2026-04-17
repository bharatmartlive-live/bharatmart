import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { clearStoredCustomer, getStoredCustomer, getTrackingColor, getTrackingLabel, setStoredCustomer } from '../lib/customer';

export function LoginPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [mode, setMode] = useState('login');
  const [status, setStatus] = useState('');
  const [customer, setCustomer] = useState(() => getStoredCustomer());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(mode === 'login' ? 'Checking credentials, please wait...' : 'Creating account, please wait...');

    try {
      if (mode === 'register') {
        await api.post('/users/register', form);
        setStatus('Account created. Please login with your email and password.');
        setMode('login');
        return;
      }

      const { data } = await api.post('/users/login', { email: form.email, password: form.password });
      setStoredCustomer(data.user, data.token);
      setCustomer(data.user);
      setStatus('Logged in successfully. Loading your dashboard...');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials or register first.';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  if (customer) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-orange-600">Customer Dashboard</p>
              <h1 className="mt-2 text-4xl font-black text-ink">Welcome, {customer.name}</h1>
              <p className="mt-2 text-slate-600">Track your BharatMart orders in realtime from packed to delivered.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearStoredCustomer();
                setCustomer(null);
                setStatus('Logged out successfully.');
              }}
              className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr,0.65fr]">
            <div className="rounded-3xl border border-slate-200 p-5">
              <h2 className="text-2xl font-black text-ink">Your Orders</h2>
              <div className="mt-5 space-y-4">
                {orders.length ? (
                  orders.map((order) => (
                    <div key={order.id} className="rounded-3xl bg-slate-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-black text-ink">Order #{order.id}</p>
                          <p className="text-sm text-slate-500">Total Rs {Math.round(order.total_price)}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1.5 text-xs font-black ${getTrackingColor(order.status)}`}>
                          {getTrackingLabel(order.status)}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {['Order packed', 'Shipped', 'Delivered'].map((step) => {
                          const active =
                            step === 'Order packed' ||
                            (step === 'Shipped' && ['Shipped', 'Delivered'].includes(order.status)) ||
                            (step === 'Delivered' && order.status === 'Delivered');
                          return (
                            <div key={step} className={`rounded-2xl px-3 py-2 text-center text-xs font-bold ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-400'}`}>
                              {step}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-3xl bg-slate-50 p-5 text-slate-500">No orders yet. Your COD orders will show here after checkout.</p>
                )}
              </div>
            </div>
            <div className="rounded-3xl bg-orange-50 p-5">
              <h2 className="text-2xl font-black text-ink">Account Benefits</h2>
              <div className="mt-5 space-y-3 text-sm font-semibold text-slate-700">
                <p>COD order tracking</p>
                <p>Saved customer details</p>
                <p>Monthly offer alerts</p>
                <p>Faster checkout next time</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-black text-ink">Customer {mode === 'login' ? 'Login' : 'Register'}</h1>
        <p className="mt-3 text-sm text-slate-600">
          Login to track your orders, view packed/shipped/delivered updates, and checkout faster.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' ? (
            <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          ) : null}
          <input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          <input required type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          <button disabled={loading} className="w-full rounded-full bg-ink px-5 py-3 font-semibold text-white disabled:opacity-60">
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
          {status ? <p className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">{status}</p> : null}
        </form>
        <button type="button" onClick={() => { setMode((current) => (current === 'login' ? 'register' : 'login')); setStatus(''); }} className="mt-5 text-sm font-bold text-orange-600">
          {mode === 'login' ? 'New customer? Create account' : 'Already registered? Login'}
        </button>
      </div>
    </section>
  );
}
