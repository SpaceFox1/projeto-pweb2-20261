import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register, clearError } from '../store/slices/authSlice';
import styles from './register.module.css'; // Sniffing out the design tokens

export function RegisterPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    dispatch(clearError());

    if (!formData.username || !formData.name || !formData.password) {
      return;
    }

    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h1 className={styles.title}>Registro</h1>

      {error && <div className={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>Nome de exibição:</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>Nome:</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Senha:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className={styles.input}
            required
          />
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>

      <div className={styles.footer}>
        <a href="/login" className={styles.loginLink}>
          Já tem uma conta? Faça login
        </a>
      </div>
    </div>
  );
}