import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { preciosService } from '../services/precios.service';
import { formatearMoneda } from '../utils/formatters';

const DashboardPrecios = () => {
  const navigate = useNavigate();
  const [catalogo, setCatalogo] = useState([]);
  const [porcentajeMasivo, setPorcentajeMasivo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarPrecios = async () => {
    try {
      setIsLoading(true);
      const datos = await preciosService.obtenerTodos();
      setCatalogo(datos);
    } catch (error) {
      console.error("Error al cargar los precios", error);
      alert("Hubo un problema al cargar el catálogo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPrecios();
  }, []);

  const handleAumentoMasivo = async () => {
    const porcentajeNum = Number(porcentajeMasivo);
    
    if (!porcentajeMasivo || isNaN(porcentajeNum) || porcentajeNum <= 0) {
      alert("Por favor ingresá un porcentaje válido mayor a 0.");
      return;
    }

    const confirmacion = window.confirm(
      `ATENCIÓN: Vas a aumentar un ${porcentajeNum}% a TODOS los vehículos y tramos de kilómetros.\n\n¿Estás completamente seguro de aplicar este cambio a la base de datos?`
    );

    if (confirmacion) {
      try {
        setIsSubmitting(true);
        await preciosService.aplicarAumentoMasivo(porcentajeNum);
        alert(`¡Éxito! El catálogo se actualizó con un aumento del ${porcentajeNum}%.`);
        setPorcentajeMasivo('');
        await cargarPrecios(); // Refrescamos la tabla para mostrar los nuevos valores
      } catch (error) {
        console.error("Error al aplicar aumento", error);
        alert("Ocurrió un error al intentar aplicar el aumento masivo.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Cargando catálogo de precios...</div>;
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-20 animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/inicio')} className="bg-gray-200 p-2 rounded-lg text-gray-700 hover:bg-gray-300 active:scale-95">
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
              maxLength="2"
              value={porcentajeMasivo}
              onChange={(e) => setPorcentajeMasivo(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="Ej: 15"
              className="w-full pl-4 pr-8 py-3 border border-gray-300 rounded-xl bg-gray-50 text-lg font-bold text-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <span className="absolute right-4 top-3 text-lg font-bold text-gray-400 pointer-events-none">%</span>
          </div>
          <button
            onClick={handleAumentoMasivo}
            disabled={isSubmitting || !porcentajeMasivo}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-3 px-4 rounded-xl active:scale-95 transition-all flex justify-center items-center gap-2 shadow-sm"
          >
            {isSubmitting ? 'Actualizando...' : 'Aplicar Aumento'}
          </button>
        </div>
      </div>

      {/* VISUALIZADOR DEL CATÁLOGO ACTUAL */}
      <h3 className="text-lg font-bold text-gray-700 mb-3 ml-1">Precios Actuales</h3>
      
      <div className="flex flex-col gap-4">
        {catalogo.map((vehiculo) => (
          <div key={vehiculo.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Cabecera del Vehículo */}
            <div className="bg-gray-100 p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-800 text-lg">{vehiculo.nombre}</h4>
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <div className="bg-white px-3 py-1 rounded border border-gray-200">
                  <span className="text-gray-500 text-xs block">Bajada Bandera</span>
                  <span className="font-bold text-brand">{formatearMoneda(vehiculo.costo_base_fijo)}</span>
                </div>
                <div className="bg-white px-3 py-1 rounded border border-gray-200">
                  <span className="text-gray-500 text-xs block">Precio Hora</span>
                  <span className="font-bold text-brand">{formatearMoneda(vehiculo.precio_hora)}</span>
                </div>
              </div>
            </div>

            {/* Tabla de Tramos (Si tiene) */}
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
                      <tr key={tramo.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {tramo.km_desde} a {tramo.km_hasta ? tramo.km_hasta : 'Más'} KM
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">
                          {formatearMoneda(tramo.precio_por_km)}
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