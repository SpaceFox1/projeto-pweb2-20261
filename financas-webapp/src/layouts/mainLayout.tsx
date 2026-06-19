import { Outlet } from 'react-router';

export function MainLayout(): React.ReactElement {
  return (
    <div>
      <Outlet />
    </div>
  );
}
