import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Initialize synchronously from localStorage to avoid null-on-refresh bug
    try {
      const saved = localStorage.getItem('rentease_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [authLoaded, setAuthLoaded] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = '/api';

  // Mark auth as loaded after first render
  useEffect(() => {
    setAuthLoaded(true);
    // Pre-fetch products immediately so they are ready when user navigates
    fetch(`${API}/products`).then(r => r.json()).then(setProducts).catch(() => {});
    // Pre-fetch orders if user exists
    if (user && user.role === 'user') {
      fetch(`${API}/orders?userId=${user.id}`).then(r => r.json()).then(setOrders).catch(() => {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rentease_cart', JSON.stringify(cart));
  }, [cart]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setUser(data.user);
    localStorage.setItem('rentease_user', JSON.stringify(data.user));
    if (data.user.role === 'user') fetchUserOrders(data.user.id);
    return data.user;
  };

  const register = async (name, email, password, phone) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setUser(data.user);
    localStorage.setItem('rentease_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setOrders([]);
    localStorage.removeItem('rentease_user');
    localStorage.removeItem('rentease_cart');
  };

  const fetchProducts = async (category, search) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    try {
      const res = await fetch(`${API}/products?${params}`);
      const data = await res.json();
      setProducts(data);
    } catch (e) { /* keep existing products on error */ }
    setLoading(false);
  };

  const addToCart = (product, tenure, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id && i.tenure === tenure);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id && i.tenure === tenure
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { productId: product.id, name: product.name, image: product.image, monthlyRent: product.monthlyRent, securityDeposit: product.securityDeposit, tenure, quantity }];
    });
  };

  const removeFromCart = (productId, tenure) => {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.tenure === tenure)));
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (deliveryDate, address) => {
    if (!user) throw new Error('Please login first');
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, items: cart, deliveryDate, address }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    clearCart();
    fetchUserOrders(user.id);
    return data;
  };

  const fetchUserOrders = async (userId) => {
    try {
      const res = await fetch(`${API}/orders?userId=${userId || user?.id}`);
      const data = await res.json();
      setOrders(data);
    } catch (e) { /* ignore */ }
  };

  const requestMaintenance = async (orderId, description) => {
    const res = await fetch(`${API}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, userId: user.id, description }),
    });
    if (!res.ok) throw new Error('Failed to submit request');
    return res.json();
  };

  const updateMaintenanceStatus = async (requestId, status) => {
    const res = await fetch(`${API}/maintenance/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  };

  const fetchMaintenanceRequests = async () => {
    const res = await fetch(`${API}/maintenance`);
    return res.json();
  };

  // Admin functions
  const fetchAdminOrders = async () => {
    const res = await fetch(`${API}/admin/orders`);
    return res.json();
  };

  const fetchAdminStats = async () => {
    const res = await fetch(`${API}/admin/stats`);
    return res.json();
  };

  return (
    <AppContext.Provider value={{
      user, authLoaded, cart, products, orders, loading,
      login, register, logout,
      fetchProducts, addToCart, removeFromCart, clearCart,
      placeOrder, fetchUserOrders, requestMaintenance,
      fetchAdminOrders, fetchAdminStats, fetchMaintenanceRequests,
      updateMaintenanceStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
