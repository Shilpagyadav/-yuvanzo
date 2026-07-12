import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { getRestaurants, toggleFavorite, getFavorites } from '../services/api';

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState({});
  const [user, setUser] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchRestaurants();
    if (userData) {
      fetchFavorites();
    }
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await getRestaurants();
      setRestaurants(response.data.data);
      setFilteredRestaurants(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await getFavorites();
      const favMap = {};
      response.data.data.forEach(r => {
        favMap[r.id] = true;
      });
      setFavorites(favMap);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Get unique cuisines
  const cuisines = ['All', ...new Set(restaurants.map(r => r.cuisine_type).filter(Boolean))];

  // Apply filters and search
  useEffect(() => {
    let results = restaurants;

    if (searchTerm) {
      results = results.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCuisine !== 'All') {
      results = results.filter(r => r.cuisine_type === selectedCuisine);
    }

    if (selectedRating > 0) {
      results = results.filter(r => r.rating >= selectedRating);
    }

    if (sortBy === 'rating') {
      results = [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      results = [...results].sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredRestaurants(results);
  }, [searchTerm, selectedCuisine, selectedRating, sortBy, restaurants]);

  // Check if restaurant is open
  const isRestaurantOpen = (openingTime, closingTime) => {
    if (!openingTime || !closingTime) return true;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    
    const [openH, openM] = openingTime.split(':').map(Number);
    const [closeH, closeM] = closingTime.split(':').map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const handleToggleFavorite = async (restaurantId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to save favorites');
        return;
      }
      const response = await toggleFavorite(restaurantId);
      if (response.data.success) {
        setFavorites(prev => ({
          ...prev,
          [restaurantId]: response.data.isFavorite
        }));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating || 0)) || '⭐';
  };

  // Loading skeletons
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ height: '100%' }}>
                <Box sx={{ height: 140, bgcolor: '#e0e0e0' }} />
                <CardContent>
                  <Box sx={{ height: 30, bgcolor: '#e0e0e0', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ height: 20, bgcolor: '#e0e0e0', borderRadius: 1, mb: 1, width: '60%' }} />
                  <Box sx={{ height: 20, bgcolor: '#e0e0e0', borderRadius: 1, width: '40%' }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Banner */}
      <Paper
        sx={{
          p: isMobile ? 3 : 4,
          mb: 4,
          background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
          color: 'white',
          textAlign: 'center',
          borderRadius: 3
        }}
      >
        <Typography variant={isMobile ? "h4" : "h3"} gutterBottom>
          🍽️ Yuvanzo
        </Typography>
        <Typography variant={isMobile ? "body1" : "h6"} gutterBottom>
          Your Food, Your Way - Order from multiple restaurants in one go!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          <Chip label="Multi-Vendor Orders" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          <Chip label="Fast Delivery" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          <Chip label="Top Restaurants" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
        </Box>
      </Paper>

      {/* Search & Filters */}
      <Paper sx={{ p: isMobile ? 2 : 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search restaurants or cuisines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#6C5CE7' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Cuisine</InputLabel>
              <Select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                label="Cuisine"
              >
                {cuisines.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Rating</InputLabel>
              <Select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                label="Rating"
              >
                <MenuItem value={0}>All Ratings</MenuItem>
                <MenuItem value={4}>4+ Stars</MenuItem>
                <MenuItem value={3}>3+ Stars</MenuItem>
                <MenuItem value={2}>2+ Stars</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="rating">Top Rated</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedCuisine('All');
                setSelectedRating(0);
                setSortBy('rating');
              }}
              sx={{
                borderColor: '#6C5CE7',
                color: '#6C5CE7',
                height: isMobile ? '40px' : '56px',
                '&:hover': {
                  borderColor: '#5A4BD1',
                  bgcolor: 'rgba(108,92,231,0.05)'
                }
              }}
              size={isMobile ? "small" : "medium"}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredRestaurants.length} restaurants found
        </Typography>
        {user && (
          <Button component={Link} to="/favorites" size="small" sx={{ color: '#6C5CE7' }}>
            ❤️ My Favorites
          </Button>
        )}
      </Box>

      {/* Restaurants Grid */}
      {filteredRestaurants.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <RestaurantIcon sx={{ fontSize: 60, color: '#ccc' }} />
          <Typography variant="h5" sx={{ mt: 2, color: '#666' }}>
            No restaurants found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredRestaurants.map((r) => (
            <Grid item xs={12} sm={6} md={4} key={r.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 30px rgba(108,92,231,0.15)'
                  }
                }}
              >
                {/* Favorite Button */}
                <Button
                  onClick={() => handleToggleFavorite(r.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    minWidth: 'auto',
                    p: 1,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.95)'
                    },
                    zIndex: 1
                  }}
                >
                  <Typography sx={{ fontSize: '28px' }}>
                    {favorites[r.id] ? '❤️' : '🤍'}
                  </Typography>
                </Button>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {r.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    🍽️ {r.cuisine_type}
                  </Typography>
                  
                  {/* Opening Status & Delivery Time */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={isRestaurantOpen(r.opening_time, r.closing_time) ? '🟢 Open Now' : '🔴 Closed'}
                      size="small"
                      sx={{
                        bgcolor: isRestaurantOpen(r.opening_time, r.closing_time) ? '#e8f5e9' : '#ffebee',
                        color: isRestaurantOpen(r.opening_time, r.closing_time) ? '#2e7d32' : '#c62828'
                      }}
                    />
                    {r.delivery_time && (
                      <Chip
                        label={`🚚 ${r.delivery_time}`}
                        size="small"
                        sx={{ bgcolor: '#e3f2fd', color: '#0d47a1' }}
                      />
                    )}
                  </Box>

                  {/* Rating */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" sx={{ color: '#FDCB6E' }}>
                      {renderStars(r.rating)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({r.rating || 0})
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    📍 {r.address}
                  </Typography>
                  
                  {r.delivery_fee && (
                    <Chip
                      label={`Delivery ₹${r.delivery_fee}`}
                      size="small"
                      sx={{ mt: 1, bgcolor: '#e8f5e9', color: '#2e7d32' }}
                    />
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    to={`/restaurant/${r.id}`}
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: '#6C5CE7',
                      '&:hover': { bgcolor: '#5A4BD1' }
                    }}
                  >
                    View Menu
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default HomePage;