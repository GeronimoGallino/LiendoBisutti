import React from 'react';

const Paso4Exito = ({ presupuestoGenerado, cliente, onVolver, onCompartir }) => {
  return (
    <div className="flex flex-col gap-4 animate-fadeIn text-center mt-4">
      <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">¡Cotización Lista!</h2>
      <p className="text-gray-500 px-4">
        Presupuesto #{presupuestoGenerado?.id} para <b>{cliente.nombre_razon_social}</b> guardado con éxito.
      </p>
      
      <div className="flex flex-col gap-3 mt-6">
        <button onClick={onVolver} className="w-full py-4 bg-gray-800 text-white text-lg font-bold rounded-xl active:scale-95 shadow-md">
          Volver al Inicio
        </button>
        <button onClick={onCompartir} className="w-full py-4 bg-transparent text-brand font-bold mt-2 underline">
          Compartir PDF nuevamente
        </button>
      </div>
    </div>
  );
};

export default Paso4Exito;