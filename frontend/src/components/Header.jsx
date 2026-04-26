import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}> 
      <div className={styles.brand}>
        <div className={styles.logoMark}>TP</div>
        <div>
          <Link to="/" className={styles.title}>
            Tres Pescadores
          </Link>
          <p className={styles.subtitle}>Artigos religiosos para fé e devoção</p>
        </div>
      </div>
      <nav className={styles.navLinks}>
        <Link to="/">Início</Link>
        <a href="#catalog">Catálogo</a>
      </nav>
    </header>
  );
}

export default Header;
