import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import StockManagement from './pages/StockManagement';
import CartPage from './pages/CartPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AccountPage from './pages/AccountPage';
import styles from './App.module.css';

// App component defines the two main application pages.
function App() {
  return (
    <div className={styles.appWrapper}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/produto/:id" element={<ProductPage />} />
        <Route path="/produto-nome/:nome" element={<ProductPage />} />
        <Route path="/estoque" element={<StockManagement />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/meus-pedidos" element={<AccountPage type="orders" />} />
        <Route path="/meus-enderecos" element={<AccountPage type="addresses" />} />
      </Routes>
    </div>
  );
}

export default App;
