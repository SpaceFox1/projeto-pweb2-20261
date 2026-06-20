import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import type { Transaction, TransactionType } from '../store/slices/transactionsSlice';
import styles from './TransactionModals.module.css';

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  categories: Array<{ id: number; name: string }>;
  loading: boolean;
  onSubmit: (data: {
    id: number;
    description: string;
    amount: number;
    type: TransactionType;
    categoryId: number;
    date: string;
  }) => void;
  onClose: () => void;
}

export function EditTransactionModal({
  isOpen,
  transaction,
  categories,
  loading,
  onSubmit,
  onClose,
}: EditTransactionModalProps): React.ReactElement {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('INCOME');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description || '');
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setCategoryId(transaction.categoryId);
      setDate(transaction.date);
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!transaction || !categoryId) return;

    onSubmit({
      id: transaction.id,
      description,
      amount: parseFloat(amount),
      type,
      categoryId: categoryId as number,
      date,
    });
  };

  if (!isOpen) return <></>;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2>Editar Transação</h2>
          <button className={styles['close-btn']} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles['modal-form']}>
          <div className={styles['form-group']}>
            <div className={styles['type-toggle']}>
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`${styles['toggle-btn']} ${type === 'INCOME' ? styles.active : ''}`}
              >
                ▲ Receita
              </button>
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`${styles['toggle-btn']} ${type === 'EXPENSE' ? styles.active : ''}`}
              >
                ▼ Despesa
              </button>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="edit-description">Descrição</label>
            <input
              id="edit-description"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles['form-input']}
            />
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label htmlFor="edit-amount">Valor (R$)</label>
              <input
                id="edit-amount"
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles['form-input']}
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="edit-date">Data</label>
              <input
                id="edit-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles['form-input']}
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="edit-category">Categoria</label>
            <select
              id="edit-category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
              className={styles['form-input']}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles['modal-actions']}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.btn} ${styles['btn-secondary']}`}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles['btn-primary']}`}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  transactionDescription: string | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  transactionDescription,
  loading,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps): React.ReactElement {
  if (!isOpen) return <></>;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2>Confirmar Exclusão</h2>
          <button className={styles['close-btn']} onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className={styles['modal-content']}>
          <p>
            Tem certeza que deseja excluir a transação{' '}
            <strong>"{transactionDescription || 'Sem descrição'}"</strong>?
          </p>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '12px' }}>
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className={styles['modal-actions']}>
          <button
            type="button"
            onClick={onCancel}
            className={`${styles.btn} ${styles['btn-secondary']}`}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${styles.btn} ${styles['btn-danger']}`}
            disabled={loading}
          >
            {loading ? 'Deletando...' : 'Deletar'}
          </button>
        </div>
      </div>
    </div>
  );
}
