import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { preciosService } from '../services/precios.service';
import { formatearMoneda } from '../utils/formatters';
import ModalConfirmacion from './ModalConfirmacion';

const DashboardPrecios = () => {
  const navigate = useNavigate();
  const [catalogo, setCatalogo] = useState([]);
  const [porcentajeMasivo, setPorcentajeMasivo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para Modal Nativo
  const [modalConfig, setModalConfig] = useState({ isOpen: false, titulo: '', mensaje: '', onConfirm: null, tipo: 'warning' });

  // Estados para Edición Individual Inline
  const [editandoVehiculo, setEditandoVehiculo] = useState({ id: null, base: '', hora: '' });
  const [editandoTramo, setEditandoTramo] = useState({ id: null, precio_km: '' });

  const cargarPrecios = async () => {
    try {
      setIsLoading(true);
      const datos = await preciosService.obtenerTodos();
      setCatalogo(datos);
    } catch (error) {
      console.error("Error al cargar los precios", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPrecios();
  }, []);

  // --- LÓGICA AUMENTO MASIVO ---
  const dispararAumentoMasivo = () => {
    const porcentajeNum = Number(porcentajeMasivo);
    if (!porcentajeMasivo || isNaN(porcentajeNum) || porcentajeNum <= 0) {
      alert("Ingresá un porcentaje válido mayor a 0.");
      return;
    }

    setModalConfig({
      isOpen: true,
      titulo: 'Aumento General de Tarifas',
      mensaje: `Estás a punto de aplicar un aumento del ${porcentajeNum}% a TODOS los vehículos y kilómetros.\n\nEsta acción modificará la base de datos de forma permanente.`,
      tipo: 'warning',
      onConfirm: async () => {
        setModalConfig({ ...modalConfig, isOpen: false });
        try {
          setIsSubmitting(true);
          const response = await preciosService.aplicarAumentoMasivo(porcentajeNum);
          setCatalogo(response.datos); // El backend ya devuelve el array actualizado
          setPorcentajeMasivo('');
        } catch (error) {
          alert("Ocurrió un error al intentar aplicar el aumento masivo.");
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  // --- LÓGICA EDICIÓN INDIVIDUAL ---
  const guardarEdicionVehiculo = async (id) => {
    try {
      const payload = { costo_base_fijo: Number(editandoVehiculo.base), precio_hora: Number(editandoVehiculo.hora) };
      const response = await preciosService.actualizarVehiculo(id, payload);
      setCatalogo(response.datos);
      setEditandoVehiculo({ id: null, base: '', hora: '' });
    } catch (error) {
      alert("Error al guardar el vehículo.");
    }
  };

  const guardarEdicionTramo = async (id) => {
    try {
      const payload = { precio_por_km: Number(editandoTramo.precio_km) };
      const response = await preciosService.actualizarTramo(id, payload);
      setCatalogo(response.datos);
      setEditandoTramo({ id: null, precio_km: '' });
    } catch (error) {
      alert("Error al guardar el tramo.");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 font-bold">Cargando catálogo...</div>;

  return (
    <div className="p-4 flex flex-col gap-4 min-h-screen max-w-2xl mx-auto w-full">
      
      {/* MODAL NATIVO */}
      <ModalConfirmacion 
        isOpen={modalConfig.isOpen}
        titulo={modalConfig.titulo}
        mensaje={modalConfig.mensaje}
        tipo={modalConfig.tipo}
        onConfirm={modalConfig.onConfirm}
        onCancelar={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="bg-gray-200 p-2 rounded-lg text-gray-700 hover:bg-gray-300 active:scale-95">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tarifario</h1>
          <p className="text-sm text-gray-500">Gestión de costos y precios base</p>
        </div>
      </div>

      {/* TARJETA DE AUMENTO MASIVO */}
      <div className="bg-white border-l-4 border-amber-500 shadow-md rounded-2xl p-5 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Aumento Global</h2>
        <p className="text-sm text-gray-500 mb-4">Aplica un porcentaje de incremento a toda la base de datos de forma instantánea.</p>
        
        <div className="flex gap-3 items-center">
          <div className="relative w-32">
            <input
              type="tel"
              inputMode="decimal"
              value={porcentajeMasivo}
              onChange={(e) => setPorcentajeMasivo(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="Ej: 15"
              className="w-full pl-4 pr-8 py-3 border border-gray-300 rounded-xl bg-gray-50 text-lg font-bold text-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <span className="absolute right-4 top-3 text-lg font-bold text-gray-400 pointer-events-none">%</span>
          </div>
          <button
            onClick={dispararAumentoMasivo}
            disabled={isSubmitting || !porcentajeMasivo}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-3 px-4 rounded-xl active:scale-95 transition-all shadow-sm"
          >
            {isSubmitting ? 'Actualizando...' : 'Aplicar Aumento'}
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-700 mb-3 ml-1">Edición Individual</h3>
      
      <div className="flex flex-col gap-4">
        {catalogo.map((vehiculo) => (
          <div key={vehiculo.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Cabecera del Vehículo */}
            <div className="bg-gray-100 p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-800 text-lg">{vehiculo.nombre}</h4>
                
                {/* Botonera de Edición de Vehículo */}
                {editandoVehiculo.id === vehiculo.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => setEditandoVehiculo({id: null, base: '', hora: ''})} className="text-xs text-gray-500 font-bold px-2 py-1 bg-white border rounded">Cancelar</button>
                    <button onClick={() => guardarEdicionVehiculo(vehiculo.id)} className="text-xs text-white bg-green-600 font-bold px-3 py-1 rounded shadow-sm">Guardar</button>
                  </div>
                ) : (
                  <button onClick={() => setEditandoVehiculo({ id: vehiculo.id, base: vehiculo.costo_base_fijo, hora: vehiculo.precio_hora })} className="text-brand hover:text-blue-700 bg-white p-1.5 rounded shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}
              </div>

              {/* Mostrar u Editar Precios del Vehículo */}
              <div className="flex gap-4 mt-2 text-sm">
                <div className="bg-white px-3 py-1.5 rounded border border-gray-200 flex-1">
                  <span className="text-gray-500 text-xs block mb-1">Costo Fijo Base</span>
                  {editandoVehiculo.id === vehiculo.id ? (
                    <input type="tel" value={editandoVehiculo.base} onChange={(e) => setEditandoVehiculo({...editandoVehiculo, base: e.target.value})} className="w-full border-b-2 border-brand focus:outline-none font-bold text-gray-800" />
                  ) : (
                    <span className="font-bold text-gray-800">{formatearMoneda(vehiculo.costo_base_fijo)}</span>
                  )}
                </div>
                <div className="bg-white px-3 py-1.5 rounded border border-gray-200 flex-1">
                  <span className="text-gray-500 text-xs block mb-1">Precio Hora</span>
                  {editandoVehiculo.id === vehiculo.id ? (
                    <input type="tel" value={editandoVehiculo.hora} onChange={(e) => setEditandoVehiculo({...editandoVehiculo, hora: e.target.value})} className="w-full border-b-2 border-brand focus:outline-none font-bold text-gray-800" />
                  ) : (
                    <span className="font-bold text-gray-800">{formatearMoneda(vehiculo.precio_hora)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de Tramos */}
            {vehiculo.TarifaTramos && vehiculo.TarifaTramos.length > 0 && (
              <div className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                    <tr>
                      <th className="px-4 py-2">Tramo (KM)</th>
                      <th className="px-4 py-2 text-right">Precio x KM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehiculo.TarifaTramos.map(tramo => (
                      <tr key={tramo.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 group">
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {tramo.km_desde} a {tramo.km_hasta ? tramo.km_hasta : 'Más'} KM
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editandoTramo.id === tramo.id ? (
                            <div className="flex justify-end items-center gap-2">
                              <input type="tel" value={editandoTramo.precio_km} onChange={(e) => setEditandoTramo({...editandoTramo, precio_km: e.target.value})} className="w-20 border-b-2 border-brand text-right focus:outline-none font-bold" />
                              <button onClick={() => guardarEdicionTramo(tramo.id)} className="text-green-600 font-bold p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></button>
                              <button onClick={() => setEditandoTramo({id: null, precio_km: ''})} className="text-gray-400 p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                          ) : (
                            <div className="flex justify-end items-center gap-3">
                              <span className="font-bold text-gray-800">{formatearMoneda(tramo.precio_por_km)}</span>
                              <button onClick={() => setEditandoTramo({ id: tramo.id, precio_km: tramo.precio_por_km })} className="text-gray-400 hover:text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPrecios;