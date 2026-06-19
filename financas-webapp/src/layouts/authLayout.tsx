import { Outlet } from 'react-router';
import styles from './authLayout.module.css';

export function AuthLayout(): React.ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <aside className={styles.branding}>
          <div className={styles.logo}>
            <img className={styles.logoImg} src='./icons/Logo.svg' />
            <span className={styles.brandName}>Finance<span className={styles.brandHighlight}>Flow</span></span>
          </div>
          <div className={styles.advertisement}>
            <h1 className={styles.adHeading}>Controle suas<br /><span className={styles.brandHighlight}>finanças</span><br />com clareza.</h1>
            <p className={styles.adSubtitle}>Registre receitas e despesas, visualize seus gastos por categoria e tome decisões financeiras melhores.</p>
          </div>
          <p className={styles.copyright}>Todos os direitos reservados © 2026</p>
        </aside>
        <div className={styles.authContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}