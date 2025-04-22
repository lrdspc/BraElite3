import React from 'react';

interface SWUpdateBannerProps {
  onReload: () => void;
}

export const SWUpdateBanner: React.FC<SWUpdateBannerProps> = ({ onReload }) => {
  // Envia mensagem para o SW ativar imediatamente
  const skipWaitingAndReload = () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    // Pequeno delay para garantir ativação antes do reload
    setTimeout(() => {
      onReload();
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      background: '#323232',
      color: '#fff',
      padding: '1rem',
      textAlign: 'center',
      zIndex: 1000,
      boxShadow: '0 -2px 6px rgba(0,0,0,0.15)'
    }}>
      Nova versão disponível. <button
        onClick={skipWaitingAndReload}
        style={{
          marginLeft: '1rem',
          background: '#EE1B24',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >Atualizar</button>
    </div>
  );
};
