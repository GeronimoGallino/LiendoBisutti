import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviciosService } from '../services/servicios.service';
import { clientesService } from '../services/clientes.service';
import { presupuestosService } from '../services/presupuestos.service';
import { vehiculosService } from '../services/categorias-vehiculos.service'; 

const WizardPresupuesto = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS DE DATOS EXTERNOS ---
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState([]); // NUEVO
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ESTADOS DEL WIZARD ---
  const [pasoActual, setPasoActual] = useState(1);
  const [serviciosAgregados, setServiciosAgregados] = useState([]);
  const [totalesCalculados, setTotalesCalculados] = useState({ subtotal_general: 0, total_final: 0 });
  const [presupuestoGenerado, setPresupuestoGenerado] = useState(null);
  
  // NUEVO: Estado del IVA
  const [incluyeIva, setIncluyeIva] = useState(false);

  // ADAPTADO: Nombres exactos que pide tu backend
  const [servicioActual, setServicioActual] = useState({ 
    servicio_id: '', 
    vehiculo_id: '', 
    cantidad_km: '', 
    cantidad_horas: '' 
  });

  const [cliente, setCliente] = useState({
    esNuevo: true,
    id: null,
    nombre_razon_social: '',
    telefono: '',
    cuit_dni: ''
  });

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const [serviciosRes, clientesRes, vehiculosRes] = await Promise.all([
          serviciosService.obtenerTodos(),
          clientesService.obtenerTodos(),
          vehiculosService.obtenerTodos() // Traemos los vehículos
        ]);
        setServiciosDisponibles(serviciosRes);
        setClientesDisponibles(clientesRes);
        setVehiculosDisponibles(vehiculosRes);
      } catch (error) {
        console.error("Error cargando catálogos", error);
      }
    };
    cargarDatosIniciales();
  }, []);

  const servicioSeleccionado = serviciosDisponibles.find(
    s => s.id === Number(servicioActual.servicio_id)
  );
  const tipoCalculo = servicioSeleccionado ? servicioSeleccionado.tipo_calculo : '';

  const handleServicioChange = (e) => {
    setServicioActual({ servicio_id: e.target.value, vehiculo_id: '', cantidad_km: '', cantidad_horas: '' });
  };

  const agregarServicio = () => {
    if (!servicioSeleccionado) return;
    
    let vehiculoAsignadoId = servicioActual.vehiculo_id;

    // MAGIA DE LA MULA: Si es alquiler de mula, buscamos el ID dinámicamente por nombre
    if (tipoCalculo === 'ALQUILER_MULA') {
      const mulaDb = vehiculosDisponibles.find(v => v.nombre.toLowerCase().includes('mula'));
      if (mulaDb) {
        vehiculoAsignadoId = mulaDb.id;
      } else {
        alert("Advertencia: No se encontró ningún vehículo con la palabra 'Mula' en la base de datos.");
      }
    }

    // Buscamos el nombre del vehículo para mostrarlo lindo en el resumen del frontend
    const vehiculoObj = vehiculosDisponibles.find(v => v.id === Number(vehiculoAsignadoId));

    // Payload que guardamos temporalmente en React
    const itemPayload = {
      servicio_id: Number(servicioActual.servicio_id),
      vehiculo_id: Number(vehiculoAsignadoId),
      cantidad_km: servicioActual.cantidad_km ? Number(servicioActual.cantidad_km) : 0,
      cantidad_horas: servicioActual.cantidad_horas ? Number(servicioActual.cantidad_horas) : 0,
      // Metadata solo para la UI:
      nombre_servicio: servicioSeleccionado.nombre,
      nombre_vehiculo: vehiculoObj ? vehiculoObj.nombre : 'Sin vehículo',
      tipo_calculo: tipoCalculo
    };

    setServiciosAgregados([...serviciosAgregados, itemPayload]);
    setServicioActual({ servicio_id: '', vehiculo_id: '', cantidad_km: '', cantidad_horas: '' }); 
  };

  const irAPaso2Calcular = async () => {
    try {
      setIsSubmitting(true);
      // Limpiamos los datos extra de la UI antes de mandarlos a calcular
      const itemsLimpios = serviciosAgregados.map(item => ({
        servicio_id: item.servicio_id,
        vehiculo_id: item.vehiculo_id,
        cantidad_km: item.cantidad_km,
        cantidad_horas: item.cantidad_horas
      }));

      const resultado = await presupuestosService.calcularPreview(itemsLimpios, incluyeIva);
      setTotalesCalculados(resultado);
      setPasoActual(2);
    } catch (error) {
      alert("Error al calcular: " + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const procesarPresupuesto = async (accion) => {
    try {
      setIsSubmitting(true);
      let clienteId = cliente.id;

      if (cliente.esNuevo) {
        const nuevoCliente = await clientesService.crear({
          nombre_razon_social: cliente.nombre_razon_social,
          cuit_dni: cliente.cuit_dni,
          telefono: cliente.telefono,
          es_empresa: false 
        });
        clienteId = nuevoCliente.id;
      }

      // Limpiamos nuevamente para el payload final
      const itemsLimpios = serviciosAgregados.map(item => ({
        servicio_id: item.servicio_id,
        vehiculo_id: item.vehiculo_id,
        cantidad_km: item.cantidad_km,
        cantidad_horas: item.cantidad_horas
      }));

      const payloadPresupuesto = {
        cliente_id: clienteId,
        items: itemsLimpios, 
        incluye_iva: incluyeIva, // Mandamos el valor del checkbox
        validez_dias: 30
      };

      const presupuestoDb = await presupuestosService.crear(payloadPresupuesto);
      setPresupuestoGenerado(presupuestoDb);
      
      if (accion === 'GENERAR_PDF') {
        await presupuestosService.descargarPdf(presupuestoDb.id);
      }

      setPasoActual(4);
    } catch (error) {
      console.error("Error al procesar", error);
      alert("Hubo un error al procesar el presupuesto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPaso1 = () => (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800">¿Qué vas a presupuestar?</h2>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        
        <select value={servicioActual.servicio_id} onChange={handleServicioChange} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">Seleccionar Servicio...</option>
          {serviciosDisponibles.map(srv => (
            <option key={srv.id} value={srv.id}>{srv.nombre}</option>
          ))}
        </select>

        {['FLETE', 'AUXILIO', 'MUDANZA_INTERIOR'].includes(tipoCalculo) && (
          <div className="flex gap-2">
            <input type="number" placeholder="Cant. KM" value={servicioActual.cantidad_km} onChange={(e) => setServicioActual({...servicioActual, cantidad_km: e.target.value})} className="w-1/2 p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"/>
            
            <select value={servicioActual.vehiculo_id} onChange={(e) => setServicioActual({...servicioActual, vehiculo_id: e.target.value})} className="w-1/2 p-3 border border-gray-300 rounded-xl bg-gray-50 text-ellipsis">
              <option value="">Vehículo...</option>
              {vehiculosDisponibles
                .filter(v => !v.nombre.toLowerCase().includes('mula')) // Escondemos la mula acá
                .map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)
              }
            </select>
          </div>
        )}

        {tipoCalculo === 'MUDANZA_LOCAL' && (
          <div className="flex gap-2">
            <input type="number" placeholder="Horas" value={servicioActual.cantidad_horas} onChange={(e) => setServicioActual({...servicioActual, cantidad_horas: e.target.value})} className="w-1/2 p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"/>
            
            <select value={servicioActual.vehiculo_id} onChange={(e) => setServicioActual({...servicioActual, vehiculo_id: e.target.value})} className="w-1/2 p-3 border border-gray-300 rounded-xl bg-gray-50">
              <option value="">Vehículo...</option>
              {vehiculosDisponibles
                .filter(v => !v.nombre.toLowerCase().includes('mula'))
                .map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)
              }
            </select>
          </div>
        )}

        {tipoCalculo === 'ALQUILER_MULA' && (
          <input type="number" placeholder="Cantidad de Horas" value={servicioActual.cantidad_horas} onChange={(e) => setServicioActual({...servicioActual, cantidad_horas: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"/>
        )}

        <button 
          onClick={agregarServicio} 
          disabled={!servicioActual.servicio_id} 
          className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95 disabled:opacity-50 mt-2"
        >
          + Sumar a la cotización
        </button>
      </div>

      {serviciosAgregados.length > 0 && (
        <div className="bg-brand-light/20 border border-brand-light p-4 rounded-2xl flex flex-col gap-4">
          <p className="text-brand-dark font-medium">Tenes {serviciosAgregados.length} servicio(s) cargado(s)</p>
          
          {/* NUEVO: Checkbox de IVA */}
          <label className="flex items-center gap-2 bg-white p-3 rounded-xl border border-brand-light cursor-pointer">
            <input 
              type="checkbox" 
              checked={incluyeIva} 
              onChange={(e) => setIncluyeIva(e.target.checked)} 
              className="w-5 h-5 text-brand rounded focus:ring-brand"
            />
            <span className="text-gray-700 font-medium text-sm">Este presupuesto incluye IVA</span>
          </label>

          <button onClick={irAPaso2Calcular} disabled={isSubmitting} className="bg-brand text-white w-full py-3 rounded-xl font-bold shadow-md active:scale-95">
            {isSubmitting ? 'Calculando...' : 'Calcular ➔'}
          </button>
        </div>
      )}
    </div>
  );

  const renderPaso2 = () => (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800">Resumen de Cotización</h2>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
        
        {serviciosAgregados.map((srv, idx) => (
          <div key={idx} className="flex justify-between border-b pb-2 text-gray-700">
            <div>
              <p className="font-bold text-sm">{srv.nombre_servicio}</p>
              <p className="text-xs text-gray-500">
                {srv.cantidad_km ? `${srv.cantidad_km} km ` : ''}
                {srv.cantidad_horas ? `${srv.cantidad_horas} hs ` : ''}
                | {srv.nombre_vehiculo}
              </p>
            </div>
          </div>
        ))}
        
        <div className="flex justify-between items-center pt-2">
          <p className="text-gray-500">IVA incluido:</p>
          <p className="font-medium text-gray-800">{incluyeIva ? 'Sí' : 'No'}</p>
        </div>

        <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
          <p className="text-xl font-bold text-gray-800">Total Final:</p>
          <p className="text-2xl font-bold text-brand">${totalesCalculados.total_final}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={() => setPasoActual(1)} className="w-1/3 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95">Atrás</button>
        <button onClick={() => setPasoActual(3)} className="w-2/3 py-4 bg-brand text-white font-bold rounded-xl active:scale-95 shadow-md">
          Asignar Cliente ➔
        </button>
      </div>
    </div>
  );

  const renderPaso3 = () => (
    <div className="flex flex-col gap-4 animate-fadeIn">
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
            <input type="text" placeholder="CUIT/DNI (Opcional)" value={cliente.cuit_dni} onChange={(e) => setCliente({...cliente, cuit_dni: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg" />
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
          onClick={() => procesarPresupuesto('GENERAR_PDF')} 
          disabled={(!cliente.esNuevo && !cliente.id) || (cliente.esNuevo && !cliente.nombre_razon_social) || isSubmitting}
          className="w-full py-4 bg-green-500 text-white text-lg font-bold rounded-xl active:scale-95 shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isSubmitting ? 'Procesando...' : 'Guardar y Descargar PDF'}
        </button>
        
        <div className="flex gap-2">
          <button onClick={() => setPasoActual(2)} className="w-1/3 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95">Atrás</button>
          <button 
            onClick={() => procesarPresupuesto('SOLO_GUARDAR')} 
            disabled={(!cliente.esNuevo && !cliente.id) || (cliente.esNuevo && !cliente.nombre_razon_social) || isSubmitting}
            className="w-2/3 py-4 bg-gray-800 text-white font-bold rounded-xl active:scale-95 disabled:opacity-50"
          >
            Solo Guardar Borrador
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaso4 = () => (
    <div className="flex flex-col gap-4 animate-fadeIn text-center mt-4">
      <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">¡Cotización Lista!</h2>
      <p className="text-gray-500 px-4">
        Presupuesto #{presupuestoGenerado?.id} para <b>{cliente.nombre_razon_social}</b> guardado con éxito.
      </p>
      
      <div className="flex flex-col gap-3 mt-6">
        <button onClick={() => navigate('/inicio')} className="w-full py-4 bg-gray-800 text-white text-lg font-bold rounded-xl active:scale-95 shadow-md">
          Volver al Inicio
        </button>
        <button onClick={() => presupuestosService.descargarPdf(presupuestoGenerado.id)} className="w-full py-4 bg-transparent text-brand font-bold mt-2 underline">
          Descargar PDF nuevamente
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/inicio')} className="text-gray-400 font-bold px-2 py-1">X</button>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className={`h-2 w-8 rounded-full ${pasoActual >= step ? 'bg-brand' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>

      {pasoActual === 1 && renderPaso1()}
      {pasoActual === 2 && renderPaso2()}
      {pasoActual === 3 && renderPaso3()}
      {pasoActual === 4 && renderPaso4()}
    </div>
  );
};

export default WizardPresupuesto;