import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getRestaurants } from './services/api';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantMenu from './pages/RestaurantMenu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      background: '#6C5CE7',
      color: 'white',
      boxShadow: '0 4px 15px rgba(108,92,231,0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' }}>
          🍽️ Yuvanzo
        </Link>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>🛒 Cart</Link>
        <Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>📋 Orders</Link>
      </div>
      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>👋 {user.full_name}</span>
            <button onClick={handleLogout} style={{
              padding: '5px 15px',
              background: 'white',
              color: '#6C5CE7',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Logout
            </button>
          </div>
        ) : (
          <div>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none', marginRight: '10px' }}>Login</Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '5px' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await getRestaurants();
        setRestaurants(response.data.data);
      } catch (error) {
        setError('Failed to load restaurants.');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    let stars = '⭐'.repeat(fullStars);
    if (stars === '') stars = '☆';
    return stars;
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading restaurants...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
        padding: '40px',
        borderRadius: '15px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: '0' }}>🍽️ Yuvanzo</h1>
        <p style={{ fontSize: '18px', margin: '10px 0' }}>Your Food, Your Way</p>
        <p>Order from multiple restaurants in one go!</p>
      </div>

      <h2>🍽️ Restaurants</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {restaurants.map((r) => (
          <div key={r.id} style={{
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '12px',
            background: '#fafafa',
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(108,92,231,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6C5CE7' }}>{r.name}</h3>
            <p style={{ margin: '5px 0', color: '#666' }}>🍽️ {r.cuisine_type}</p>
            <p style={{ margin: '5px 0', color: '#666' }}>⭐ {renderStars(r.rating)} ({r.rating})</p>
            <p style={{ margin: '5px 0', color: '#666' }}>📍 {r.address}</p>
            <Link to={`/restaurant/${r.id}`}>
              <button style={{
                marginTop: '10px',
                padding: '8px 20px',
                background: '#6C5CE7',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 'bold'
              }}>
                View Menu
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 70px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={() => window.location.href = '/'} />} />
          <Route path="/register" element={<Register onRegister={() => window.location.href = '/login'} />} />
          <Route path="/restaurant/:id" element={<RestaurantMenu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;