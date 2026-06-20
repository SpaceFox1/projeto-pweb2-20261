import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchTransactions,
  deleteTransaction,
  updateTransaction,
  type Transaction,
} from '../store/slices/transactionsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import {
  BalanceOverTimeChart,
  ExpensesByCategoryChart,
  ExpensesOverTimeChart,
  IncomeExpenseRatioChart,
} from '../components/Charts';
import { EditTransactionModal, DeleteConfirmModal } from '../components/TransactionModals';
import styles from './home.module.css';

// Helper functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const getMonthTransactions = (transactions: Transaction[]): Transaction[] => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return transactions.filter((transaction) => {
    const transDate = new Date(transaction.date);
    return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
  });
};

const calculateMonthlyStats = (
  transactions: Transaction[],
): { balance: number; income: number; expense: number } => {
  const monthTransactions = getMonthTransactions(transactions);

  const income = monthTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = monthTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expense,
    balance: income - expense,
  };
};

const getRecentTransactions = (transactions: Transaction[], limit: number = 5): Transaction[] => {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export function HomePage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: transactions, loading, error } = useAppSelector((state) => state.transactions);
  const { items: categories } = useAppSelector((state) => state.categories);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleEditClick = (transaction: Transaction): void => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (transaction: Transaction): void => {
    setDeletingTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async (data: {
    id: number;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    categoryId: number;
    date: string;
  }): Promise<void> => {
    setIsSaving(true);
    const result = await dispatch(updateTransaction(data));
    setIsSaving(false);

    if (updateTransaction.fulfilled.match(result)) {
      setIsEditModalOpen(false);
      setEditingTransaction(null);
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deletingTransaction) return;

    setIsSaving(true);
    const result = await dispatch(deleteTransaction(deletingTransaction.id));
    setIsSaving(false);

    if (deleteTransaction.fulfilled.match(result)) {
      setIsDeleteModalOpen(false);
      setDeletingTransaction(null);
    }
  };

  const stats = calculateMonthlyStats(transactions);
  const recentTransactions = getRecentTransactions(transactions);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.welcome}>Bem-vindo, {user?.user.name}!</h1>
      </header>

      {error && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          {error}
        </div>
      )}

      <section className={styles['cards-grid']}>
        <div className={`${styles.card} ${styles['card--balance']}`}>
          <span className={styles['card-label']}>Saldo do Mês</span>
          <div className={styles['card-value']}>{formatCurrency(stats.balance)}</div>
          <p className={styles['card-detail']}>
            {stats.balance >= 0 ? '✓ Positivo' : '⚠ Negativo'}
          </p>
        </div>

        <div className={`${styles.card} ${styles['card--income']}`}>
          <span className={styles['card-label']}>Receitas</span>
          <div className={styles['card-value']}>{formatCurrency(stats.income)}</div>
          <p className={styles['card-detail']}>Neste mês</p>
        </div>

        <div className={`${styles.card} ${styles['card--expense']}`}>
          <span className={styles['card-label']}>Despesas</span>
          <div className={styles['card-value']}>{formatCurrency(stats.expense)}</div>
          <p className={styles['card-detail']}>Neste mês</p>
        </div>
      </section>

      {transactions.length > 0 && (
        <section className={styles['charts-section']}>
          <h2 className={styles['section-title']}>Análise Financeira</h2>
          <div className={styles['charts-grid']}>
            <div className={styles['chart-card']}>
              <h3 className={styles['chart-title']}>Saldo ao Longo do Tempo</h3>
              <BalanceOverTimeChart transactions={transactions} />
            </div>

            <div className={styles['chart-card']}>
              <h3 className={styles['chart-title']}>Despesas ao Longo dos Meses</h3>
              <ExpensesOverTimeChart transactions={transactions} />
            </div>

            <div className={styles['chart-card']}>
              <h3 className={styles['chart-title']}>Receitas vs Despesas</h3>
              <IncomeExpenseRatioChart transactions={transactions} />
            </div>

            <div className={styles['chart-card']}>
              <h3 className={styles['chart-title']}>Despesas por Categoria</h3>
              <ExpensesByCategoryChart transactions={transactions} />
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className={styles['section-title']}>Transações Recentes</h2>
        <div className={styles['transactions-container']}>
          {loading ? (
            <div className={styles['transactions-empty']}>Carregando transações...</div>
          ) : recentTransactions.length === 0 ? (
            <div className={styles['transactions-empty']}>Nenhuma transação registrada</div>
          ) : (
            <ul className={styles['transactions-list']}>
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className={styles['transaction-item']}>
                  <div className={styles['transaction-info']}>
                    <div
                      className={`${styles['transaction-icon']} ${transaction.type === 'INCOME'
                        ? styles['transaction-icon--income']
                        : styles['transaction-icon--expense']
                        }`}
                    >
                      {transaction.type === 'INCOME' ? '↓' : '↑'}
                    </div>
                    <div className={styles['transaction-details']}>
                      <h3>{transaction.description || 'Sem descrição'}</h3>
                      <p>{transaction.categoryName}</p>
                    </div>
                  </div>
                  <div className={styles['transaction-amount']}>
                    <div
                      className={`${styles['transaction-value']} ${transaction.type === 'INCOME'
                        ? styles['transaction-value--income']
                        : styles['transaction-value--expense']
                        }`}
                    >
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <p className={styles['transaction-date']}>{formatDate(transaction.date)}</p>
                  </div>
                  <div className={styles['transaction-actions']}>
                    <button
                      className={`${styles['action-btn']} ${styles['action-btn--edit']}`}
                      onClick={() => handleEditClick(transaction)}
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      className={`${styles['action-btn']} ${styles['action-btn--delete']}`}
                      onClick={() => handleDeleteClick(transaction)}
                      title="Deletar"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <EditTransactionModal
        isOpen={isEditModalOpen}
        transaction={editingTransaction}
        categories={categories}
        loading={isSaving}
        onSubmit={handleEditSubmit}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        transactionDescription={deletingTransaction?.description || null}
        loading={isSaving}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingTransaction(null);
        }}
      />
    </div>
  );
}
