import React from 'react';
import { createRoot } from 'react-dom/client';
import { ExportWidget } from './ExportWidget';
import type { Transaction } from './utils/types';

class ExportWidgetElement extends HTMLElement {
  private root: ReturnType<typeof createRoot> | null = null;

  connectedCallback() {
    const mountPoint = document.createElement('div');
    this.appendChild(mountPoint);
    this.root = createRoot(mountPoint);
    this.render();
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;
  }

  static get observedAttributes() {
    return ['transactions', 'goals', 'limits'];
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
    if (!this.root) return;

    let transactions: Transaction[] = [];
    const raw = this.getAttribute('transactions');
    if (raw) {
      try {
        transactions = JSON.parse(raw) as Transaction[];
      } catch {
        console.warn('[financas-exportador] Invalid transactions JSON');
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let goals: any[] = [];
    const rawGoals = this.getAttribute('goals');
    if (rawGoals) {
      try { goals = JSON.parse(rawGoals); } catch {}
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let limits: any[] = [];
    const rawLimits = this.getAttribute('limits');
    if (rawLimits) {
      try { limits = JSON.parse(rawLimits); } catch {}
    }

    this.root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(ExportWidget, { transactions, goals, limits }),
      ),
    );
  }
}

if (!customElements.get('export-widget')) {
  customElements.define('export-widget', ExportWidgetElement);
}
