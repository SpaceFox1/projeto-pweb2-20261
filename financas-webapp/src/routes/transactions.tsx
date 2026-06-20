import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchTransactions,
  deleteTransaction,
  updateTransaction,
  type Transaction,
  type TransactionType,
} from '../store/slices/transactionsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { EditTransactionModal, DeleteConfirmModal } from '../components/TransactionModals';
import styles from './transactions.module.css';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
});

function formatType(type: TransactionType): string {
  return type === 'INCOME' ? 'Receita' : 'Despesa';
}

function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function TransactionsPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.transactions);
  const { items: categories } = useAppSelector((state) => state.categories);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void dispatch(fetchTransactions());
    void dispatch(fetchCategories());
  }, [dispatch]);

  // Action Triggers
  const handleEditClick = (transaction: Transaction): void => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (transaction: Transaction): void => {
    setDeletingTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  // Submit Handlers
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

  return (
    <section className={styles.transactionsPage} aria-labelledby="transactions-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Controle financeiro</p>
        <h1 id="transactions-title">Histórico de transações</h1>
        <p>Consulte as receitas e despesas já registradas.</p>
      </header>

      {loading && (
        <p className={styles.status} role="status">
          Carregando transações...
        </p>
      )}

      {!loading && error && (
        <p className={`${styles.status} ${styles.statusError}`} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className={styles.status}>
          Nenhuma transação registrada.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Valor</th>
                <th scope="col">Categoria</th>
                <th scope="col">Data</th>
                <th scope="col">Descrição</th>
                <th scope="col" className={styles.actionsHeader}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((transaction) => {
                const isIncome = transaction.type === 'INCOME';
                const typeModifierClass = isIncome ? styles.typeIncome : styles.typeExpense;
                const amountModifierClass = isIncome ? styles.amountIncome : styles.amountExpense;

                return (
                  <tr key={transaction.id}>
                    <td>
                      <span className={`${styles.type} ${typeModifierClass}`}>
                        {formatType(transaction.type)}
                      </span>
                    </td>
                    <td className={`${styles.amount} ${amountModifierClass}`}>
                      {currencyFormatter.format(transaction.amount)}
                    </td>
                    <td>{transaction.categoryName}</td>
                    <td>{formatDate(transaction.date)}</td>
                    <td className={styles.description}>
                      {transaction.description || '—'}
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                          onClick={() => handleEditClick(transaction)}
                          title="Editar"
                        >
                          <svg className={styles.actionIcon} viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                          onClick={() => handleDeleteClick(transaction)}
                          title="Deletar"
                        >
                          <svg className={styles.actionIcon} viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
    </section>
  );
}