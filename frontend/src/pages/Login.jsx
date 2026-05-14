import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo/logo.png';
import styles from './Auth.module.css';

function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await auth.login(form);
      navigate(['administrador', 'vendedor'].includes(user.tipo_usuario) ? from : '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Erro ao entrar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.brand}>
          <img src={logo} alt="Tres Pescadores Store" />
          <div>
            <h1>Entrar</h1>
            <p>Acesse sua conta</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Senha
            <input type="password" name="senha" value={form.senha} onChange={handleChange} required />
          </label>

          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className={styles.footerText}>
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
