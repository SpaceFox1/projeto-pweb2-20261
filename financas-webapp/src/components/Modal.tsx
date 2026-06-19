import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    // Backdrop limpo: Apenas escurece o fundo suavemente para isolar o foco, sem desfoques
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 21, 40, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* O Molde (Card) - Totalmente plano, focado no conteúdo filho */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
          width: '100%',
          maxWidth: '460px',
          position: 'relative',
        }}
      >
        {/* Cabeçalho Minimalista */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {title && (
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0B1528', fontWeight: 600 }}>
              {title}
            </h2>
          )}
          
          {/* Botão fechar sutil */}
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              cursor: 'pointer',
              color: '#94A3B8', // Cinza neutro das bordas do Figma
              padding: '0',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Espaço do Componente Filho - O conteúdo injetado assume o controle total daqui para baixo */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}