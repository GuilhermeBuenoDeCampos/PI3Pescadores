import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo/logo.png';
import styles from './Auth.module.css';

function Register() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    senha: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await auth.register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Erro ao criar conta');
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
            <h1>Criar conta</h1>
            <p>Cadastro de usuário</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <label>
            Nome
            <input type="text" name="nome" value={form.nome} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            CPF
            <input type="text" name="cpf" value={form.cpf} onChange={handleChange} minLength="11" required />
          </label>

          <label>
            Telefone
            <input type="tel" name="telefone" value={form.telefone} onChange={handleChange} />
          </label>

          <label>
            Senha
            <input type="password" name="senha" value={form.senha} onChange={handleChange} minLength="6" required />
          </label>

          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className={styles.footerText}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
