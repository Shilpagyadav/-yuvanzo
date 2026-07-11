import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder } from '../services/api';

function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deliveryAddress) {
      alert('Please enter delivery address');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createOrder({
        deliveryAddress,
        paymentMethod
      });
      alert(`✅ Order placed successfully! Order #: ${response.data.data.order_number}`);
      navigate('/orders');
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!cart || cart.items.length === 0) {
    return <p>Your cart is empty</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>📦 Checkout</h2>
      
      <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Order Summary</h3>
        {cart.items.map((vendor) => (
          <div key={vendor.restaurant_id} style={{ marginBottom: '10px' }}>
            <strong>{vendor.restaurant_name}</strong>
            <p style={{ margin: '5px 0' }}>Items: {vendor.items.length}</p>
            <p style={{ margin: '5px 0' }}>Subtotal: ₹{vendor.subtotal}</p>
          </div>
        ))}
        <div style={{ borderTop: '2px solid #ddd', paddingTop: '10px' }}>
          <h3>Total: ₹{cart.total_amount}</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Delivery Address *</label>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            rows="3"
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="cash">Cash on Delivery</option>
            <option value="card">Credit/Debit Card</option>
            <option value="wallet">Wallet</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '12px 30px',
              background: '#FF5722',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              flex: 1
            }}
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            style={{
              padding: '12px 20px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Back to Cart
          </button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;