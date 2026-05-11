import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../assets/logo/logo.png';

function Header() {
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
      </nav>
    </header>
  );
}

export default Header;
