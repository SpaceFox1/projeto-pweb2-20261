import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import styles from './dashboardLayout.module.css';

export function DashboardLayout(): React.ReactElement {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const logo = (
    <div className={styles.logo}>
      <img className={styles.logoImg} src="./icons/Logo.svg" alt="Logo" />
      <span className={styles.brandName}>
        Finance<span className={styles.brandHighlight}>Flow</span>
      </span>
    </div>
  );

  return (
    <div className={styles.dashboardLayout} data-layout="dashboard">
      <a className={styles.skipLink} href="#dashboard-content">
        Pular para o conteúdo
      </a>

      <header className={styles.mobileHeader}>
        {logo}
        <button
          type="button"
          className={styles.menuButton}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="dashboard-sidebar"
          onClick={() => setMenuOpen(true)}
        >
          <span className={styles.menuIcon} aria-hidden="true" />
        </button>
      </header>

      {menuOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        id="dashboard-sidebar"
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}
        aria-label="Menu do dashboard"
      >
        <div className={styles.sidebarHeader}>
          {logo}
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          >
            <span className={styles.closeIcon} aria-hidden="true" />
          </button>
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
            <NavLink to="/goals" end className={getLinkClass}>
              <div className={styles.navImg} style={{ maskImage: 'url(/icons/goals.svg)' }} />
              Metas
            </NavLink>
            <NavLink to="/spending-limits" end className={getLinkClass}>
              <div className={styles.navImg} style={{ maskImage: 'url(/icons/limits.svg)' }} />
              Limites
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