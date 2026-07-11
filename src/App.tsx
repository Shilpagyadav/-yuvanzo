import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import './App.css';

// Import Pages
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';

// Create a simple store
const store = configureStore({
  reducer: {
    // We'll add reducers here later
  }
});

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF5722',
      light: '#FF8A65',
      dark: '#E64A19',
    },
    secondary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/test" element={<TestPage />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;