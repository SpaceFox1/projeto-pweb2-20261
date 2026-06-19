import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

export function HomePage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = (): void => {
    dispatch(logout());
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.name}!</p>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}
