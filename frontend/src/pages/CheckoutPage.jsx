import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { getStoredCustomer, setStoredCustomer } from '../lib/customer';
import { useShop } from '../hooks/useShop';

const SHIPPING_CHARGE = 49;

const initialForm = {
  customerName: '',
  email: '',
  phone: '',
  password: '',
  billingAddress: '',
  shippingAddress: '',
  sameAsBilling: true,
  monthlyOffers: false,
  note: '',
  paymentMethod: 'COD'
};

export function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart } = useShop();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(() => getStoredCustomer());
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [placing, setPlacing] = useState(false);

  const mrpTotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const savings = mrpTotal - cartSubtotal;
  const finalShippingAddress = form.sameAsBilling ? form.billingAddress : form.shippingAddress;

  useEffect(() => {
    if (customer) {
      setForm((current) => ({
        ...current,
        customerName: current.customerName || customer.name,
        email: current.email || customer.email
      }));
    }
  }, [customer]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const ensureCustomerAccount = async () => {
    if (customer) return customer;

    if (!form.password || form.password.length < 6) {
      throw new Error('Create an account to place order. Password must be at least 6 characters.');
    }

    await api.post('/users/register', {
      name: form.customerName,
      email: form.email,
      password: form.password
    });

    const { data } = await api.post('/users/login', {
      email: form.email,
      password: form.password
    });

    setStoredCustomer(data.user, data.token);
    setCustomer(data.user);
    return data.user;
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setStatus('');

    if (!cartItems.length) {
      setStatus('Your cart is empty. Please add at least one product to cart before placing an order.');
      return;
    }

    if (form.paymentMethod !== 'COD') {
      setStatus('Card, UPI, and Razorpay payments are in development. Please select Cash on Delivery for now.');
      return;
    }

    setPlacing(true);

    try {
      const activeCustomer = await ensureCustomerAccount();
      const payload = {
        userId: activeCustomer.id,
        customerName: form.customerName,
        email: form.email,
        phone: form.phone,
        paymentMethod: form.paymentMethod,
        address: `Billing: ${form.billingAddress}\nShipping: ${finalShippingAddress}\nPayment: ${form.paymentMethod}\nNote: ${form.note || 'No note'}\nMonthly offers: ${form.monthlyOffers ? 'Yes' : 'No'}`,
        totalPrice: cartSubtotal,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: Math.round(item.price - (item.price * item.discount) / 100)
        }))
      };

      const { data } = await api.post('/orders', payload);
      clearCart();
      setForm(initialForm);
      window.dispatchEvent(new Event('bharatmart-customer-change'));
      navigate(`/thank-you?orderId=${data.orderId}`);
    } catch (error) {
      setStatus(error.response?.data?.message || error.message || 'Unable to place order right now. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (!cartItems.length) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center animate-page">
        <div className="rounded-[36px] bg-white p-8 shadow-soft md:p-12">
          <p className="mx-auto inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
            Cart is empty
          </p>
          <h1 className="mt-5 text-4xl font-black text-ink">Add products before checkout</h1>
          <p className="mt-3 text-slate-600">
            To place an order, please add at least one product to your cart. Your selected products will appear here with images, discounts, and delivery summary.
          </p>
          <Link to="/" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 font-bold text-white transition active:scale-95 hover:bg-orange-500">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10">
      <div className="mb-8 overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-50 via-white to-orange-50 p-6 shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-600">Secure Checkout</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">Billing, Account & COD Order</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Review selected products, confirm your details, and place a Cash on Delivery order.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,420px]">
        <form onSubmit={placeOrder} className="space-y-6 rounded-[32px] bg-white p-5 shadow-soft sm:p-8">
          <section>
            <h2 className="text-2xl font-black text-ink">Contact Information</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input required placeholder="Full name" className="rounded-2xl border border-slate-200 px-4 py-3" value={form.customerName} onChange={(event) => updateForm('customerName', event.target.value)} />
              <input required placeholder="Phone number" className="rounded-2xl border border-slate-200 px-4 py-3" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
              <input required type="email" placeholder="Email address" className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" value={form.email} onChange={(event) => updateForm('email', event.target.value)} />
            </div>
          </section>

          {!customer ? (
            <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
              <h2 className="text-2xl font-black text-ink">Create Account at Checkout</h2>
              <p className="mt-2 text-sm text-slate-600">Required for order tracking and profile dashboard.</p>
              <input required type="password" placeholder="Create password (min 6 characters)" className="mt-4 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3" value={form.password} onChange={(event) => updateForm('password', event.target.value)} />
            </section>
          ) : (
            <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 text-sm font-bold text-emerald-700">
              Logged in as {customer.name}. Your order will appear in your profile tracking dashboard.
            </section>
          )}

          <section className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
            <h2 className="text-2xl font-black text-ink">Billing Address</h2>
            <textarea required placeholder="House / flat, street, city, state, PIN code" className="mt-4 min-h-28 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3" value={form.billingAddress} onChange={(event) => updateForm('billingAddress', event.target.value)} />
          </section>

          <section className="rounded-3xl border border-orange-100 bg-orange-50/70 p-5">
            <label className="flex items-start gap-3 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={form.sameAsBilling} onChange={(event) => updateForm('sameAsBilling', event.target.checked)} className="mt-1 h-4 w-4 accent-orange-500" />
              Shipping address is same as billing address
            </label>
            {!form.sameAsBilling ? (
              <textarea required placeholder="Shipping address" className="mt-4 min-h-28 w-full rounded-2xl border border-orange-100 bg-white px-4 py-3" value={form.shippingAddress} onChange={(event) => updateForm('shippingAddress', event.target.value)} />
            ) : null}
          </section>

          <section className="rounded-3xl border border-slate-200 p-5">
            <h2 className="text-2xl font-black text-ink">Payment Method</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ['COD', 'Cash on Delivery', 'Available now'],
                ['CARD', 'Card Payment', 'In development'],
                ['UPI', 'UPI / Razorpay', 'In development']
              ].map(([value, label, note]) => (
                <label key={value} className={`rounded-2xl border p-4 ${form.paymentMethod === value ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white'}`}>
                  <input type="radio" name="payment" value={value} checked={form.paymentMethod === value} onChange={(event) => updateForm('paymentMethod', event.target.value)} className="accent-orange-500" />
                  <span className="ml-2 font-black text-ink">{label}</span>
                  <p className={`mt-2 text-xs font-bold ${value === 'COD' ? 'text-emerald-600' : 'text-slate-500'}`}>{note}</p>
                </label>
              ))}
            </div>
            <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
              Card, UPI, and Razorpay are in development. COD is active now.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 p-5">
            <label className="flex items-start gap-3 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={form.monthlyOffers} onChange={(event) => updateForm('monthlyOffers', event.target.checked)} className="mt-1 h-4 w-4 accent-emerald-500" />
              Send me monthly offers, coupons, and restock alerts by email.
            </label>
            <textarea placeholder="Add order note, delivery instruction, or preferred call time" className="mt-4 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3" value={form.note} onChange={(event) => updateForm('note', event.target.value)} />
          </section>

          <button disabled={placing} className="w-full rounded-full bg-ink px-6 py-4 font-bold text-white transition active:scale-95 hover:bg-orange-500 disabled:opacity-60">
            {placing ? 'Placing COD Order...' : 'Place COD Order'}
          </button>
          {status ? <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{status}</p> : null}
        </form>

        <aside className="h-fit rounded-[32px] bg-white p-5 shadow-soft sm:p-6 lg:sticky lg:top-36">
          <h2 className="text-2xl font-black text-ink">Order Summary</h2>
          <div className="mt-5 space-y-4">
            {cartItems.map((item) => {
              const salePrice = Math.round(item.price - (item.price * item.discount) / 100);
              return (
                <div key={item.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                  <img src={item.imageUrls?.[0]} alt={item.title} className="h-16 w-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold text-ink">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Qty {item.quantity}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-black text-ink">Rs {salePrice * item.quantity}</span>
                      <span className="text-slate-400 line-through">Rs {Math.round(item.price * item.quantity)}</span>
                      <span className="font-bold text-emerald-600">{item.discount}% off</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between"><span>MRP Total</span><span className="line-through text-slate-400">Rs {Math.round(mrpTotal)}</span></div>
            <div className="flex justify-between"><span>Discounted Price</span><span className="font-bold text-ink">Rs {Math.round(cartSubtotal)}</span></div>
            <div className="flex justify-between"><span>You Save</span><span className="font-bold text-emerald-600">Rs {Math.round(savings)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span><span className="text-slate-400 line-through">Rs {SHIPPING_CHARGE}</span> <span className="font-bold text-emerald-600">Free</span></span></div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-ink"><span>Total</span><span>Rs {Math.round(cartSubtotal)}</span></div>
          </div>

          <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-xs text-slate-700">
            <p className="font-black text-orange-700">Customer Details</p>
            <p className="mt-2">{form.customerName || 'Name pending'} • {form.phone || 'Phone pending'}</p>
            <p className="mt-1">{form.email || 'Email pending'}</p>
            <p className="mt-1 line-clamp-3">Ship to: {finalShippingAddress || 'Address pending'}</p>
          </div>

          <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
            COD Available on every product. You pay only when the order reaches your doorstep.
          </p>
        </aside>
      </div>
    </section>
  );
}
