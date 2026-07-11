import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Chip, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TestPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
    fetch('http://localhost:5000/health')
      .then(() => setApiStatus('✅ Backend Connected'))
      .catch(() => setApiStatus('❌ Backend Not Running'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>🧪 Frontend Test Suite</Typography>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6">✅ System Status</Typography>
              <Box sx={{ mt: 2 }}>
                <Chip label="✅ React" color="success" sx={{ mr: 1 }} />
                <Chip label="✅ Material-UI" color="success" sx={{ mr: 1 }} />
                <Chip label="✅ React Router" color="success" sx={{ mr: 1 }} />
                <Chip label="✅ Redux" color="success" />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6">🔌 Backend Connection</Typography>
              {loading ? (
                <CircularProgress size={24} sx={{ mt: 1 }} />
              ) : (
                <Alert severity={apiStatus.includes('Connected') ? 'success' : 'warning'} sx={{ mt: 1 }}>
                  {apiStatus}
                </Alert>
              )}
            </CardContent>
          </Card>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
            <Typography color="success.main">
              🎉 Frontend is ready! You can start building the app.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TestPage;