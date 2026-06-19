import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode; // Requisito: recebe componente filho
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Se não estiver aberto, não renderiza absolutamente nada na árvore do DOM
  if (!isOpen) return null;

  return (
    // Fundo escurecido (Backdrop) - Fecha o modal ao clicar fora da janela interna
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      {/* Janela Interna do Modal (Card) - Impede que o clique aqui dentro feche o modal */}
      <div 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div>
          {title}
          <button 
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Conteúdo dinâmico (Componente Filho) */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}