import api from './api';

export const presupuestosService = {
  calcularPreview: async (items, incluye_iva = false) => {
    const { data } = await api.post('/presupuestos/calcular', { items, incluye_iva });
    return data;
  },
  
  crear: async (payload) => {
    const { data } = await api.post('/presupuestos', payload);
    return data; // Devuelve el presupuesto con su ID
  },

  descargarPdf: async (id) => {
    // CLAVE: responseType 'blob' para que Axios entienda que recibe un archivo binario
    const response = await api.get(`/presupuestos/${id}/pdf`, { responseType: 'blob' });
    
    // Lógica mágica para descargar el PDF en el navegador
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Presupuesto_LiendoBissutti_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  }
};