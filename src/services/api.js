import axios from 'axios';

const API_URL = 'https://yuvanzo.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =============================================
// AUTH APIs
// =============================================
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/me');

// =============================================
// RESTAURANT APIs
// =============================================
export const getRestaurants = () => api.get('/restaurants');
export const getRestaurant = (id) => api.get(`/restaurants/${id}`);
export const getRestaurantMenu = (id) => api.get(`/restaurants/${id}/menu`);

// =============================================
// CART APIs
// =============================================
export const addToCart = (data) => api.post('/cart/add', data);
export const getCart = () => api.get('/cart');
export const updateCartItem = (id, quantity) => api.put(`/cart/${id}`, { quantity });
export const removeFromCart = (id) => api.delete(`/cart/${id}`);
export const clearCart = () => api.delete('/cart');

// =============================================
// ORDER APIs
// =============================================
export const createOrder = (data) => api.post('/orders/create', data);
export const getOrders = () => api.get('/orders');
export const getOrderDetails = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const getVendorOrders = () => api.get('/orders/vendor/orders');

export default api;