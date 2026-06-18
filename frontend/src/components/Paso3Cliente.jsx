import React from 'react';

const Paso3Cliente = ({ cliente, setCliente, clientesDisponibles, isSubmitting, onAtras, onProcesar }) => {
  return (
   <div className="p-4 flex flex-col gap-4 min-h-screen max-w-2xl mx-auto w-full">
      <h2 className="text-xl font-bold text-gray-800">¿Para quién es?</h2>
      
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-2">
          <button onClick={() => setCliente({...cliente, esNuevo: true, id: null})} className={`flex-1 py-2 rounded-md font-bold text-sm ${cliente.esNuevo ? 'bg-white shadow-sm text-brand' : 'text-gray-500'}`}>
            Nuevo Cliente
          </button>
          <button onClick={() => setCliente({...cliente, esNuevo: false})} className={`flex-1 py-2 rounded-md font-bold text-sm ${!cliente.esNuevo ? 'bg-white shadow-sm text-brand' : 'text-gray-500'}`}>
            Buscar Existente
          </button>
        </div>

        {cliente.esNuevo ? (
          <>
            <input type="text" placeholder="Nombre completo / Empresa *" value={cliente.nombre_razon_social} onChange={(e) => setCliente({...cliente, nombre_razon_social: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg" />
            <input type="tel" placeholder="Teléfono (Opcional)" value={cliente.telefono} onChange={(e) => setCliente({...cliente, telefono: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg" />
            <input type="tel" placeholder="CUIT/DNI (Opcional)" value={cliente.cuit_dni} onChange={(e) => setCliente({...cliente, cuit_dni: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg" />
          </>
        ) : (
          <select 
            onChange={(e) => setCliente({...cliente, id: e.target.value, nombre_razon_social: e.target.options[e.target.selectedIndex].text })} 
            className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"
          >
            <option value="">Seleccionar de la lista...</option>
            {clientesDisponibles.map(c => (
              <option key={c.id} value={c.id}>{c.nombre_razon_social}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <button 
          onClick={() => onProcesar('GENERAR_PDF')} 
          disabled={(!cliente.esNuevo && !cliente.id) || (cliente.esNuevo && !cliente.nombre_razon_social) || isSubmitting}
          className="w-full py-4 bg-green-500 text-white text-lg font-bold rounded-xl active:scale-95 shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isSubmitting ? 'Procesando...' : 'Guardar y Compartir PDF'}
        </button>
        
        <div className="flex gap-2">
          <button onClick={onAtras} className="w-1/3 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95">Atrás</button>
          <button 
            onClick={() => onProcesar('SOLO_GUARDAR')} 
            disabled={(!cliente.esNuevo && !cliente.id) || (cliente.esNuevo && !cliente.nombre_razon_social) || isSubmitting}
            className="w-2/3 py-4 bg-gray-800 text-white font-bold rounded-xl active:scale-95 disabled:opacity-50"
          >
            Solo Guardar Borrador
          </button>
        </div>
      </div>
    </div>
  );
};

export default Paso3Cliente;