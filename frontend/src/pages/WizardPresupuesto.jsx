import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // <-- IMPORTAMOS useLocation
import { serviciosService } from '../services/servicios.service';
import { clientesService } from '../services/clientes.service';
import { presupuestosService } from '../services/presupuestos.service';
import { vehiculosService } from '../services/categorias-vehiculos.service';

import Paso1Servicios from '../components/Paso1Servicios';
import Paso2Resumen from '../components/Paso2Resumen';
import Paso3Cliente from '../components/Paso3Cliente';
import Paso4Exito from '../components/Paso4Exito';

const WizardPresupuesto = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <-- INSTANCIAMOS useLocation
  const esComprobante = location.state?.esComprobante || false; // <-- CAPTURAMOS EL FLAG
  
  const [catalogos, setCatalogos] = useState({ servicios: [], clientes: [], vehiculos: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);
  const [serviciosAgregados, setServiciosAgregados] = useState([]);
  const [totalesCalculados, setTotalesCalculados] = useState({}); 
  const [presupuestoGenerado, setPresupuestoGenerado] = useState(null);
  const [incluyeIva, setIncluyeIva] = useState(false);
  
  const [servicioActual, setServicioActual] = useState({
    servicio_id: '', vehiculo_id: '', cantidad_km: '', cantidad_horas: '', costo_base_fijo_manual: '', precio_hora_manual: '', porcentaje_descuento: ''
  });
  
  const [cliente, setCliente] = useState({ esNuevo: true, id: null, nombre_razon_social: '', telefono: '', cuit_dni: '' });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [servicios, clientes, vehiculos] = await Promise.all([
          serviciosService.obtenerTodos(),
          clientesService.obtenerTodos(),
          vehiculosService.obtenerTodos()
        ]);
        setCatalogos({ servicios, clientes, vehiculos });
      } catch (error) {
        console.error("Error cargando catálogos", error);
      }
    };
    cargarDatos();
  }, []);

  const agregarServicio = (tipoCalculo, servicioSeleccionado) => {
    let vehiculoAsignadoId = servicioActual.vehiculo_id;

    if (tipoCalculo === 'ALQUILER_MULA') {
      const mulaDb = catalogos.vehiculos.find(v => v.nombre.toLowerCase().includes('mula'));
      if (mulaDb) vehiculoAsignadoId = mulaDb.id;
    }

    const vehiculoObj = catalogos.vehiculos.find(v => v.id === Number(vehiculoAsignadoId));

    const itemPayload = {
      servicio_id: Number(servicioActual.servicio_id),
      vehiculo_id: Number(vehiculoAsignadoId),
      cantidad_km: servicioActual.cantidad_km ? Number(servicioActual.cantidad_km) : 0,
      cantidad_horas: servicioActual.cantidad_horas ? Number(servicioActual.cantidad_horas) : 0,
      costo_base_fijo_manual: servicioActual.costo_base_fijo_manual !== '' ? Number(servicioActual.costo_base_fijo_manual) : null,
      precio_hora_manual: servicioActual.precio_hora_manual !== '' ? Number(servicioActual.precio_hora_manual) : null,
      porcentaje_descuento: servicioActual.porcentaje_descuento !== '' ? Number(servicioActual.porcentaje_descuento) : 0,
      nombre_servicio: servicioSeleccionado.nombre,
      nombre_vehiculo: vehiculoObj ? vehiculoObj.nombre : 'Sin vehículo',
      tipo_calculo: tipoCalculo
    };

    setServiciosAgregados([...serviciosAgregados, itemPayload]);
    setServicioActual({ servicio_id: '', vehiculo_id: '', cantidad_km: '', cantidad_horas: '', costo_base_fijo_manual: '', precio_hora_manual: '', porcentaje_descuento: '' }); 
  };

  const eliminarServicio = (indexToRemove) => {
    setServiciosAgregados(serviciosAgregados.filter((_, index) => index !== indexToRemove));
  };

  const calcularTotales = async () => {
    try {
      setIsSubmitting(true);
      const itemsLimpios = serviciosAgregados.map(({ servicio_id, vehiculo_id, cantidad_km, cantidad_horas, costo_base_fijo_manual, precio_hora_manual, porcentaje_descuento }) => ({
        servicio_id, vehiculo_id, cantidad_km, cantidad_horas, costo_base_fijo_manual, precio_hora_manual, porcentaje_descuento
      }));

      const resultado = await presupuestosService.calcularPreview(itemsLimpios, incluyeIva);
      setTotalesCalculados(resultado);
      setPasoActual(2);
    } catch (error) {
      alert("Error al calcular: " + error.message);
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
          nombre_razon_social: cliente.nombre_razon_social, cuit_dni: cliente.cuit_dni, telefono: cliente.telefono, es_empresa: false 
        });
        clienteId = nuevoCliente.id;
      }

      const itemsLimpios = serviciosAgregados.map(({ servicio_id, vehiculo_id, cantidad_km, cantidad_horas, costo_base_fijo_manual, precio_hora_manual, porcentaje_descuento }) => ({
        servicio_id, vehiculo_id, cantidad_km, cantidad_horas, costo_base_fijo_manual, precio_hora_manual, porcentaje_descuento
      }));

      const presupuestoDb = await presupuestosService.crear({
        cliente_id: clienteId, 
        items: itemsLimpios, 
        incluye_iva: incluyeIva, 
        validez_dias: 30,
        es_comprobante: esComprobante // <-- ENVIAMOS EL FLAG AL BACKEND
      });
      
      setPresupuestoGenerado(presupuestoDb);
      if (accion === 'GENERAR_PDF') await presupuestosService.compartirODescargarPdf(presupuestoDb.id);
      
      setPasoActual(4);
    } catch (error) {
      alert("Hubo un error al procesar el presupuesto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        
        {/* Botón de volver actualizado */}
        <button 
          onClick={() => navigate('/')} 
          className="bg-gray-200 p-2 rounded-lg text-gray-700 hover:bg-gray-300 active:scale-95 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Indicador de pasos */}
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step} 
              className={`h-2 w-8 rounded-full ${pasoActual >= step ? 'bg-brand' : 'bg-gray-300'}`} 
            />
          ))}
        </div>
        
      </div>

      {pasoActual === 1 && (
        <Paso1Servicios
          catalogos={catalogos}
          servicioActual={servicioActual}
          setServicioActual={setServicioActual}
          serviciosAgregados={serviciosAgregados}
          setServiciosAgregados={setServiciosAgregados}
          agregarServicio={agregarServicio}
          eliminarServicio={eliminarServicio}
          incluyeIva={incluyeIva}
          setIncluyeIva={setIncluyeIva}
          isSubmitting={isSubmitting}
          onCalcular={calcularTotales}
        />
      )}
      
      {pasoActual === 2 && (
        <Paso2Resumen 
          totalesCalculados={totalesCalculados} 
          incluyeIva={incluyeIva}
          onAtras={() => setPasoActual(1)}
          onSiguiente={() => setPasoActual(3)}
        />
      )}

      {pasoActual === 3 && (
        <Paso3Cliente 
          cliente={cliente}
          setCliente={setCliente}
          clientesDisponibles={catalogos.clientes}
          isSubmitting={isSubmitting}
          onAtras={() => setPasoActual(2)}
          onProcesar={procesarPresupuesto}
        />
      )}

      {pasoActual === 4 && (
        <Paso4Exito 
          presupuestoGenerado={presupuestoGenerado}
          cliente={cliente}
          onVolver={() => navigate('/')}
          onCompartir={() => presupuestosService.compartirODescargarPdf(presupuestoGenerado.id)}
        />
      )}
    </div>
  );
};

export default WizardPresupuesto;