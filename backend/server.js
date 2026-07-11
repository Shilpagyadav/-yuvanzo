const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection
let pool;

async function connectDB() {
  try {
    // Check if we're using SSL (Aiven) or local
    const sslConfig = process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com') 
      ? { ssl: { rejectUnauthorized: false } } 
      : {};

    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'multi_vendor_food_delivery',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ...sslConfig
    });
    
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ DB Error:', error.message);
  }
}
connectDB();

// Auth Middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Please login' });
  }
};

// =============================================
// ROOT & HEALTH CHECK
// =============================================
app.get('/', (req, res) => {
  res.send('Welcome to Yuvanzo API. Visit /health for status.');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Yuvanzo API running' });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Yuvanzo',
    endpoints: {
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      cart: '/api/cart',
      orders: '/api/orders'
    }
  });
});

// =============================================
// AUTH
// =============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, address } = req.body;
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, phone, address) VALUES (?, ?, ?, ?, ?)',
      [email, hashed, full_name, phone, address]
    );
    const token = jwt.sign({ id: result.insertId, email, role: 'customer' }, process.env.JWT_SECRET || 'secret');
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: { user: { id: result.insertId, email, full_name, phone, address }, token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret');
    const { password_hash, ...userData } = user;
    res.json({ success: true, message: 'Login successful!', data: { user: userData, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, full_name, phone, address, role FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// RESTAURANTS
// =============================================
app.get('/api/restaurants', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM restaurants WHERE is_active = true ORDER BY rating DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/restaurants/:id/menu', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT mi.*, r.name as restaurant_name FROM menu_items mi JOIN restaurants r ON mi.restaurant_id = r.id WHERE mi.restaurant_id = ? AND mi.is_available = true',
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// CART
// =============================================
app.post('/api/cart/add', auth, async (req, res) => {
  try {
    const { restaurantId, menuItemId, quantity } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND menu_item_id = ?',
      [req.user.id, menuItemId]
    );
    if (existing.length > 0) {
      await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity || 1, existing[0].id]);
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, restaurant_id, menu_item_id, quantity) VALUES (?, ?, ?, ?)',
        [req.user.id, restaurantId, menuItemId, quantity || 1]
      );
    }
    res.json({ success: true, message: 'Added to cart!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/cart', auth, async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT c.*, mi.name, mi.price, r.name as restaurant_name, r.delivery_fee
       FROM cart c
       JOIN menu_items mi ON c.menu_item_id = mi.id
       JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.restaurant_id]) {
        acc[item.restaurant_id] = { restaurant_id: item.restaurant_id, restaurant_name: item.restaurant_name, items: [], subtotal: 0 };
      }
      acc[item.restaurant_id].items.push(item);
      acc[item.restaurant_id].subtotal += item.price * item.quantity;
      return acc;
    }, {});
    const total = Object.values(grouped).reduce((sum, g) => sum + g.subtotal, 0);
    res.json({
      success: true,
      data: {
        items: Object.values(grouped),
        total_amount: total,
        item_count: items.reduce((s, i) => s + i.quantity, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/cart/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/cart', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ORDERS (Multi-Vendor)
// =============================================
app.post('/api/orders/create', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { deliveryAddress, paymentMethod = 'cash' } = req.body;

    const [cartItems] = await conn.query(
      `SELECT c.*, mi.price, mi.name, r.name as restaurant_name, r.delivery_fee
       FROM cart c
       JOIN menu_items mi ON c.menu_item_id = mi.id
       JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const vendorGroups = cartItems.reduce((acc, item) => {
      if (!acc[item.restaurant_id]) {
        acc[item.restaurant_id] = { restaurant_id: item.restaurant_id, restaurant_name: item.restaurant_name, items: [], subtotal: 0 };
      }
      acc[item.restaurant_id].items.push(item);
      acc[item.restaurant_id].subtotal += item.price * item.quantity;
      return acc;
    }, {});

    let subtotal = 0;
    for (const v in vendorGroups) subtotal += vendorGroups[v].subtotal;
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const orderNumber = 'YV-' + Date.now().toString(36).toUpperCase();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_number, user_id, total_amount, subtotal_amount, tax_amount, final_amount, delivery_address, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, req.user.id, total, subtotal, tax, total, deliveryAddress, paymentMethod]
    );

    const orderId = orderResult.insertId;

    for (const v in vendorGroups) {
      for (const item of vendorGroups[v].items) {
        await conn.query(
          `INSERT INTO order_items (order_id, restaurant_id, menu_item_id, menu_item_name, quantity, price_per_item, subtotal, total_amount)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.restaurant_id, item.menu_item_id, item.name, item.quantity, item.price, item.price * item.quantity, item.price * item.quantity * 1.08]
        );
      }
    }

    await conn.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: { order_id: orderId, order_number: orderNumber, total_amount: total }
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
});

app.get('/api/orders', auth, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, COUNT(DISTINCT oi.restaurant_id) as vendor_count
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// START SERVER - ALLOWS NETWORK ACCESS
// =============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Yuvanzo Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📍 Network: http://172.20.10.3:${PORT}`);
});