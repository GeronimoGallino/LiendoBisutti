import React from 'react';
import { formatearMoneda } from '../utils/formatters';

const Paso2Resumen = ({ totalesCalculados, incluyeIva, onAtras, onSiguiente }) => {
  // Verificamos si hubo algún descuento aplicado usando la data limpia del back
  const tieneDescuento = totalesCalculados.descuentoTotal > 0;

  // Buscamos el porcentaje del primer ítem que tenga descuento para mostrarlo en la etiqueta global
  const primerDetalleConDescuento = totalesCalculados.detallesCalculados?.find(d => d.porcentaje_descuento > 0);
  const porcentajeMostrar = primerDetalleConDescuento ? primerDetalleConDescuento.porcentaje_descuento : 0;

  return (
   <div className="p-4 flex flex-col gap-4 min-h-screen max-w-2xl mx-auto w-full">
      <h2 className="text-xl font-bold text-gray-800">Resumen de Cotización</h2>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
        
        {/* LISTA DESGLOSADA POR SERVICIO (Muestra precios BRUTOS) */}
        {totalesCalculados.detallesCalculados?.map((detalle, idx) => (
          <div key={idx} className="flex justify-between border-b pb-3 text-gray-700">
            <div>
              <p className="font-bold text-sm text-gray-800">
                {detalle.snapshot_precios.servicio_nombre}
                {detalle.porcentaje_descuento > 0 && (
                  <span className="text-blue-600 text-xs ml-2 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {detalle.porcentaje_descuento}% Off
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {detalle.snapshot_precios.cantidad_km ? `${detalle.snapshot_precios.cantidad_km} km ` : ''}
                {detalle.snapshot_precios.cantidad_horas ? `${detalle.snapshot_precios.cantidad_horas} hs ` : ''}
                | {detalle.snapshot_precios.vehiculo_nombre}
              </p>
            </div>
            {/* Muestra el Subtotal bruto individual */}
            <p className="font-bold text-gray-800">{formatearMoneda(detalle.subtotal_item)}</p>
          </div>
        ))}
        
        {/* DESGLOSE FINAL LINEAL */}
        <div className="flex flex-col gap-1 pt-2">
          
          <div className="flex justify-between items-center text-gray-500 text-sm">
            <p>Subtotal de servicios:</p>
            <p>{formatearMoneda(totalesCalculados.subtotalBruto)}</p>
          </div>

          {tieneDescuento && (
            <>
              <div className="flex justify-between items-center text-green-600 text-sm font-bold bg-green-50 p-1.5 rounded my-1">
                <p>Descuento ({porcentajeMostrar}%):</p>
                <p>- {formatearMoneda(totalesCalculados.descuentoTotal)}</p>
              </div>
              <div className="flex justify-between items-center text-gray-600 text-sm font-semibold">
                <p>Subtotal Neto:</p>
                <p>{formatearMoneda(totalesCalculados.subtotalGeneral)}</p>
              </div>
            </>
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