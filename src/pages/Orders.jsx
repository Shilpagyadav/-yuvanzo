import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>📋 My Orders</h2>
      
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{
            border: '1px solid #ddd',
            padding: '15px',
            margin: '15px 0',
            borderRadius: '8px',
            background: '#f9f9f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0' }}>Order #{order.order_number}</h3>
                <p style={{ margin: '5px 0' }}>
                  <span style={{ fontWeight: 'bold' }}>Status:</span> 
                  <span style={{ 
                    color: order.order_status === 'delivered' ? '#4CAF50' : '#FF9800',
                    fontWeight: 'bold'
                  }}>
                    {' '}{order.order_status?.toUpperCase() || 'PENDING'}
                  </span>
                </p>
                <p style={{ margin: '5px 0' }}>
                  <span style={{ fontWeight: 'bold' }}>Total:</span> ₹{order.total_amount}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <span style={{ fontWeight: 'bold' }}>Vendors:</span> {order.vendor_count}
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: order.order_status === 'delivered' ? '#e8f5e9' : '#fff3e0',
                  color: order.order_status === 'delivered' ? '#2e7d32' : '#e65100',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {order.order_status || 'PENDING'}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;