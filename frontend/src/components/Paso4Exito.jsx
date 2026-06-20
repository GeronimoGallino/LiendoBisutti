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
          title: `Presupuesto #${presupuestoGenerado.id} - Liendo Bissutti`
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
        <button 
          onClick={manejarCompartir} 
          disabled={cargandoPdf}
          className={`w-full py-4 border-2 font-bold rounded-xl active:scale-95 shadow-sm transition-all flex items-center justify-center gap-2 mt-2 ${
            cargandoPdf 
              ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'border-brand text-brand hover:bg-brand/10'
          }`}
        >
          {/* Icono nativo de compartir */}
          {!cargandoPdf && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368l5.662 3.397m-5.662-3.397l5.662-3.397m0 0a3 3 0 105.368-5.368 3 3 0 00-5.368 5.368zm0 10.736a3 3 0 105.368-5.368 3 3 0 00-5.368 5.368z"></path>
            </svg>
          )}
          
          {cargandoPdf ? 'Generando PDF...' : 'Compartir PDF'}
        </button>


        <button onClick={onVolver} className="w-full py-4 bg-gray-800 text-white text-lg font-bold rounded-xl active:scale-95 shadow-md">
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default Paso4Exito;