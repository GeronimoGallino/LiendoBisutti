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

  // NUEVA FUNCIÓN: Solo obtiene el binario para dejarlo en memoria, no bloquea la UI intentando abrir menú
  obtenerPdfBlob: async (id) => {
    try {
      const response = await api.get(`/presupuestos/${id}/pdf`, { responseType: 'blob' });
      const nombreArchivo = `Presupuesto_LiendoBissutti_${id}.pdf`;
      return new File([response.data], nombreArchivo, { type: 'application/pdf' });
    } catch (error) {
      console.error('Error al descargar el binario del PDF:', error);
      throw error;
    }
  }
};