import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import StockManagement from './pages/StockManagement';
import styles from './App.module.css';

// App component defines the two main application pages.
function App() {
  return (
    <div className={styles.appWrapper}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produto/:id" element={<ProductPage />} />
        <Route path="/estoque" element={<StockManagement />} />
      </Routes>
    </div>
  );
}

export default App;
