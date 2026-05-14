import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import StockManagement from './pages/StockManagement';
import CartPage from './pages/CartPage';
import styles from './App.module.css';

// Rotas públicas ficam aqui. Ao criar uma página nova, importe em /pages e registre abaixo.
function App() {
  return (
    <div className={styles.appWrapper}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produto/:id" element={<ProductPage />} />
        <Route path="/produto-nome/:nome" element={<ProductPage />} />
        <Route path="/estoque" element={<StockManagement />} />
        <Route path="/carrinho" element={<CartPage />} />
      </Routes>
    </div>
  );
}

export default App;
