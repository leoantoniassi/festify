import React, { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext();

export const useConfirm = () => {
  return useContext(ConfirmContext);
};

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    title: 'Confirmação',
    isDanger: false,
    showCancel: true,
    resolve: null,
  });

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      // Verifica se a mensagem de exclusão para aplicar o estilo vermelho
      const isDanger = options.isDanger !== undefined 
        ? options.isDanger 
        : message.toLowerCase().includes('excluir') || message.toLowerCase().includes('rejeitar') || options.title?.toLowerCase().includes('erro');

      setConfirmState({
        isOpen: true,
        message,
        title: options.title || 'Confirmação',
        isDanger,
        showCancel: options.showCancel !== undefined ? options.showCancel : true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmState.resolve) confirmState.resolve(true);
    closeModal();
  };

  const handleCancel = () => {
    if (confirmState.resolve) confirmState.resolve(false);
    closeModal();
  };

  const closeModal = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {confirmState.isOpen && (
        <div 
          className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in"
          onClick={handleCancel}
        >
          <div 
            className="bg-surface rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 text-on-surface">
              <span className={`material-symbols-outlined text-3xl ${confirmState.isDanger ? 'text-error' : 'text-primary'}`}>
                {confirmState.isDanger ? 'warning' : 'info'}
              </span>
              <h3 className="text-xl font-headline font-bold">{confirmState.title}</h3>
            </div>
            
            <p className="text-on-surface-variant font-medium mb-8 leading-relaxed">
              {confirmState.message}
            </p>
            
            <div className="flex gap-3 justify-end">
              {confirmState.showCancel && (
                <button 
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-full font-bold bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button 
                onClick={handleConfirm}
                className={`px-6 py-2.5 rounded-full font-bold shadow-md transition-all hover:scale-105 active:scale-95 ${
                  confirmState.isDanger 
                    ? 'bg-error text-on-error hover:bg-error/90 shadow-error/30' 
                    : 'bg-primary text-on-primary hover:bg-primary/90 shadow-primary/30'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
