import React from 'react';

const Paso1Servicios = ({ catalogos, servicioActual, setServicioActual, serviciosAgregados, setServiciosAgregados, agregarServicio, eliminarServicio, incluyeIva, setIncluyeIva, isSubmitting, onCalcular }) => {

  const [descuentoGlobal, setDescuentoGlobal] = React.useState('');

  const servicioSeleccionado = catalogos.servicios.find(s => s.id === Number(servicioActual.servicio_id));
  const tipoCalculo = servicioSeleccionado ? servicioSeleccionado.tipo_calculo : '';

  const aplicarDescuentoGlobal = () => {
    if (descuentoGlobal === '' || isNaN(descuentoGlobal) || Number(descuentoGlobal) < 0 || Number(descuentoGlobal) > 100) {
      alert('Ingresa un porcentaje de descuento válido (0-100)');
      return;
    }
    const descuentoNum = Number(descuentoGlobal);
    const serviciosActualizados = serviciosAgregados.map(srv => ({
      ...srv,
      porcentaje_descuento: descuentoNum
    }));
    setServiciosAgregados(serviciosActualizados);
    setDescuentoGlobal(''); // Limpiamos el input tras aplicar
  };

  const handleServicioChange = (e) => {
    const servId = e.target.value;
    const srv = catalogos.servicios.find(s => s.id === Number(servId));
    
    let p_hora = '';
    if (srv && srv.tipo_calculo === 'ALQUILER_MULA') {
      const mulaDb = catalogos.vehiculos.find(v => v.nombre.toLowerCase().includes('mula'));
      if (mulaDb) p_hora = mulaDb.precio_hora;
    }

    setServicioActual({
      servicio_id: servId,
      vehiculo_id: '',
      cantidad_km: '',
      cantidad_horas: '',
      costo_base_fijo_manual: '',
      precio_hora_manual: p_hora,
      porcentaje_descuento: '' 
    });
  };

  const handleVehiculoChange = (e) => {
    const vehiculo_id = e.target.value;
    const vehiculoObj = catalogos.vehiculos.find(v => v.id === Number(vehiculo_id));
    
    setServicioActual({
      ...servicioActual,
      vehiculo_id,
      costo_base_fijo_manual: vehiculoObj ? vehiculoObj.costo_base_fijo : '',
      precio_hora_manual: vehiculoObj ? vehiculoObj.precio_hora : ''
    });
  };

  const esFormularioValido = () => {
    if (!servicioActual.servicio_id) return false;
    if (['FLETE', 'AUXILIO', 'MUDANZA_INTERIOR'].includes(tipoCalculo)) return servicioActual.vehiculo_id !== '' && servicioActual.cantidad_km !== '';
    if (tipoCalculo === 'MUDANZA_LOCAL') return servicioActual.vehiculo_id !== '' && servicioActual.cantidad_horas !== '';
    if (tipoCalculo === 'ALQUILER_MULA') return servicioActual.cantidad_horas !== '';
    return true;
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800">¿Qué vas a presupuestar?</h2>
      
      {/* FORMULARIO DE CARGA LIMPÍSIMO */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <select value={servicioActual.servicio_id} onChange={handleServicioChange} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">Seleccionar Servicio...</option>
          {catalogos.servicios.map(srv => <option key={srv.id} value={srv.id}>{srv.nombre}</option>)}
        </select>

        {['FLETE', 'AUXILIO', 'MUDANZA_INTERIOR'].includes(tipoCalculo) && (
          <>
            <div className="flex gap-2">
              <input type="tel" placeholder="Cant. KM" value={servicioActual.cantidad_km} onChange={(e) => setServicioActual({...servicioActual, cantidad_km: e.target.value})} className="w-1/2 p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"/>
              <select value={servicioActual.vehiculo_id} onChange={handleVehiculoChange} className="w-1/2 p-3 border border-gray-300 rounded-xl bg-gray-50">
                <option value="" disabled>Seleccionar Vehículo...</option>
                {catalogos.vehiculos.filter(v => !v.nombre.toLowerCase().includes('mula')).map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </select>
            </div>
            
            {servicioActual.vehiculo_id && (
               <div className="flex bg-gray-100 p-3 rounded-xl border border-gray-200 mt-1">
                 <div className="w-full">
                    <label className="text-xs text-gray-600 block mb-1">Costo Fijo Base ($) - Editable</label>
                    <input
                      type="tel"
                      value={servicioActual.costo_base_fijo_manual}
                      onChange={(e) => setServicioActual({...servicioActual, costo_base_fijo_manual: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white text-base"
                    />
                 </div>
               </div>
            )}
          </>
        )}

        {tipoCalculo === 'MUDANZA_LOCAL' && (
          <>
            <div className="flex gap-2">
              <input type="tel" placeholder="Horas" value={servicioActual.cantidad_horas} onChange={(e) => setServicioActual({...servicioActual, cantidad_horas: e.target.value})} className="w-1/2 p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"/>
              <select value={servicioActual.vehiculo_id} onChange={handleVehiculoChange} className="w-1/2 p-3 border border-gray-300 rounded-xl bg-gray-50">
                <option value="" disabled>Seleccionar Vehículo...</option>
                {catalogos.vehiculos.filter(v => !v.nombre.toLowerCase().includes('mula')).map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </select>
            </div>

            {servicioActual.vehiculo_id && (
               <div className="flex bg-gray-100 p-3 rounded-xl border border-gray-200 mt-1">
                 <div className="w-full">
                    <label className="text-xs text-gray-600 block mb-1">Precio por Hora ($) - Editable</label>
                    <input
                      type="tel"
                      value={servicioActual.precio_hora_manual}
                      onChange={(e) => setServicioActual({...servicioActual, precio_hora_manual: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white text-base"
                    />
                 </div>
               </div>
            )}
          </>
        )}

        {tipoCalculo === 'ALQUILER_MULA' && (
          <>
            <input type="tel" placeholder="Cantidad de Horas" value={servicioActual.cantidad_horas} onChange={(e) => setServicioActual({...servicioActual, cantidad_horas: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"/>
            
            <div className="flex bg-gray-100 p-3 rounded-xl border border-gray-200 mt-1">
              <div className="w-full">
                <label className="text-xs text-gray-600 block mb-1">Precio por Hora ($) - Editable</label>
                <input
                  type="tel"
                  value={servicioActual.precio_hora_manual}
                  onChange={(e) => setServicioActual({...servicioActual, precio_hora_manual: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-base"
                />
              </div>
            </div>
          </>
        )}

        <button 
          onClick={() => agregarServicio(tipoCalculo, servicioSeleccionado)} 
          disabled={!esFormularioValido()} 
          className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95 disabled:opacity-50 mt-2 transition-opacity"
        >
          + Sumar a la cotización
        </button>
      </div>

      {/* CARRITO DE SERVICIOS */}
      {serviciosAgregados.length > 0 && (
        <div className="bg-brand-light/20 border border-brand-light p-4 rounded-2xl flex flex-col gap-3">
          <h3 className="text-brand-dark font-bold border-b border-brand-light/50 pb-2">Servicios Cargados:</h3>
          
          <ul className="flex flex-col gap-2">
            {serviciosAgregados.map((srv, idx) => (
              <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-brand-light/30">
                <div>
                  <p className="font-bold text-sm text-gray-800">{srv.nombre_servicio}</p>
                  <p className="text-xs text-gray-500">
                    {srv.cantidad_km ? `${srv.cantidad_km} km ` : ''}
                    {srv.cantidad_horas ? `${srv.cantidad_horas} hs ` : ''}
                    | {srv.nombre_vehiculo}
                  </p>
                  {/* Badge de descuento aplicado para feedback visual */}
                  {srv.porcentaje_descuento > 0 && (
                    <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                      {srv.porcentaje_descuento}% Off aplicado
                    </span>
                  )}
                </div>
                <button onClick={() => eliminarServicio(idx)} className="text-red-400 hover:text-red-600 active:scale-90 p-2 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </li>
            ))}
          </ul>

          <label className="flex items-center gap-2 bg-white p-3 rounded-xl border border-brand-light cursor-pointer mt-2">
            <input type="checkbox" checked={incluyeIva} onChange={(e) => setIncluyeIva(e.target.checked)} className="w-5 h-5 text-brand rounded focus:ring-brand"/>
            <span className="text-gray-700 font-medium text-sm">Este presupuesto incluye IVA</span>
          </label>

          {/* DESCUENTO GLOBAL SUTIL */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="tel"
              min="0"
              max="100"
              maxLength="2"
              value={descuentoGlobal}
              onChange={(e) => setDescuentoGlobal(e.target.value)}
              placeholder="Descuento global (%)"
              className="flex-1 p-3 border border-gray-300 rounded-xl bg-white text-sm"
            />
            <button
              onClick={aplicarDescuentoGlobal}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-xl font-bold text-sm active:scale-95 transition-colors"
            >
              Aplicar
            </button>
          </div>

          <button onClick={onCalcular} disabled={isSubmitting} className="bg-brand text-white w-full py-4 rounded-xl font-bold shadow-md active:scale-95 mt-2 text-lg">
            {isSubmitting ? 'Calculando...' : 'Calcular Total ➔'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Paso1Servicios;