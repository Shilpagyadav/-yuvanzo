import React, { useState } from 'react';
import { register } from '../services/api';

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      alert('✅ Registration successful! Please login.');
      onRegister();
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '50px auto', 
      padding: '30px',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 4px 20px rgba(108,92,231,0.1)'
    }}>
      <h2 style={{ color: '#6C5CE7', textAlign: 'center', marginBottom: '20px' }}>
        📝 Join Yuvanzo
      </h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '600', color: '#333' }}>Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
            placeholder="Enter your full name"
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '600', color: '#333' }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
            placeholder="Enter your email"
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '600', color: '#333' }}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
            placeholder="Create a password"
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '600', color: '#333' }}>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
            placeholder="Enter your phone number"
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: '600', color: '#333' }}>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical'
            }}
            rows="2"
            placeholder="Enter your delivery address"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {loading ? 'Registering...' : 'Join Yuvanzo 🚀'}
        </button>
      </form>
      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        Already have an account? <a href="/login" style={{ color: '#6C5CE7', fontWeight: 'bold' }}>Login</a>
      </p>
    </div>
  );
}

export default Register;