const API_PATHS = {
  spendingLimits: '/spending-limits',
  categories: '/categories',
  transactions: '/transactions',
} as const;

type ServiceWorkerMessage =
  | { type: 'INVALIDATE_CACHE'; paths: string[] }
  | { type: 'SHOW_NOTIFICATION'; title: string; body: string; tag?: string };

function postMessageToServiceWorker(message: ServiceWorkerMessage): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const controller = navigator.serviceWorker.controller;

  if (controller) {
    controller.postMessage(message);
    return;
  }

  void navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage(message);
  });
}

export function invalidateApiCache(paths: string[]): void {
  postMessageToServiceWorker({ type: 'INVALIDATE_CACHE', paths });
}

export function invalidateSpendingLimitsCache(): void {
  invalidateApiCache([API_PATHS.spendingLimits]);
}

export function invalidateTransactionsCache(): void {
  invalidateApiCache([API_PATHS.transactions]);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  return Notification.requestPermission();
}

export function showSpendingLimitNotification(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  postMessageToServiceWorker({
    type: 'SHOW_NOTIFICATION',
    title,
    body,
    tag: 'spending-limit-alert',
  });
}
