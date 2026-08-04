import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ExchangeWidget } from './ExchangeWidget';
import { store } from './store';

class ExchangeWidgetElement extends HTMLElement {
  private root: ReturnType<typeof createRoot> | null = null;

  connectedCallback() {
    if (this.root) return;
    const mountPoint = document.createElement('div');
    this.appendChild(mountPoint);
    this.root = createRoot(mountPoint);
    this.root.render(React.createElement(Provider, { store, children: React.createElement(ExchangeWidget) }));
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;
  }
}

if (!customElements.get('exchange-widget')) {
  customElements.define('exchange-widget', ExchangeWidgetElement);
}
