import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantMenu, addToCart } from '../services/api';

function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMenu();
  }, [id]);

  const fetchMenu = async () => {
    try {
      const response = await getRestaurantMenu(id);
      setMenuItems(response.data.data);
      if (response.data.data.length > 0) {
        setRestaurantName(response.data.data[0]?.restaurant_name || 'Restaurant');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      setAdding(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      await addToCart({
        restaurantId: parseInt(id),
        menuItemId: item.id,
        quantity: 1
      });
      
      setMessage(`✅ Added ${item.name} to cart!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('Error adding to cart: ' + (error.response?.data?.message || error.message));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <p>Loading menu...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>🍽️ {restaurantName}</h2>
      <button
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}
      >
        ← Back to Restaurants
      </button>
      <button
        onClick={() => navigate('/cart')}
        style={{ marginBottom: '20px', marginLeft: '10px', padding: '8px 16px', cursor: 'pointer', background: '#FF5722', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        🛒 View Cart
      </button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      
      <div>
        {menuItems.map((item) => (
          <div key={item.id} style={{
            border: '1px solid #ddd',
            padding: '15px',
            margin: '10px 0',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: '0' }}>{item.name}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>{item.description}</p>
              <p style={{ fontWeight: 'bold', color: '#FF5722' }}>₹{item.price}</p>
            </div>
            <button
              onClick={() => handleAddToCart(item)}
              disabled={adding}
              style={{
                padding: '8px 20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestaurantMenu;