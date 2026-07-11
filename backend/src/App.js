import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

// Axios setup
const api = axios.create({ baseURL: API });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// =============================================
// NAVBAR
// =============================================
function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav style={{ background: '#6C5CE7', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
        🍽️ YUVANZO
      </Link>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>🛒 Cart</Link>
        <Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>Orders</Link>
        {user ? (
          <>
            <span>👋 {user.full_name}</span>
            <button onClick={logout} style={{ background: 'white', color: '#6C5CE7', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '5px' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

// =============================================
// HOME PAGE
// =============================================
function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/restaurants').then(res => {
      setRestaurants(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading restaurants...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', padding: '40px', borderRadius: '15px', color: 'white', textAlign: 'center', marginBottom: '30px' }}>
        <h1>🍽️ YUVANZO</h1>
        <p style={{ fontSize: '18px' }}>Your Food, Your Way - Order from multiple restaurants!</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {restaurants.map(r => (
          <div key={r.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{r.name}</h3>
            <p style={{ color: '#666' }}>🍽️ {r.cuisine_type}</p>
            <p>⭐ {r.rating || 0}</p>
            <p style={{ color: '#888', fontSize: '14px' }}>📍 {r.address}</p>
            <Link to={`/restaurant/${r.id}`}>
              <button style={{ marginTop: '10px', padding: '8px 20px', background: '#6C5CE7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                View Menu
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
// RESTAURANT MENU
// =============================================
function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/restaurants/${id}/menu`).then(res => {
      setMenu(res.data.data);
      if (res.data.data.length > 0) setRestaurantName(res.data.data[0].restaurant_name);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const addToCart = async (item) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { alert('Please login first'); navigate('/login'); return; }
      await api.post('/cart/add', { restaurantId: parseInt(id), menuItemId: item.id, quantity: 1 });
      setMessage(`✅ ${item.name} added to cart!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('Error adding to cart');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading menu...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>🍽️ {restaurantName}</h2>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}>← Back</button>
      <button onClick={() => navigate('/cart')} style={{ marginBottom: '20px', marginLeft: '10px', padding: '8px 16px', background: '#6C5CE7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>🛒 View Cart</button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {menu.map(item => (
        <div key={item.id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0' }}>{item.name}</h3>
            <p style={{ color: '#666' }}>{item.description}</p>
            <p style={{ fontWeight: 'bold', color: '#6C5CE7' }}>₹{item.price}</p>
          </div>
          <button onClick={() => addToCart(item)} style={{ padding: '8px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

// =============================================
// CART
// =============================================
function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (id) => {
    await api.delete(`/cart/${id}`);
    fetchCart();
  };

  const clearCart = async () => {
    if (window.confirm('Clear cart?')) {
      await api.delete('/cart');
      fetchCart();
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading cart...</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h2>🛒 Your Cart</h2>
        <p>Your cart is empty</p>
        <button onClick={() => navigate('/')} style={{ padding: '10px 20px', cursor: 'pointer' }}>Browse Restaurants</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>🛒 Your Cart</h2>
      {cart.items.map(vendor => (
        <div key={vendor.restaurant_id} style={{ border: '1px solid #ddd', padding: '15px', margin: '15px 0', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3>📍 {vendor.restaurant_name}</h3>
          {vendor.items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>{item.name} x{item.quantity}</span>
              <div>
                <span style={{ fontWeight: 'bold', marginRight: '15px' }}>₹{item.price * item.quantity}</span>
                <button onClick={() => removeItem(item.id)} style={{ padding: '4px 10px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '10px', fontWeight: 'bold' }}>Subtotal: ₹{vendor.subtotal}</div>
        </div>
      ))}
      <div style={{ padding: '15px', background: '#6C5CE7', borderRadius: '8px', color: 'white' }}>
        <h3>Total: ₹{cart.total_amount}</h3>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/checkout')} style={{ padding: '10px 30px', background: 'white', color: '#6C5CE7', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Checkout 🚀
          </button>
          <button onClick={clearCart} style={{ padding: '10px 20px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Clear Cart</button>
          <button onClick={() => navigate('/')} style={{ padding: '10px 20px', background: '#666', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// CHECKOUT
// =============================================
function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('cash');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cart').then(res => { setCart(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const placeOrder = async () => {
    if (!address) { alert('Please enter delivery address'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/orders/create', { deliveryAddress: address, paymentMethod: payment });
      alert(`✅ Order placed! Order #: ${res.data.data.order_number}`);
      navigate('/orders');
    } catch (error) {
      alert('Failed to place order');
    }
    setSubmitting(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!cart || cart.items.length === 0) return <p>Your cart is empty</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>📦 Checkout</h2>
      <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Order Summary</h3>
        {cart.items.map(v => (
          <div key={v.restaurant_id} style={{ marginBottom: '10px' }}>
            <strong>📍 {v.restaurant_name}</strong>
            <p style={{ margin: '5px 0' }}>Subtotal: ₹{v.subtotal}</p>
          </div>
        ))}
        <h3>Total: ₹{cart.total_amount}</h3>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Delivery Address *</label>
        <textarea value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} rows="3" required />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Payment Method</label>
        <select value={payment} onChange={e => setPayment(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
          <option value="cash">Cash on Delivery</option>
          <option value="card">Credit/Debit Card</option>
          <option value="wallet">Wallet</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={placeOrder} disabled={submitting} style={{ padding: '12px 30px', background: '#6C5CE7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', flex: 1 }}>
          {submitting ? 'Placing Order...' : 'Place Order 🚀'}
        </button>
        <button onClick={() => navigate('/cart')} style={{ padding: '12px 20px', background: '#666', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back</button>
      </div>
    </div>
  );
}

// =============================================
// ORDERS
// =============================================
function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(res => { setOrders(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>📋 My Orders</h2>
      {orders.length === 0 ? <p>No orders yet.</p> : orders.map(o => (
        <div key={o.id} style={{ border: '1px solid #ddd', padding: '15px', margin: '15px 0', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3 style={{ margin: '0' }}>Order #{o.order_number}</h3>
          <p>Status: <span style={{ fontWeight: 'bold', color: '#6C5CE7' }}>{o.order_status}</span></p>
          <p>Total: ₹{o.total_amount}</p>
          <p style={{ fontSize: '12px', color: '#999' }}>{new Date(o.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

// =============================================
// LOGIN
// =============================================
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2 style={{ color: '#6C5CE7' }}>🔐 Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} required />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#6C5CE7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Login</button>
      </form>
      <p style={{ marginTop: '15px' }}>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}

// =============================================
// REGISTER
// =============================================
function Register() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      alert('✅ Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Email may already exist.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2 style={{ color: '#6C5CE7' }}>📝 Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Full Name</label>
          <input type="text" name="full_name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Phone</label>
          <input type="text" name="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Address</label>
          <textarea name="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} rows="2" />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Register</button>
      </form>
      <p style={{ marginTop: '15px' }}>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

// =============================================
// APP
// =============================================
function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 70px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/restaurant/:id" element={<RestaurantMenu />} />
          <Route path="/cart" element={<Cart />} />