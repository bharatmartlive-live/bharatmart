import { Download, MessageCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { api } from '../../lib/api';
import { parseSpecificationText, stringifySpecifications } from '../../lib/specifications';
import { BarChart3, MousePointerClick, ShoppingCart, Users } from 'lucide-react';

const initialProduct = {
  title: '',
  description: '',
  price: '',
  discount: '',
  stock: '',
  category: 'Trending Summer Products',
  featured: true,
  imageUrlsText: '',
  videoUrl: '',
  specificationsText: '',
  specifications: [{ label: '', value: '' }]
};

const toProductPayload = (form) => ({
  title: form.title,
  description: form.description,
  price: Number(form.price),
  discount: Number(form.discount || 0),
  stock: Number(form.stock || 0),
  category: form.category,
  featured: Boolean(form.featured),
  imageUrls: form.imageUrlsText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  videoUrl: form.videoUrl,
  specifications: [...form.specifications, ...parseSpecificationText(form.specificationsText)]
    .map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
    .filter((item) => item.label && item.value)
});

const parseJsonField = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
};

const normalizePhoneForWhatsapp = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const extractOrderField = (address = '', label) => {
  const line = String(address)
    .split('\n')
    .find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line ? line.replace(new RegExp(`^${label}:\\s*`, 'i'), '') : '';
};

