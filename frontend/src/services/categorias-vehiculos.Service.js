import api from './api';

export const vehiculosService = {
  obtenerTodos: async () => {
    // Ajustá esta ruta al endpoint real que devuelva tus CategoriaVehiculo
    const { data } = await api.get('/categorias-vehiculos'); 
    return data;
  }
};