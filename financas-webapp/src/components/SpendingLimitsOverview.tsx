import { Link } from 'react-router';
import {
  getSpendingBarWidth,
  getSpendingStatusColor,
  type SpendingStatusItem,
} from '../store/slices/spendingLimitsSlice';
import styles from './SpendingLimitsOverview.module.css';

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface SpendingLimitsOverviewProps {
  items: SpendingStatusItem[];
  emptyMessage?: string;
  showViewAllLink?: boolean;
  onDelete?: (item: SpendingStatusItem) => void;
}

export function SpendingLimitsOverview({
  items,
  emptyMessage = 'Nenhum limite de gasto cadastrado ainda.',
  showViewAllLink = false,
  onDelete,
}: SpendingLimitsOverviewProps): React.ReactElement {
  if (items.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <article key={item.categoryId} className={styles.card}>
          <div className={styles.header}>
            <strong>{item.categoryName}</strong>
            <span className={styles.percent}>{item.percentUsed}% usado</span>
          </div>

          <div className={styles.track} aria-label={`Uso do limite de ${item.categoryName}`}>
            <div
              className={styles.fill}
              style={{
                width: `${getSpendingBarWidth(item.percentUsed)}%`,
                background: getSpendingStatusColor(item.percentUsed),
              }}
            />
          </div>

          <p className={styles.detail}>
            Gasto: {formatCurrency(item.spent)} / Limite: {formatCurrency(item.limitAmount)}
          </p>

          {onDelete && (
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => onDelete(item)}
            >
              Excluir
            </button>
          )}
        </article>
      ))}

      {showViewAllLink && (
        <Link to="/spending-limits" className={styles.viewAll}>
          Gerenciar limites
        </Link>
      )}
    </div>
  );
}
