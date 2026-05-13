
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../assets/logo/logo.png';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';

function Header() {
  const { cart } = useCart ? useCart() : { cart: { items: [] } };
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  return (
    <header className={styles.header}> 
      <div className={styles.brand}>
        <img src={logo} alt="Logo Tres Pescadores" className={styles.logoMark} />
        <div>
          <Link to="/" className={styles.title}>
            Tres Pescadores Store
          </Link>
          <p className={styles.subtitle}>Artigos religiosos para fé e devoção</p>
        </div>
      </div>
      <nav className={styles.navLinks}>
        <Link to="/">Início</Link>
        <a href="#categories">Categorias</a>
        <a href="#catalog">Catálogo</a>
        <Link to="/estoque">Estoque</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/carrinho" className={styles.cartIcon} aria-label="Carrinho">
          <FaShoppingCart size={22} />
          {itemCount > 0 && (
            <span className={styles.cartCount}>{itemCount}</span>
          )}
        </Link>
      </nav>
    </header>
  );
}

export default Header;
