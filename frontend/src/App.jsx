import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import StockManagement from './pages/StockManagement';
import CartPage from './pages/CartPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import styles from './App.module.css';

// Rotas públicas ficam aqui. Ao criar uma página nova, importe em /pages e registre abaixo.
function App() {
  return (
    <div className={styles.appWrapper}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produto/:id" element={<ProductPage />} />
        <Route path="/produto-nome/:nome" element={<ProductPage />} />
        <Route
          path="/estoque"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <StockManagement />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
