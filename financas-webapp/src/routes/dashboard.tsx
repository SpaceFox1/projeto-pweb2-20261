import { useAppSelector } from '../store/hooks';
import {
  selectCurrentBalance,
  selectCurrentMonthExpenses,
  selectCurrentMonthIncome,
  selectLatestTransactions,
} from '../store/selectors';
import type { TransactionType } from '../store/slices/transactionsSlice';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
});

function formatDate(date: string): string {
  const datePart = date.slice(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) {
    return 'Data inválida';
  }

  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
}

function getTransactionLabel(type: TransactionType): string {
  return type === 'income' ? 'Receita' : 'Despesa';
}

function BalanceIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M16 10h5v5h-5a2.5 2.5 0 0 1 0-5Z" />
      <path d="M6 6V5a2 2 0 0 1 2-2h8" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: 'up' | 'down' }): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={direction === 'up' ? 'm7 14 5-5 5 5' : 'm7 10 5 5 5-5'} />
      <path d={direction === 'up' ? 'M12 20V9' : 'M12 4v11'} />
    </svg>
  );
}

export function DashboardPage(): React.ReactElement {
  const balance = useAppSelector(selectCurrentBalance);
  const monthIncome = useAppSelector(selectCurrentMonthIncome);
  const monthExpenses = useAppSelector(selectCurrentMonthExpenses);
  const latestTransactions = useAppSelector(selectLatestTransactions);
  const currentMonth = monthFormatter.format(new Date());

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Visão geral</p>
          <h1>Resumo financeiro</h1>
          <p className="dashboard__subtitle">
            Acompanhe sua movimentação em <span>{currentMonth}</span>.
          </p>
        </div>
        <div className="dashboard__month" aria-label={`Período atual: ${currentMonth}`}>
          <span className="dashboard__month-dot" />
          {currentMonth}
        </div>
      </header>

      <section className="summary-grid" aria-label="Resumo financeiro do mês">
        <article className="summary-card summary-card--balance">
          <div className="summary-card__top">
            <span>Saldo atual</span>
            <span className="summary-card__icon"><BalanceIcon /></span>
          </div>
          <strong className={balance < 0 ? 'summary-card__value summary-card__value--negative' : 'summary-card__value'}>
            {currencyFormatter.format(balance)}
          </strong>
          <small>Considerando todas as transações</small>
        </article>

        <article className="summary-card summary-card--income">
          <div className="summary-card__top">
            <span>Receitas do mês</span>
            <span className="summary-card__icon"><ArrowIcon direction="up" /></span>
          </div>
          <strong className="summary-card__value">{currencyFormatter.format(monthIncome)}</strong>
          <small>Total recebido no período</small>
        </article>

        <article className="summary-card summary-card--expense">
          <div className="summary-card__top">
            <span>Despesas do mês</span>
            <span className="summary-card__icon"><ArrowIcon direction="down" /></span>
          </div>
          <strong className="summary-card__value">{currencyFormatter.format(monthExpenses)}</strong>
          <small>Total gasto no período</small>
        </article>
      </section>

      <section className="transactions-panel" aria-labelledby="latest-transactions-title">
        <div className="transactions-panel__header">
          <div>
            <p className="dashboard__eyebrow">Movimentações</p>
            <h2 id="latest-transactions-title">Transações recentes</h2>
          </div>
          <span className="transactions-panel__count">
            {latestTransactions.length} de até 5
          </span>
        </div>

        {latestTransactions.length > 0 ? (
          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th scope="col">Transação</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Data</th>
                  <th scope="col">Valor</th>
                </tr>
              </thead>
              <tbody>
                {latestTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="transaction-name">
                        <span className={`transaction-name__icon transaction-name__icon--${transaction.type}`}>
                          <ArrowIcon direction={transaction.type === 'income' ? 'up' : 'down'} />
                        </span>
                        <div>
                          <strong>{transaction.description || 'Transação sem descrição'}</strong>
                          {transaction.category && <small>{transaction.category}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`transaction-type transaction-type--${transaction.type}`}>
                        {getTransactionLabel(transaction.type)}
                      </span>
                    </td>
                    <td>{formatDate(transaction.date)}</td>
                    <td className={`transaction-amount transaction-amount--${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {currencyFormatter.format(Math.abs(transaction.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="transactions-empty">
            <span><BalanceIcon /></span>
            <h3>Nenhuma transação registrada</h3>
            <p>Suas movimentações mais recentes aparecerão aqui.</p>
          </div>
        )}
      </section>
    </div>
  );
}
