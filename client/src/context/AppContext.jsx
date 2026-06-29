import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Initialize state synchronously from localStorage to prevent flicker
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
  
  // Load orders from localStorage first, then merge with server data
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_orders');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  // Load maintenance requests from localStorage
  const [maintenanceRequests, setMaintenanceRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('rentease_maintenance');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = '/api';

  // Mark auth as loaded and pre-fetch products
  useEffect(() => {
    setAuthLoaded(true);
    fetch(`${API}/products`).then(r => r.json()).then(setProducts).catch(() => {});
  }, []);

  // Persist cart, orders, and maintenance to localStorage
  useEffect(() => {
    localStorage.setItem('rentease_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('rentease_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('rentease_maintenance', JSON.stringify(maintenanceRequests));
  }, [maintenanceRequests]);

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
    
    // Fetch orders for user (merge with local)
    if (data.user.role === 'user') {
      fetchUserOrders(data.user.id);
    }
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
    // Don't clear orders or maintenance - they should persist per user
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
    
    // Create order locally first
    const localOrder = {
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      items: cart,
      deliveryDate,
      address,
      status: 'active',
      createdAt: new Date().toISOString(),
      totalMonthly: cart.reduce((s, i) => s + i.monthlyRent * i.quantity, 0),
      totalDeposit: cart.reduce((s, i) => s + i.securityDeposit * i.quantity, 0),
    };
    
    // Add to local state immediately
    setOrders(prev => [localOrder, ...prev]);
    
    // Try to save to server (but don't fail if server is down)
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, items: cart, deliveryDate, address }),
      });
      if (res.ok) {
        const serverOrder = await res.json();
        // Update local order with server ID
        setOrders(prev => prev.map(o => o.id === localOrder.id ? serverOrder : o));
      }
    } catch (e) {
      // Server save failed, but order is still in localStorage
      console.warn('Failed to save order to server, but saved locally:', e);
    }
    
    clearCart();
    return localOrder;
  };

  const fetchUserOrders = async (userId) => {
    const targetUserId = userId || user?.id;
    try {
      const res = await fetch(`${API}/orders?userId=${targetUserId}`);
      const serverOrders = await res.json();
      
      // Merge server orders with local orders
      setOrders(prev => {
        const localOrders = prev.filter(o => o.id.startsWith('local-') && o.userId === targetUserId);
        const merged = [...serverOrders, ...localOrders];
        
        // Remove duplicates (prefer server orders)
        const seen = new Set();
        return merged.filter(o => {
          if (seen.has(o.id)) return false;
          seen.add(o.id);
          return true;
        });
      });
    } catch (e) {
      // If server fetch fails, keep local orders
      console.warn('Failed to fetch orders from server:', e);
    }
  };

  const requestMaintenance = async (orderId, description) => {
    if (!user) throw new Error('Please login first');
    
    // Create maintenance request locally first
    const localRequest = {
      id: 'local-maint-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      orderId,
      userId: user.id,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    // Add to local state immediately
    setMaintenanceRequests(prev => [localRequest, ...prev]);
    
    // Try to save to server
    try {
      const res = await fetch(`${API}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, userId: user.id, description }),
      });
      if (res.ok) {
        const serverRequest = await res.json();
        // Update local request with server ID
        setMaintenanceRequests(prev => prev.map(r => r.id === localRequest.id ? serverRequest : r));
      }
    } catch (e) {
      console.warn('Failed to save maintenance request to server:', e);
    }
    
    return localRequest;
  };

  const updateMaintenanceStatus = async (requestId, status) => {
    // Update locally first
    setMaintenanceRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r
    ));
    
    // Try to update on server
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
    try {
      const res = await fetch(`${API}/maintenance`);
      const serverRequests = await res.json();
      
      // Merge with local requests
      setMaintenanceRequests(prev => {
        const localReqs = prev.filter(r => r.id.startsWith('local-'));
        const merged = [...serverRequests, ...localReqs];
        
        // Remove duplicates
        const seen = new Set();
        return merged.filter(r => {
          if (seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        });
      });
      
      return serverRequests;
    } catch (e) {
      console.warn('Failed to fetch maintenance requests:', e);
      return maintenanceRequests;
    }
  };

  // Admin functions
  const fetchAdminOrders = async () => {
    try {
      const res = await fetch(`${API}/admin/orders`);
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch admin orders:', e);
      return orders;
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${API}/admin/stats`);
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch admin stats:', e);
      return {
        totalProducts: products.length,
        activeRentals: orders.filter(o => o.status === 'active').length,
        totalUsers: 3, // Demo users
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
