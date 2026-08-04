import { useState, useEffect } from 'react';
import { Modal } from './Modal';

export function NetworkErrorModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('api-network-error', handler);
    return () => window.removeEventListener('api-network-error', handler);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Erro de Conexão">
      <div style={{ color: '#64748B', lineHeight: '1.6' }}>
        <p style={{ margin: '0 0 12px' }}>
          Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.
        </p>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#0B1528',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Entendi
        </button>
      </div>
    </Modal>
  );
}
