import api from './api';

export const presupuestosService = {
  calcularPreview: async (items, incluye_iva = false) => {
    const { data } = await api.post('/presupuestos/calcular', { items, incluye_iva });
    return data;
  },
  
  crear: async (payload) => {
    const { data } = await api.post('/presupuestos', payload);
    return data; 
  },

  // Cambiamos el nombre para que sea más semántico
  compartirODescargarPdf: async (id) => {
    try {
      // 1. Traemos el binario (Blob) desde el backend
      const response = await api.get(`/presupuestos/${id}/pdf`, { responseType: 'blob' });
      
      const nombreArchivo = `Presupuesto_LiendoBissutti_${id}.pdf`;
      
      // 2. Convertimos el Blob a File (requerido por Web Share API)
      const file = new File([response.data], nombreArchivo, { type: 'application/pdf' });
     //alert(`HTTPS: ${window.isSecureContext} | Soporta Share: ${!!navigator.share}`);
      // 3. Evaluamos si el navegador soporta compartir archivos nativamente
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        
        // --- CASO A: CELULAR / NAVEGADOR MODERNO ---
        await navigator.share({
          files: [file],
          title: `Presupuesto #${id} - Liendo Bissutti`,
          text: 'Te comparto el presupuesto de los servicios.',
        });
        console.log('PDF compartido con éxito');
        
      } else {
        
        // --- CASO B: PLAN B (FALLBACK PARA PC) ---
        console.log('Web Share API no soportada, forzando descarga...');
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', nombreArchivo);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        // Liberamos memoria
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    } catch (error) {
      // Si el usuario cancela la acción de compartir, el navegador tira un error que podemos ignorar
      if (error.name !== 'AbortError') {
        console.error('Error al intentar compartir/descargar el PDF:', error);
        throw error;
      }
    }
  }
};