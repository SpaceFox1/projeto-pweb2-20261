import { NavLink, Outlet } from 'react-router';

function DashboardIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

export function DashboardLayout(): React.ReactElement {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-layout__sidebar">
        <div className="dashboard-layout__brand">
          <span className="dashboard-layout__brand-mark">F</span>
          <span>Finanças</span>
        </div>

        <nav className="dashboard-layout__navigation" aria-label="Navegação principal">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (
              isActive
                ? 'dashboard-layout__link dashboard-layout__link--active'
                : 'dashboard-layout__link'
            )}
          >
            <DashboardIcon />
            Visão geral
          </NavLink>
        </nav>
      </aside>

      <main className="dashboard-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
