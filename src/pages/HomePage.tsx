import React from 'react';
import { Container, Typography, Box, Button, Paper, Grid, Card, CardContent, CardMedia, AppBar, Toolbar, IconButton, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const HomePage: React.FC = () => {
  const restaurants = [
    { id: 1, name: 'Pizza Palace', cuisine: 'Italian', rating: 4.5, deliveryTime: '25-35 min' },
    { id: 2, name: 'Burger King', cuisine: 'American', rating: 4.3, deliveryTime: '15-25 min' },
    { id: 3, name: 'Sushi Express', cuisine: 'Japanese', rating: 4.7, deliveryTime: '30-45 min' },
    { id: 4, name: 'Taco Bell', cuisine: 'Mexican', rating: 4.2, deliveryTime: '20-30 min' }
  ];

  return (
    <>
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <RestaurantIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🍔 Multi-Vendor Food
          </Typography>
          <Button color="inherit">Login</Button>
          <Button color="inherit">Register</Button>
          <IconButton color="inherit">
            <Badge badgeContent={0} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 5, bgcolor: '#f5f5f5', borderRadius: 4, mb: 4, mt: 4 }}>
          <Typography variant="h2" gutterBottom>
            🍔 Multi-Vendor Food Delivery
          </Typography>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Order from multiple restaurants in a single order!
          </Typography>
          <Button variant="contained" size="large" sx={{ mt: 2 }}>
            Browse Restaurants
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">🔄</Typography>
              <Typography variant="h6">Multi-Vendor Orders</Typography>
              <Typography color="textSecondary">Order from different restaurants in one cart</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">🚀</Typography>
              <Typography variant="h6">Real-Time Tracking</Typography>
              <Typography color="textSecondary">Track your orders in real-time</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">⭐</Typography>
              <Typography variant="h6">Reviews & Ratings</Typography>
              <Typography color="textSecondary">Rate restaurants and delivery experience</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="h4" gutterBottom>Popular Restaurants</Typography>
        <Grid container spacing={3}>
          {restaurants.map((restaurant) => (
            <Grid item xs={12} sm={6} md={3} key={restaurant.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{restaurant.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{restaurant.cuisine}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2">⭐ {restaurant.rating}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>• {restaurant.deliveryTime}</Typography>
                  </Box>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }}>View Menu</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, py: 3, textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="body2" color="textSecondary">
            © 2026 Multi-Vendor Food Delivery Platform
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;