const getOrderWhatsappUrl = (order) => {
  const phone = normalizePhoneForWhatsapp(order.phone);
  if (!phone) return '#';

  const message = `Hello ${order.customer_name}, thanks for ordering with BharatMart.live. Your order #${order.id} has been received. You will receive your product in 3-7 days. We have also included a hidden gift inside your package. For more information contact us on +918826333790.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const exportOrdersToExcel = (orders) => {
  const rows = orders.map((order) => ({
    'Order ID': order.id,
    'Customer Name': order.customer_name,
    Email: order.email,
    Phone: order.phone,
    Status: order.status,
    'Payment Method': extractOrderField(order.address, 'Payment') || 'COD',
    'Coupon Used': extractOrderField(order.address, 'Coupon') || 'No coupon',
    'Billing Address': extractOrderField(order.address, 'Billing') || order.address,
    'Shipping Address': extractOrderField(order.address, 'Shipping') || extractOrderField(order.address, 'Billing') || order.address,
    Note: extractOrderField(order.address, 'Note') || 'No note',
    'Total Price': Number(order.total_price || 0),
    'Created At': order.created_at
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
  XLSX.writeFile(workbook, `bharatmart-sales-${new Date().toISOString().slice(0, 10)}.xlsx`);
};

const emptyAnalytics = {
  overview: {
    uniqueVisitors: 0,
    pageViews: 0,
    productViews: 0,
    addToCartEvents: 0,
    uniqueVisitors7d: 0,
    pageViews7d: 0,
    productViews7d: 0,
    addToCartEvents7d: 0,
    addToCartRate: 0
  },
  products: []
};

const formatAnalyticsDate = (value) => {
  if (!value) return 'No activity yet';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'No activity yet'
    : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

export function AdminDashboard({ initialView = 'catalog' }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('bharatmart-admin-token') || '');
  const [activeView, setActiveView] = useState(initialView);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [productForm, setProductForm] = useState(initialProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [couponForm, setCouponForm] = useState({ code: '', discount: '', active: true });
  const [dashboard, setDashboard] = useState({
    products: [],
    orders: [],
    announcements: [],
    coupons: [],
    analytics: emptyAnalytics
  });
  const [message, setMessage] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  const loadDashboard = async () => {
    if (!token) return;
    const { data } = await api.get('/admin/dashboard', { headers: authHeaders });
    setDashboard(data.data);
  };

  useEffect(() => {
    loadDashboard().catch(() => {});
  }, [token]);

  const orderMetrics = useMemo(() => {
    const totalRevenue = dashboard.orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
    return {
      totalRevenue,
      totalOrders: dashboard.orders.length,
      pending: dashboard.orders.filter((order) => order.status === 'Pending').length,
      shipped: dashboard.orders.filter((order) => order.status === 'Shipped').length,
      delivered: dashboard.orders.filter((order) => order.status === 'Delivered').length
    };
  }, [dashboard.orders]);

  const analyticsOverview = dashboard.analytics?.overview || emptyAnalytics.overview;
  const analyticsProducts = dashboard.analytics?.products || [];
  const analyticsByProductId = useMemo(
    () => new Map(analyticsProducts.map((product) => [String(product.id), product])),
    [analyticsProducts]
  );

  const switchView = (view) => {
    setActiveView(view);
    navigate(view === 'sales' ? '/admin/sales' : '/admin');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginStatus('Checking admin credentials, please wait...');

    try {
      const { data } = await api.post('/users/admin-login', loginForm);
      localStorage.setItem('bharatmart-admin-token', data.token);
      setToken(data.token);
      setMessage('Admin login successful. Loading dashboard...');
      setLoginStatus('Logged in successfully. Loading dashboard...');
    } catch (error) {
      setLoginStatus(error.response?.data?.message || 'Admin login failed. Please check email and password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setMessage(editingProductId ? 'Updating product, please wait...' : 'Saving product, please wait...');

    try {
      const payload = toProductPayload(productForm);

      if (editingProductId) {
        await api.put(`/admin/products/${editingProductId}`, payload, { headers: authHeaders });
        setMessage('Product updated successfully.');
      } else {
        await api.post('/admin/products', payload, { headers: authHeaders });
        setMessage('Product created successfully.');
      }

      setProductForm(initialProduct);
      setEditingProductId(null);
      loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save product right now. Please check the fields and try again.');
    }
  };

  const handleAnnouncementSubmit = async (event) => {
    event.preventDefault();
    await api.post('/admin/announcements', { text: announcementText, active: true }, { headers: authHeaders });
    setAnnouncementText('');
    setMessage('Announcement created.');
    loadDashboard();
  };

  const handleCouponSubmit = async (event) => {
    event.preventDefault();
    await api.post('/admin/coupons', couponForm, { headers: authHeaders });
    setCouponForm({ code: '', discount: '', active: true });
    setMessage('Coupon created.');
    loadDashboard();
  };

  const updateOrderStatus = async (orderId, status) => {
    await api.patch(`/admin/orders/${orderId}`, { status }, { headers: authHeaders });
    setMessage('Order status updated.');
    loadDashboard();
  };

  const editProduct = (product) => {
    const specifications = parseJsonField(product.specifications, []);

    setEditingProductId(product.id);
    setProductForm({
      ...initialProduct,
      title: product.title,
      description: product.description,
      price: product.price,
      discount: product.discount,
      stock: product.stock,
      category: product.category,
      featured: Boolean(product.featured),
      imageUrlsText: parseJsonField(product.image_urls, []).join(', '),
      videoUrl: product.video_url || '',
      specifications,
      specificationsText: stringifySpecifications(specifications)
    });
    setMessage(`Editing "${product.title}". Update the fields and click Update Product.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSpecificationRow = (index, field, value) => {
    setProductForm((current) => ({
      ...current,
      specifications: current.specifications.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    }));
  };

  const addSpecificationRow = () => {
    setProductForm((current) => ({
      ...current,
      specifications: [...current.specifications, { label: '', value: '' }]
    }));
  };

  const removeSpecificationRow = (index) => {
    setProductForm((current) => ({
      ...current,
      specifications: current.specifications.filter((row, rowIndex) => rowIndex !== index)
    }));
  };

  const deleteProduct = async (productId) => {
    await api.delete(`/products/${productId}`, { headers: authHeaders });
    setMessage('Product deleted.');
    if (editingProductId === productId) {
      setEditingProductId(null);
      setProductForm(initialProduct);
    }
    loadDashboard();
  };

  const toggleCoupon = async (coupon) => {
    await api.patch(`/admin/coupons/${coupon.id}`, { active: !coupon.active }, { headers: authHeaders });
    setMessage('Coupon status updated.');
    loadDashboard();
  };

  const toggleAnnouncement = async (announcement) => {
    await api.patch(`/admin/announcements/${announcement.id}`, { active: !announcement.active }, { headers: authHeaders });
    setMessage('Announcement status updated.');
    loadDashboard();
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-black text-ink">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-600">Secure JWT login for BharatMart operations.</p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Admin email"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand"
            value={loginForm.email}
            onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand"
            value={loginForm.password}
            onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
          />
          <button disabled={loginLoading} className="w-full rounded-full bg-ink px-5 py-3 font-semibold text-white transition hover:bg-brand hover:text-navy disabled:opacity-60">
            {loginLoading ? 'Please wait...' : 'Login'}
          </button>
          {loginStatus ? <p className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">{loginStatus}</p> : null}
        </form>
      </div>
    );
  }

  if (activeView === 'sales') {
    return (
      <div className="space-y-8">
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-ink">Sales Dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">View all customer orders, addresses, coupons, and download the full sheet.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => switchView('catalog')} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                Back to Catalog
              </button>
              <button type="button" onClick={() => exportOrdersToExcel(dashboard.orders)} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">
                <Download className="h-4 w-4" /> Download Excel
              </button>
            </div>
          </div>
          {message ? <p className="mt-4 text-sm font-medium text-accent">{message}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-5">
          <div className="rounded-[24px] bg-white p-5 shadow-soft"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Total Orders</p><p className="mt-2 text-3xl font-black text-ink">{orderMetrics.totalOrders}</p></div>
          <div className="rounded-[24px] bg-white p-5 shadow-soft"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Pending</p><p className="mt-2 text-3xl font-black text-orange-600">{orderMetrics.pending}</p></div>
          <div className="rounded-[24px] bg-white p-5 shadow-soft"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Shipped</p><p className="mt-2 text-3xl font-black text-blue-600">{orderMetrics.shipped}</p></div>
          <div className="rounded-[24px] bg-white p-5 shadow-soft"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Delivered</p><p className="mt-2 text-3xl font-black text-emerald-600">{orderMetrics.delivered}</p></div>
          <div className="rounded-[24px] bg-white p-5 shadow-soft"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Revenue</p><p className="mt-2 text-2xl font-black text-ink">Rs {Math.round(orderMetrics.totalRevenue)}</p></div>
        </div>

        <section className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-3 py-3">Order</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Addresses</th>
                  <th className="px-3 py-3">Coupon</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 align-top">
                    <td className="px-3 py-4">
                      <p className="font-black text-ink">#{order.id}</p>
                      <p className="text-xs text-slate-500">{order.status}</p>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-ink">{order.customer_name}</p>
                      <p className="text-slate-500">{order.phone}</p>
                      <p className="text-slate-500">{order.email}</p>
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      <p><span className="font-semibold text-ink">Billing:</span> {extractOrderField(order.address, 'Billing') || order.address}</p>
                      <p className="mt-2"><span className="font-semibold text-ink">Shipping:</span> {extractOrderField(order.address, 'Shipping') || extractOrderField(order.address, 'Billing') || order.address}</p>
                    </td>
                    <td className="px-3 py-4 text-slate-600">{extractOrderField(order.address, 'Coupon') || 'No coupon'}</td>
                    <td className="px-3 py-4 font-black text-ink">Rs {Math.round(Number(order.total_price || 0))}</td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-2">
                        <a href={getOrderWhatsappUrl(order)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600">
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Update
                        </a>
                        <div className="flex flex-wrap gap-2">
                          {['Pending', 'Shipped', 'Delivered'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateOrderStatus(order.id, status)}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${order.status === status ? 'bg-brand text-navy' : 'border border-slate-200 bg-white text-slate-600'}`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-ink">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Manage products, announcements, coupons, media, and incoming orders.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => switchView('sales')} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
              See Sales
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('bharatmart-admin-token');
                setToken('');
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
        {message ? <p className="mt-4 text-sm font-medium text-accent">{message}</p> : null}
      </div>

      <section className="rounded-[28px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-ink">Customer Activity Insights</h2>
            <p className="mt-2 text-sm text-slate-600">
              Approximate visitor analytics based on real browser sessions, product page opens, and add-to-cart actions.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Last 7 days shown under each card
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Unique Visitors',
              value: analyticsOverview.uniqueVisitors,
              detail: `${analyticsOverview.uniqueVisitors7d} in last 7 days`,
              icon: Users,
              bg: 'bg-blue-50 text-blue-600'
            },
            {
              title: 'Page Views',
              value: analyticsOverview.pageViews,
              detail: `${analyticsOverview.pageViews7d} in last 7 days`,
              icon: BarChart3,
              bg: 'bg-violet-50 text-violet-600'
            },
            {
              title: 'Product Clicks',
              value: analyticsOverview.productViews,
              detail: `${analyticsOverview.productViews7d} in last 7 days`,
              icon: MousePointerClick,
              bg: 'bg-orange-50 text-orange-600'
            },
            {
              title: 'Add To Cart',
              value: analyticsOverview.addToCartEvents,
              detail: `${analyticsOverview.addToCartEvents7d} in last 7 days | ${analyticsOverview.addToCartRate}% rate`,
              icon: ShoppingCart,
              bg: 'bg-emerald-50 text-emerald-600'
            }
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className={`inline-flex rounded-2xl p-3 ${item.bg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">{item.title}</p>
                <p className="mt-2 text-3xl font-black text-ink">{item.value.toLocaleString('en-IN')}</p>
                <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <form onSubmit={handleProductSubmit} className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-ink">{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
            {editingProductId ? (
              <button type="button" onClick={() => { setEditingProductId(null); setProductForm(initialProduct); }} className="text-sm font-semibold text-slate-500">
                Cancel edit
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-4">
            <input placeholder="Product title" className="rounded-2xl border border-slate-200 px-4 py-3" value={productForm.title} onChange={(event) => setProductForm((current) => ({ ...current, title: event.target.value }))} />
            <textarea placeholder="Description" className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3" value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} />
            <div className="grid gap-4 md:grid-cols-2">
              <input placeholder="Price" type="number" className="rounded-2xl border border-slate-200 px-4 py-3" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} />
              <input placeholder="Discount %" type="number" className="rounded-2xl border border-slate-200 px-4 py-3" value={productForm.discount} onChange={(event) => setProductForm((current) => ({ ...current, discount: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input placeholder="Stock" type="number" className="rounded-2xl border border-slate-200 px-4 py-3" value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} />
              <select className="rounded-2xl border border-slate-200 px-4 py-3" value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}>
                <option>Trending Summer Products</option>
                <option>Hot Deals</option>
                <option>Recommended for You</option>
              </select>
            </div>
            <textarea placeholder="Image URLs separated by commas" className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3" value={productForm.imageUrlsText} onChange={(event) => setProductForm((current) => ({ ...current, imageUrlsText: event.target.value }))} />
            <input placeholder="Video URL" className="rounded-2xl border border-slate-200 px-4 py-3" value={productForm.videoUrl} onChange={(event) => setProductForm((current) => ({ ...current, videoUrl: event.target.value }))} />

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-ink">Product Specification Table</h3>
                  <p className="mt-1 text-xs text-slate-500">Paste rows like "Cooler Type: Desert" or paste two-column table data from Excel/Sheets.</p>
                </div>
                <button type="button" onClick={addSpecificationRow} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">Add row</button>
              </div>
              <div className="mt-4 space-y-3">
                {productForm.specifications.map((row, index) => (
                  <div key={index} className="grid gap-3 md:grid-cols-[1fr,1fr,auto]">
                    <input placeholder="Column / label" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" value={row.label} onChange={(event) => updateSpecificationRow(index, 'label', event.target.value)} />
                    <input placeholder="Value" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" value={row.value} onChange={(event) => updateSpecificationRow(index, 'value', event.target.value)} />
                    <button type="button" onClick={() => removeSpecificationRow(index)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-red-500">Remove</button>
                  </div>
                ))}
              </div>
              <textarea placeholder="Paste specification table here" className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" value={productForm.specificationsText} onChange={(event) => setProductForm((current) => ({ ...current, specificationsText: event.target.value }))} />
            </div>

            <button className="rounded-full bg-brand px-5 py-3 font-semibold text-navy">{editingProductId ? 'Update Product' : 'Save Product'}</button>
          </div>
        </form>

        <div className="space-y-8">
          <form onSubmit={handleAnnouncementSubmit} className="rounded-[28px] bg-white p-6 shadow-soft">
            <h2 className="text-xl font-black text-ink">Announcement Banner</h2>
            <p className="mt-2 text-sm text-slate-500">Paste the full scrolling text exactly as you want it to run in the top header bar.</p>
            <input placeholder="MEGA SALE: Flat 15% OFF on ALL Products! | Hurry! Limited Time Offer Apply HEATWAVE10 and grab your discount before it is gone! | Offer ends 15 July 2026" className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" value={announcementText} onChange={(event) => setAnnouncementText(event.target.value)} />
            <button className="mt-4 rounded-full bg-ink px-5 py-3 font-semibold text-white">Publish Banner</button>
            <div className="mt-4 space-y-2">
              {dashboard.announcements.map((announcement) => (
                <div key={announcement.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="pr-3 text-slate-600">{announcement.text}</span>
                  <button type="button" onClick={() => toggleAnnouncement(announcement)} className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold">{announcement.active ? 'Disable' : 'Enable'}</button>
                </div>
              ))}
            </div>
          </form>

          <form onSubmit={handleCouponSubmit} className="rounded-[28px] bg-white p-6 shadow-soft">
            <h2 className="text-xl font-black text-ink">Coupons</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input placeholder="Code" className="rounded-2xl border border-slate-200 px-4 py-3" value={couponForm.code} onChange={(event) => setCouponForm((current) => ({ ...current, code: event.target.value }))} />
              <input placeholder="Discount %" type="number" className="rounded-2xl border border-slate-200 px-4 py-3" value={couponForm.discount} onChange={(event) => setCouponForm((current) => ({ ...current, discount: event.target.value }))} />
            </div>
            <button className="mt-4 rounded-full bg-accent px-5 py-3 font-semibold text-white">Save Coupon</button>
            <div className="mt-4 space-y-2">
              {dashboard.coupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-ink">{coupon.code} ({coupon.discount}%)</span>
                  <button type="button" onClick={() => toggleCoupon(coupon)} className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold">{coupon.active ? 'Disable' : 'Enable'}</button>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>

      <section className="rounded-[28px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-ink">Top Product Performance</h2>
            <p className="mt-2 text-sm text-slate-600">
              See which products customers are opening most and which ones convert into add-to-cart actions.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Clicks = product detail opens
          </div>
        </div>

        {analyticsProducts.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">Clicks</th>
                  <th className="px-3 py-3">Add To Cart</th>
                  <th className="px-3 py-3">Conversion</th>
                  <th className="px-3 py-3">Interested Visitors</th>
                  <th className="px-3 py-3">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {analyticsProducts.slice(0, 10).map((product) => (
                  <tr key={product.id} className="border-b border-slate-100">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-ink">{product.title}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </td>
                    <td className="px-3 py-4 font-black text-ink">
                      {product.views.toLocaleString('en-IN')}
                      <p className="mt-1 text-xs font-medium text-slate-500">{product.views7d} in last 7 days</p>
                    </td>
                    <td className="px-3 py-4 font-black text-ink">
                      {product.addToCart.toLocaleString('en-IN')}
                      <p className="mt-1 text-xs font-medium text-slate-500">{product.addToCart7d} in last 7 days</p>
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        {product.addToCartRate}%
                      </span>
                    </td>
                    <td className="px-3 py-4 text-slate-600">{product.interestedVisitors.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-4 text-slate-600">{formatAnalyticsDate(product.lastInteractionAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            No analytics recorded yet. Once visitors open products or add items to cart, the insights will show here automatically.
          </div>
        )}
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-ink">Products</h2>
            <button type="button" onClick={() => switchView('sales')} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">See Sales</button>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.products.map((product) => (
              <div key={product.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{product.title}</p>
                    <p className="text-sm text-slate-500">Rs {product.price} - {product.stock} in stock</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {analyticsByProductId.get(String(product.id))?.views || 0} clicks
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        {analyticsByProductId.get(String(product.id))?.addToCart || 0} add to cart
                      </span>
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                        {analyticsByProductId.get(String(product.id))?.addToCartRate || 0}% conversion
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => editProduct(product)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold">Edit</button>
                    <button type="button" onClick={() => deleteProduct(product.id)} className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-black text-ink">Latest Orders</h2>
          <div className="mt-4 space-y-4">
            {dashboard.orders.slice(0, 6).map((order) => (
              <div key={order.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-ink">Order #{order.id}</p>
                <p className="text-sm text-slate-600">{order.customer_name} - {order.phone}</p>
                <p className="mt-1 text-sm text-slate-500">Rs {Math.round(Number(order.total_price || 0))} - {order.status}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={getOrderWhatsappUrl(order)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Update
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
