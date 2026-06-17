import React from 'react';
import { formatearMoneda } from '../utils/formatters';

const Paso2Resumen = ({ totalesCalculados, incluyeIva, onAtras, onSiguiente }) => {
  // Calculamos los totales brutos y el monto de descuento "al vuelo"
  let subtotalBruto = 0;
  let descuentoTotal = 0;
  let tieneDescuento = false;
  let porcentajeMostrar = 0;

  if (totalesCalculados.detallesCalculados) {
    totalesCalculados.detallesCalculados.forEach(detalle => {
      const porcentaje = detalle.porcentaje_descuento || 0;
      const subtotalNeto = Number(detalle.subtotal_item) || 0;
      
      let subtotalOriginal = subtotalNeto;
      if (porcentaje > 0) {
        subtotalOriginal = subtotalNeto / (1 - (porcentaje / 100));
        tieneDescuento = true;
        porcentajeMostrar = porcentaje; // Tomamos el % para mostrarlo en el resumen global
      }

      subtotalBruto += subtotalOriginal;
      descuentoTotal += (subtotalOriginal - subtotalNeto);
    });
  }

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800">Resumen de Cotización</h2>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
        
        {/* LISTA DESGLOSADA POR SERVICIO */}
        {totalesCalculados.detallesCalculados?.map((detalle, idx) => (
          <div key={idx} className="flex justify-between border-b pb-3 text-gray-700">
            <div>
              <p className="font-bold text-sm text-gray-800">
                {detalle.snapshot_precios.servicio_nombre}
                {/* Etiqueta visual si este ítem tiene descuento */}
                {detalle.porcentaje_descuento > 0 && (
                  <span className="text-green-600 text-xs ml-2 font-bold">
                    ({detalle.porcentaje_descuento}% Off)
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {detalle.snapshot_precios.cantidad_km ? `${detalle.snapshot_precios.cantidad_km} km ` : ''}
                {detalle.snapshot_precios.cantidad_horas ? `${detalle.snapshot_precios.cantidad_horas} hs ` : ''}
                | {detalle.snapshot_precios.vehiculo_nombre}
              </p>
            </div>
            {/* SUBTOTAL INDIVIDUAL NETO (Ya viene con descuento del backend) */}
            <p className="font-bold text-gray-800">{formatearMoneda(detalle.subtotal_item)}</p>
          </div>
        ))}
        
        {/* DESGLOSE FINAL (SUBTOTAL + DESCUENTO + IVA) */}
        <div className="flex flex-col gap-1 pt-2">
          
          {tieneDescuento ? (
            <>
              <div className="flex justify-between items-center text-gray-500 text-sm">
                <p>Subtotal original:</p>
                <p>{formatearMoneda(subtotalBruto)}</p>
              </div>
              <div className="flex justify-between items-center text-green-600 text-sm font-bold bg-green-50 p-1 rounded">
                <p>Descuento ({porcentajeMostrar}%):</p>
                <p>- {formatearMoneda(descuentoTotal)}</p>
              </div>
              <div className="flex justify-between items-center text-gray-600 text-sm font-semibold mt-1">
                <p>Subtotal con descuento:</p>
                <p>{formatearMoneda(totalesCalculados.subtotalGeneral)}</p>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center text-gray-500 text-sm">
              <p>Subtotal de servicios:</p>
              <p>{formatearMoneda(totalesCalculados.subtotalGeneral)}</p>
            </div>
          )}
          
          {incluyeIva && (
            <div className="flex justify-between items-center text-gray-500 text-sm mt-1">
              <p>IVA (21%):</p>
              <p>{formatearMoneda(totalesCalculados.montoIva)}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-gray-100">
          <p className="text-xl font-bold text-gray-800">Total Final:</p>
          <p className="text-2xl font-bold text-brand">{formatearMoneda(totalesCalculados.totalFinal)}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={onAtras} className="w-1/3 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95">Atrás</button>
        <button onClick={onSiguiente} className="w-2/3 py-4 bg-brand text-white font-bold rounded-xl active:scale-95 shadow-md">
          Asignar Cliente ➔
        </button>
      </div>
    </div>
  );
};

export default Paso2Resumen;