import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
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
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_orders');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [maintenanceRequests, setMaintenanceRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_maintenance');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_products');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(false);

  const API = '/api';

  useEffect(() => {
    setAuthLoaded(true);
    fetch(`${API}/products`).then(r => r.json()).then(data => {
      setProducts(data);
      localStorage.setItem('rentease_products', JSON.stringify(data));
    }).catch(() => {
      const saved = localStorage.getItem('rentease_products');
      if (saved) setProducts(JSON.parse(saved));
    });
  }, []);

  useEffect(() => { localStorage.setItem('rentease_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('rentease_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('rentease_maintenance', JSON.stringify(maintenanceRequests)); }, [maintenanceRequests]);

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
      localStorage.setItem('rentease_products', JSON.stringify(data));
    } catch (e) { /* keep existing */ }
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
      return [...prev, {
        productId: product.id,
        name: product.name,
        image: product.image,
        monthlyRent: product.monthlyRent,
        securityDeposit: product.securityDeposit,
        tenure,
        quantity
      }];
    });
  };

  const removeFromCart = (productId, tenure) => {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.tenure === tenure)));
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (deliveryDate, address) => {
    if (!user) throw new Error('Please login first');
    if (cart.length === 0) throw new Error('Cart is empty');

    // DEEP COPY all cart items - this is critical to prevent data loss
    const cartSnapshot = JSON.parse(JSON.stringify(cart));

    const localOrder = {
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      items: cartSnapshot,
      deliveryDate,
      address,
      status: 'active',
      createdAt: new Date().toISOString(),
      totalMonthly: cartSnapshot.reduce((s, i) => s + i.monthlyRent * i.quantity, 0),
      totalDeposit: cartSnapshot.reduce((s, i) => s + i.securityDeposit * i.quantity, 0),
    };

    // Save to local state IMMEDIATELY - this persists to localStorage via useEffect
    setOrders(prev => [localOrder, ...prev]);

    // Clear cart right after saving order
    clearCart();

    // Try to sync with server in background
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items: cartSnapshot,
          deliveryDate,
          address
        }),
      });
      if (res.ok) {
        const serverOrder = await res.json();
        // Only replace if server order has same or more items
        if (serverOrder.items && serverOrder.items.length >= cartSnapshot.length) {
          setOrders(prev => prev.map(o => o.id === localOrder.id ? serverOrder : o));
        }
        // If server has fewer items, keep our local version (it's more complete)
      }
    } catch (e) {
      console.warn('Server sync failed, order saved locally:', e);
    }

    return localOrder;
  };

  const fetchUserOrders = async (userId) => {
    const targetUserId = userId || user?.id;

    // Always keep local orders - they are the source of truth
    const localOrders = orders.filter(o => o.userId === targetUserId);

    try {
      const res = await fetch(`${API}/orders?userId=${targetUserId}`);
      const serverOrders = await res.json();

      if (serverOrders.length > 0) {
        // Merge: combine server orders with local orders
        // For orders that exist on both, keep the one with MORE items
        const serverMap = new Map(serverOrders.map(o => [o.id, o]));
        const merged = [...serverOrders];

        localOrders.forEach(localOrder => {
          const serverVersion = serverMap.get(localOrder.id);
          if (!serverVersion) {
            // Local-only order (not yet on server) - keep it
            merged.push(localOrder);
          } else if (localOrder.items.length > serverVersion.items.length) {
            // Local has more items - replace server version with local
            const idx = merged.findIndex(o => o.id === localOrder.id);
            if (idx >= 0) merged[idx] = localOrder;
          }
          // Otherwise server version is fine, keep it
        });

        // Sort by date descending
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(merged);
      }
      // If no server orders, keep local orders as-is
    } catch (e) {
      console.warn('Failed to fetch orders from server:', e);
      // Keep local orders
    }
  };

  const requestMaintenance = async (orderId, description) => {
    if (!user) throw new Error('Please login first');

    const localRequest = {
      id: 'local-maint-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      orderId,
      userId: user.id,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setMaintenanceRequests(prev => [localRequest, ...prev]);

    try {
      const res = await fetch(`${API}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, userId: user.id, description }),
      });
      if (res.ok) {
        const serverRequest = await res.json();
        setMaintenanceRequests(prev => prev.map(r => r.id === localRequest.id ? serverRequest : r));
      }
    } catch (e) {
      console.warn('Server sync failed for maintenance:', e);
    }

    return localRequest;
  };

  const updateMaintenanceStatus = async (requestId, status) => {
    setMaintenanceRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r
    ));

    try {
      const res = await fetch(`${API}/maintenance/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMaintenanceRequests(prev => prev.map(r => r.id === requestId ? updated : r));
      }
    } catch (e) {
      console.warn('Failed to update maintenance status on server:', e);
    }
  };

  const fetchMaintenanceRequests = async () => {
    const localReqs = [...maintenanceRequests];
    try {
      const res = await fetch(`${API}/maintenance`);
      const serverReqs = await res.json();

      const merged = [...serverReqs];
      localReqs.forEach(localReq => {
        if (!merged.find(r => r.id === localReq.id)) {
          merged.push(localReq);
        }
      });
      merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMaintenanceRequests(merged);
      return merged;
    } catch (e) {
      console.warn('Failed to fetch maintenance:', e);
      return localReqs;
    }
  };

  const fetchAdminOrders = async () => {
    try {
      const res = await fetch(`${API}/admin/orders`);
      const serverOrders = await res.json();

      // Merge with local orders to show complete picture
      const merged = [...serverOrders];
      orders.forEach(localOrder => {
        if (!merged.find(o => o.id === localOrder.id)) {
          merged.push(localOrder);
        } else {
          // If local has more items, prefer it
          const serverVersion = merged.find(o => o.id === localOrder.id);
          if (serverVersion && localOrder.items.length > serverVersion.items.length) {
            const idx = merged.findIndex(o => o.id === localOrder.id);
            merged[idx] = localOrder;
          }
        }
      });
      return merged;
    } catch (e) {
      return orders;
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${API}/admin/stats`);
      return await res.json();
    } catch (e) {
      return {
        totalProducts: products.length,
        activeRentals: orders.filter(o => o.status === 'active').length,
        totalUsers: 3,
        totalRevenue: orders.reduce((s, o) => s + o.totalMonthly, 0),
        pendingMaintenance: maintenanceRequests.filter(m => m.status === 'pending').length,
      };
    }
  };

  return (
    <AppContext.Provider value={{
      user, authLoaded, cart, products, orders, loading, maintenanceRequests,
      login, register, logout,
      fetchProducts, addToCart, removeFromCart, clearCart,
      placeOrder, fetchUserOrders, requestMaintenance,
      fetchAdminOrders, fetchAdminStats, fetchMaintenanceRequests,
      updateMaintenanceStatus, setOrders, setMaintenanceRequests,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
