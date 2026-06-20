import { NavLink, Outlet, useNavigate } from 'react-router'; // Assuming React Router v6/v7
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice'; // Adjust the import path to your file structure
import styles from './dashboardLayout.module.css';

export function DashboardLayout(): React.ReactElement {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

  const handleLogout = () => {
    // *Teasing grin* Time to shake off the dust and leave the pack for now
    dispatch(logout());
    navigate('/login'); // Sends them running back to the entrance
  };

  return (
    <div className={styles.dashboardLayout} data-layout="dashboard">
      <a className={styles.skipLink} href="#dashboard-content">
        Pular para o conteúdo
      </a>

      <aside className={styles.sidebar} aria-label="Menu do dashboard">
        <div className={styles.logo}>
          <img className={styles.logoImg} src='./icons/Logo.svg' alt="Logo" />
          <span className={styles.brandName}>Finance<span className={styles.brandHighlight}>Flow</span></span>
        </div>

        <div className={styles.sideItems}>
          <nav className={styles.navigation} aria-label="Navegação principal">
            <NavLink to="/transactions/new" end className={getLinkClass}>
              <div className={styles.navImg} style={{ maskImage: 'url(/icons/new.svg)' }} />
              Nova Transação
            </NavLink>
            <NavLink to="/" end className={getLinkClass}>
              <div className={styles.navImg} style={{ maskImage: 'url(/icons/homepage.svg)' }} />
              Visão geral
            </NavLink>
            <NavLink to="/transactions" end className={getLinkClass}>
              <div className={styles.navImg} style={{ maskImage: 'url(/icons/wallet.svg)' }} />
              Transações
            </NavLink>
          </nav>
          <button
            onClick={handleLogout}
            className={`${styles.link} ${styles.logoutButton}`}
            aria-label="Sair da conta"
          >
            <div className={styles.navImg} style={{ background: '#ff5555', maskImage: 'url(/icons/logout.svg)' }} />
            Sair
          </button>
        </div>

      </aside>

      <main
        id="dashboard-content"
        className={styles.main}
        tabIndex={-1}
        aria-label="Conteúdo do dashboard"
      >
        <Outlet />
      </main>
    </div>
  );
}