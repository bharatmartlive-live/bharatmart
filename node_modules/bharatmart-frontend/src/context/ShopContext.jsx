import { createContext, useEffect, useMemo, useState } from 'react';
import { api, withMediaUrl } from '../lib/api';
import {
  fallbackAnnouncements,
  fallbackCoupons,
  fallbackProducts
} from '../data/fallback';

export const ShopContext = createContext(null);

const CART_KEY = 'bharatmart-cart';

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
};

const parseImages = (product) => ({
  ...product,
  imageUrls: parseJsonArray(product.image_urls).map(withMediaUrl),
  specifications: parseJsonArray(product.specifications),
  video_url: withMediaUrl(product.video_url || '')
});

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [announcements, setAnnouncements] = useState(fallbackAnnouncements);
  const [coupons, setCoupons] = useState(fallbackCoupons);
  const [cartFeedback, setCartFeedback] = useState(null);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let mounted = true;

    async function loadStorefront() {
      try {
        const [productsRes, contentRes] = await Promise.all([
          api.get('/products'),
          api.get('/admin/storefront')
        ]);

        if (!mounted) return;

        setProducts(productsRes.data.data.map(parseImages));
        setAnnouncements(
          contentRes.data.data.announcements.length
            ? contentRes.data.data.announcements.map((item) => item.text)
            : fallbackAnnouncements
        );
        setCoupons(contentRes.data.data.coupons.length ? contentRes.data.data.coupons : fallbackCoupons);
      } catch (error) {
        if (!mounted) return;
        setProducts(fallbackProducts.map(parseImages));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStorefront();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!cartFeedback) return undefined;
    const timer = window.setTimeout(() => setCartFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [cartFeedback]);

  const cartItems = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return product ? { ...product, quantity: item.quantity } : null;
        })
        .filter(Boolean),
    [cart, products]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * (item.price - (item.price * item.discount) / 100),
    0
  );

  const addToCart = (productId) => {
    const product = products.find((item) => item.id === productId);
    if (product) {
      setCartFeedback({
        id: `${productId}-${Date.now()}`,
        title: product.title,
        image: product.imageUrls?.[0]
      });
    }

    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((item) => item.productId !== productId));
      return;
    }

    setCart((current) =>
      current.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const value = {
    products,
    announcements,
    coupons,
    cartItems,
    cartCount,
    cartSubtotal,
    cartFeedback,
    loading,
    addToCart,
    updateQuantity,
    clearCart
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
