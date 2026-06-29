const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── Sample Data ───
const products = [
  { id: '1', name: 'Modern Single Bed', category: 'Furniture', subcategory: 'Bedroom', monthlyRent: 499, securityDeposit: 2000, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop', description: 'Comfortable single bed with quality mattress. Perfect for students and professionals.', inStock: true, rating: 4.5 },
  { id: '2', name: 'Premium Double Bed', category: 'Furniture', subcategory: 'Bedroom', monthlyRent: 799, securityDeposit: 3500, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=400&h=300&fit=crop', description: 'Spacious double bed with premium mattress and headboard.', inStock: true, rating: 4.7 },
  { id: '3', name: 'L-Shape Sofa Set', category: 'Furniture', subcategory: 'Living Room', monthlyRent: 1299, securityDeposit: 5000, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', description: 'Elegant L-shaped sofa with comfortable cushions. Seats 5 people.', inStock: true, rating: 4.8 },
  { id: '4', name: 'Study Table with Chair', category: 'Furniture', subcategory: 'Living Room', monthlyRent: 349, securityDeposit: 1500, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop', description: 'Compact study table with ergonomic chair. Ideal for work from home.', inStock: true, rating: 4.3 },
  { id: '5', name: 'Dining Table (4 Seater)', category: 'Furniture', subcategory: 'Living Room', monthlyRent: 599, securityDeposit: 2500, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop', description: 'Wooden dining table with 4 matching chairs.', inStock: false, rating: 4.4 },
  { id: '6', name: 'Wardrobe (3-Door)', category: 'Furniture', subcategory: 'Bedroom', monthlyRent: 549, securityDeposit: 2500, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop', description: 'Spacious 3-door wardrobe with mirror. Plenty of storage space.', inStock: true, rating: 4.2 },
  { id: '7', name: 'Samsung Double Door Fridge', category: 'Appliances', subcategory: 'Kitchen', monthlyRent: 899, securityDeposit: 4000, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop', description: 'Energy-efficient double door refrigerator with 300L capacity.', inStock: true, rating: 4.6 },
  { id: '8', name: 'Fully Automatic Washing Machine', category: 'Appliances', subcategory: 'Kitchen', monthlyRent: 699, securityDeposit: 3000, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=300&fit=crop', description: '7kg fully automatic front-load washing machine.', inStock: true, rating: 4.5 },
  { id: '9', name: '55 inch Smart TV', category: 'Appliances', subcategory: 'Entertainment', monthlyRent: 999, securityDeposit: 5000, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop', description: '55-inch 4K Ultra HD Smart TV with built-in streaming apps.', inStock: true, rating: 4.7 },
  { id: '10', name: 'Microwave Oven', category: 'Appliances', subcategory: 'Kitchen', monthlyRent: 299, securityDeposit: 1200, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=300&fit=crop', description: '25L convection microwave oven with grill function.', inStock: true, rating: 4.1 },
  { id: '11', name: '1.5 Ton AC', category: 'Appliances', subcategory: 'Bedroom', monthlyRent: 1199, securityDeposit: 5000, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1625961332071-b5cd7e6375c4?w=400&h=300&fit=crop', description: 'Energy-efficient 1.5 ton split AC with inverter technology.', inStock: true, rating: 4.4 },
  { id: '12', name: 'Water Purifier (RO+UV)', category: 'Appliances', subcategory: 'Kitchen', monthlyRent: 399, securityDeposit: 2000, tenure: [3, 6, 12], image: 'https://images.unsplash.com/photo-1585687433492-9fe85d32771c?w=400&h=300&fit=crop', description: 'Advanced RO+UV water purifier for clean drinking water.', inStock: true, rating: 4.3 },
];

let users = [
  { id: '1', name: 'Admin User', email: 'admin@rentease.com', password: 'admin123', role: 'admin', phone: '9999999999' },
  { id: '2', name: 'Demo User', email: 'demo@rentease.com', password: 'demo123', role: 'user', phone: '8888888888' },
];
let orders = [];
let maintenanceRequests = [];

// ─── Auth ───
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already registered' });
  const user = { id: uuidv4(), name, email, password, phone, role: 'user' };
  users.push(user);
  const { password: _, ...u } = user;
  res.json({ user: u, token: 'jwt-' + user.id });
});
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const { password: _, ...u } = user;
  res.json({ user: u, token: 'jwt-' + user.id });
});

// ─── Products ───
app.get('/api/products', (req, res) => {
  let filtered = [...products];
  const { category, search } = req.query;
  if (category && category !== 'All') filtered = filtered.filter(p => p.category === category);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  res.json(filtered);
});
app.get('/api/products/:id', (req, res) => {
  const p = products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

// ─── Orders ───
app.post('/api/orders', (req, res) => {
  const { userId, items, deliveryDate, address } = req.body;
  const order = {
    id: uuidv4(), userId, items, deliveryDate, address, status: 'active', createdAt: new Date().toISOString(),
    totalMonthly: items.reduce((s, i) => { const p = products.find(x => x.id === i.productId); return s + (p ? p.monthlyRent * i.quantity : 0); }, 0),
    totalDeposit: items.reduce((s, i) => { const p = products.find(x => x.id === i.productId); return s + (p ? p.securityDeposit * i.quantity : 0); }, 0),
  };
  orders.push(order);
  res.json(order);
});
app.get('/api/orders', (req, res) => {
  let f = [...orders];
  if (req.query.userId) f = f.filter(o => o.userId === req.query.userId);
  res.json(f);
});
app.put('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  Object.assign(order, req.body);
  res.json(order);
});

// ─── Maintenance ───
app.post('/api/maintenance', (req, res) => {
  const r = { id: uuidv4(), ...req.body, status: 'pending', createdAt: new Date().toISOString() };
  maintenanceRequests.push(r);
  res.json(r);
});
app.get('/api/maintenance', (req, res) => res.json(maintenanceRequests));

// ─── Admin ───
app.get('/api/admin/stats', (req, res) => {
  res.json({ totalProducts: products.length, activeRentals: orders.filter(o => o.status === 'active').length, totalUsers: users.length, totalRevenue: orders.reduce((s, o) => s + o.totalMonthly, 0), pendingMaintenance: maintenanceRequests.filter(m => m.status === 'pending').length });
});
app.get('/api/admin/orders', (req, res) => res.json(orders));
app.get('/api/admin/maintenance', (req, res) => res.json(maintenanceRequests));

// ─── Static Files (production) ───
const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log('RentEase running on port ' + PORT);
});
