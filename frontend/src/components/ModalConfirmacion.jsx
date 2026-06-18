import React from 'react';

const ModalConfirmacion = ({ isOpen, titulo, mensaje, textoConfirmar = "Confirmar", onConfirm, onCancelar, tipo = "warning" }) => {
  if (!isOpen) return null;

  // Estilos dinámicos según el tipo de acción
  const colorBoton = tipo === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600';
  const colorIcono = tipo === 'danger' ? 'text-red-500 bg-red-100' : 'text-amber-500 bg-amber-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="p-6 flex flex-col items-center text-center">
          
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colorIcono}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">{titulo}</h3>
          <p className="text-gray-500 text-sm whitespace-pre-wrap">{mensaje}</p>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button 
            onClick={onCancelar}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md active:scale-95 transition-all ${colorBoton}`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;