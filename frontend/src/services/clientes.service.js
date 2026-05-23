import api from './api';

export const clientesService = {
  crear: async (clienteData) => {
    const { data } = await api.post('/clientes', clienteData);
    return data; // Devuelve el cliente con su ID generado
  },
  obtenerTodos: async () => {
    const { data } = await api.get('/clientes');
    return data;
  }
};