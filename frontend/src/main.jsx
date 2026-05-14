import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './styles/globals.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Root entry point of the application.
// BrowserRouter enables client-side route navigation.
ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
