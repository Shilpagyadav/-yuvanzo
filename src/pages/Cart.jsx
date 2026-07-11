import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, clearCart, removeFromCart } from '../services/api';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await getCart();
      setCart(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await removeFromCart(id);
      fetchCart();
    } catch (error) {
      alert('Error removing item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear cart?')) {
      try {
        await clearCart();
        fetchCart();
      } catch (error) {
        alert('Error clearing cart');
      }
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) return <p>Loading cart...</p>;
  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h2>🛒 Your Cart</h2>
        <p>Your cart is empty</p>
        <button onClick={() => navigate('/')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>🛒 Your Cart</h2>
      
      {cart.items.map((vendor) => (
        <div key={vendor.restaurant_id} style={{
          border: '1px solid #ddd',
          padding: '15px',
          margin: '15px 0',
          borderRadius: '8px',
          background: '#f9f9f9'
        }}>
          <h3>📍 {vendor.restaurant_name}</h3>
          {vendor.items.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #eee'
            }}>
              <div>
                <span>{item.name}</span>
                <span style={{ marginLeft: '10px', color: '#666' }}>x{item.quantity}</span>
              </div>
              <div>
                <span style={{ fontWeight: 'bold', marginRight: '15px' }}>₹{item.price * item.quantity}</span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  style={{
                    padding: '4px 10px',
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
            Subtotal: ₹{vendor.subtotal}
          </div>
        </div>
      ))}

      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '8px' }}>
        <h3>Total: ₹{cart.total_amount}</h3>
        <p>Items: {cart.item_count}</p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCheckout}
            style={{
              padding: '10px 30px',
              background: '#FF5722',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Proceed to Checkout
          </button>
          <button
            onClick={handleClearCart}
            style={{
              padding: '10px 20px',
              background: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Clear Cart
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;