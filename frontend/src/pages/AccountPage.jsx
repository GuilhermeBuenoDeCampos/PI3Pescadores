import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAuthUser } from '../services/api';
import styles from './AccountPage.module.css';

function AccountPage({ type }) {
  const user = getAuthUser();
  const isOrders = type === 'orders';

  return (
    <div>
      <Header />
      <main className={styles.page}>
        <section className={styles.panel}>
          <span className={styles.label}>{user?.nome || 'Minha conta'}</span>
          <h1>{isOrders ? 'Meus pedidos' : 'Meus enderecos'}</h1>
          <p>
            {isOrders
              ? 'Quando voce fizer pedidos, eles aparecerao aqui.'
              : 'Quando voce cadastrar enderecos, eles aparecerao aqui.'}
          </p>
          <Link to="/" className={styles.backLink}>Voltar para a loja</Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AccountPage;
