import React from 'react';

const Paso1Servicios = ({ catalogos, servicioActual, setServicioActual, serviciosAgregados, setServiciosAgregados, agregarServicio, eliminarServicio, incluyeIva, setIncluyeIva, isSubmitting, onCalcular }) => {

  const [descuentoGlobal, setDescuentoGlobal] = React.useState('');

  const servicioSeleccionado = catalogos.servicios.find(s => s.id === Number(servicioActual.servicio_id));
  const tipoCalculo = servicioSeleccionado ? servicioSeleccionado.tipo_calculo : '';

  // VALIDACIÓN DE NÚMEROS LIMPIOS: Evita letras, negativos y múltiples puntos
  const handleNumberChange = (campo, valor) => {
    // Permite números y un solo punto decimal, evita caracteres raros
    const valorLimpio = valor.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    setServicioActual({ ...servicioActual, [campo]: valorLimpio });
  };

  const aplicarDescuentoGlobal = () => {
    const descuentoNum = Number(descuentoGlobal);
    if (descuentoGlobal === '' || isNaN(descuentoNum) || descuentoNum < 0 || descuentoNum > 100) {
      alert('Ingresa un porcentaje de descuento válido (entre 0 y 100)');
      return;
    }
   
      const serviciosActualizados = serviciosAgregados.map(srv => ({
        ...srv,
        porcentaje_descuento: descuentoNum
      }));
      setServiciosAgregados(serviciosActualizados);
      setDescuentoGlobal('');
    
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

  // BLINDAJE: Ahora valida que los números sean mayores a 0 para habilitar el botón
  const esFormularioValido = () => {
    if (!servicioActual.servicio_id) return false;
    
    if (['FLETE', 'AUXILIO', 'MUDANZA_INTERIOR'].includes(tipoCalculo)) {
      return servicioActual.vehiculo_id !== '' && Number(servicioActual.cantidad_km) > 0 && servicioActual.costo_base_fijo_manual !== '';
    }
    if (tipoCalculo === 'MUDANZA_LOCAL') {
      return servicioActual.vehiculo_id !== '' && Number(servicioActual.cantidad_horas) > 0 && servicioActual.precio_hora_manual !== '';
    }
    if (tipoCalculo === 'ALQUILER_MULA') {
      return Number(servicioActual.cantidad_horas) > 0 && servicioActual.precio_hora_manual !== '';
    }
    return false;
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800">¿Qué vas a presupuestar?</h2>
      
      {/* FORMULARIO DE CARGA */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <select value={servicioActual.servicio_id} onChange={handleServicioChange} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">Seleccionar Servicio...</option>
          {catalogos.servicios.map(srv => <option key={srv.id} value={srv.id}>{srv.nombre}</option>)}
        </select>

        {['FLETE', 'AUXILIO', 'MUDANZA_INTERIOR'].includes(tipoCalculo) && (
          <>
            <div className="flex gap-2">
              <input 
                type="tel" 
                inputMode="decimal"
                placeholder="Cant. KM" 
                value={servicioActual.cantidad_km} 
                onChange={(e) => handleNumberChange('cantidad_km', e.target.value)} 
                className="w-1/2 p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"
              />
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
                      inputMode="decimal"
                      value={servicioActual.costo_base_fijo_manual}
                      onChange={(e) => handleNumberChange('costo_base_fijo_manual', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-brand"
                    />
                 </div>
               </div>
            )}
          </>
        )}

        {tipoCalculo === 'MUDANZA_LOCAL' && (
          <>
            <div className="flex gap-2">
              <input 
                type="tel" 
                inputMode="decimal"
                placeholder="Horas" 
                value={servicioActual.cantidad_horas} 
                onChange={(e) => handleNumberChange('cantidad_horas', e.target.value)} 
                className="w-1/2 p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"
              />
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
                      inputMode="decimal"
                      value={servicioActual.precio_hora_manual}
                      onChange={(e) => handleNumberChange('precio_hora_manual', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-brand"
                    />
                 </div>
               </div>
            )}
          </>
        )}

        {tipoCalculo === 'ALQUILER_MULA' && (
          <>
            <input 
              type="tel" 
              inputMode="decimal"
              placeholder="Cantidad de Horas" 
              value={servicioActual.cantidad_horas} 
              onChange={(e) => handleNumberChange('cantidad_horas', e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"
            />
            
            <div className="flex bg-gray-100 p-3 rounded-xl border border-gray-200 mt-1">
              <div className="w-full">
                <label className="text-xs text-gray-600 block mb-1">Precio por Hora ($) - Editable</label>
                <input
                  type="tel"
                  inputMode="decimal"
                  value={servicioActual.precio_hora_manual}
                  onChange={(e) => handleNumberChange('precio_hora_manual', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
          </>
        )}

        <button 
          onClick={() => agregarServicio(tipoCalculo, servicioSeleccionado)} 
          disabled={!esFormularioValido()} 
          className={`w-full py-3 font-bold rounded-xl active:scale-95 transition-all mt-2 
            ${esFormularioValido() ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed'}`}
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
              <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-brand-light/30 hover:shadow-md transition-shadow">
                <div>
                  <p className="font-bold text-sm text-gray-800">{srv.nombre_servicio}</p>
                  <p className="text-xs text-gray-500">
                    {srv.cantidad_km > 0 ? `${srv.cantidad_km} km ` : ''}
                    {srv.cantidad_horas > 0 ? `${srv.cantidad_horas} hs ` : ''}
                    | {srv.nombre_vehiculo}
                    {srv.porcentaje_descuento > 0 && <span className="ml-2 font-semibold text-green-600">Desc: {srv.porcentaje_descuento}%</span>}
                  </p>
                </div>
                <button onClick={() => eliminarServicio(idx)} title="Eliminar servicio" className="text-red-400 hover:text-red-600 active:scale-90 p-2 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </li>
            ))}
          </ul>

          <label className="flex items-center gap-2 bg-white p-3 rounded-xl border border-brand-light cursor-pointer mt-2 hover:bg-gray-50 transition-colors">
            <input type="checkbox" checked={incluyeIva} onChange={(e) => setIncluyeIva(e.target.checked)} className="w-5 h-5 text-brand rounded focus:ring-brand"/>
            <span className="text-gray-700 font-medium text-sm">Este presupuesto incluye IVA</span>
          </label>

          {/* DESCUENTO GLOBAL */}
{/* DESCUENTO GLOBAL COMPACTO */}
          <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex flex-col gap-2">
            <h4 className="text-green-900 font-bold text-xs uppercase tracking-wide">Descuento Global</h4>
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="tel"
                  inputMode="decimal"
                  maxLength="2"
                  value={descuentoGlobal}
                  onChange={(e) => setDescuentoGlobal(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-20 px-3 py-2 border border-green-300 rounded-lg bg-white text-sm text-center font-bold text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="absolute right-3 top-2 text-sm font-bold text-green-400 pointer-events-none">%</span>
              </div>
              <button
                onClick={aplicarDescuentoGlobal}
                disabled={!descuentoGlobal || isNaN(Number(descuentoGlobal))}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-3 py-2 rounded-lg font-bold text-sm active:scale-95 transition-all"
              >
                Aplicar a todos
              </button>
            </div>
          </div>
          <button onClick={onCalcular} disabled={isSubmitting} className="bg-brand text-white w-full py-4 rounded-xl font-bold shadow-md active:scale-95 mt-2 text-lg hover:bg-opacity-90 transition-colors">
            {isSubmitting ? 'Calculando...' : 'Calcular Total ➔'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Paso1Servicios;