import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';

export const selectAllTransactions = (state: RootState) => state.transactions.items;

function getTransactionTimestamp(date: string): number {
  const timestamp = Date.parse(date);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function isFromCurrentMonth(date: string): boolean {
  const datePart = date.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (!match) {
    return false;
  }

  const today = new Date();
  return Number(match[1]) === today.getFullYear()
    && Number(match[2]) === today.getMonth() + 1;
}

export const selectCurrentMonthTransactions = createSelector(
  [selectAllTransactions],
  (transactions) => transactions.filter((transaction) => isFromCurrentMonth(transaction.date)),
);

export const selectCurrentMonthIncome = createSelector(
  [selectCurrentMonthTransactions],
  (transactions) => transactions.reduce(
    (total, transaction) => transaction.type === 'income'
      ? total + Math.abs(transaction.amount)
      : total,
    0,
  ),
);

export const selectCurrentMonthExpenses = createSelector(
  [selectCurrentMonthTransactions],
  (transactions) => transactions.reduce(
    (total, transaction) => transaction.type === 'expense'
      ? total + Math.abs(transaction.amount)
      : total,
    0,
  ),
);

export const selectCurrentBalance = createSelector(
  [selectAllTransactions],
  (transactions) => transactions.reduce(
    (balance, transaction) => transaction.type === 'income'
      ? balance + Math.abs(transaction.amount)
      : balance - Math.abs(transaction.amount),
    0,
  ),
);

export const selectLatestTransactions = createSelector(
  [selectAllTransactions],
  (transactions) => transactions
    .map((transaction, index) => ({ transaction, index }))
    .sort((first, second) => (
      getTransactionTimestamp(second.transaction.date)
        - getTransactionTimestamp(first.transaction.date)
      || second.index - first.index
    ))
    .slice(0, 5)
    .map(({ transaction }) => transaction),
);
