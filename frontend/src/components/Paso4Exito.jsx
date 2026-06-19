import React, { useState, useEffect } from 'react';
import { presupuestosService } from '../services/presupuestos.service';

const Paso4Exito = ({ presupuestoGenerado, cliente, onVolver }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [cargandoPdf, setCargandoPdf] = useState(true);

  // PRE-CARGA FANTASMA: Se ejecuta en cuanto se renderiza este componente
  useEffect(() => {
    const preCargarPdf = async () => {
      if (!presupuestoGenerado?.id) return;
      try {
        const file = await presupuestosService.obtenerPdfBlob(presupuestoGenerado.id);
        setPdfFile(file);
      } catch (error) {
        console.error("Error al precargar el PDF", error);
      } finally {
        setCargandoPdf(false);
      }
    };

    preCargarPdf();
  }, [presupuestoGenerado]);

  // LA ACCIÓN INSTANTÁNEA
  const manejarCompartir = async () => {
    if (!pdfFile) return;

    try {
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: `Presupuesto #${presupuestoGenerado.id} - Liendo Bissutti`,
          text: 'Te comparto el presupuesto de los servicios.',
        });
      } else {
        // Fallback para PC: Forzamos descarga si no hay menú nativo
        const url = window.URL.createObjectURL(pdfFile);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', pdfFile.name);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error al compartir:', error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn text-center mt-4">
      <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">¡Cotización Lista!</h2>
      <p className="text-gray-500 px-4">
        Presupuesto #{presupuestoGenerado?.id} para <b>{cliente.nombre_razon_social}</b> guardado con éxito.
      </p>
      
      <div className="p-4 flex flex-col gap-4 min-h-screen max-w-2xl mx-auto w-full">
        <button onClick={onVolver} className="w-full py-4 bg-gray-800 text-white text-lg font-bold rounded-xl active:scale-95 shadow-md">
          Volver al Inicio
        </button>
        
        <button 
          onClick={manejarCompartir} 
          disabled={cargandoPdf}
          className={`w-full py-4 bg-transparent font-bold mt-2 underline transition-opacity ${cargandoPdf ? 'text-gray-400 cursor-not-allowed' : 'text-brand'}`}
        >
          {cargandoPdf ? 'Generando PDF...' : 'Compartir PDF'}
        </button>
      </div>
    </div>
  );
};

export default Paso4Exito;