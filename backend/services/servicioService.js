//services/servicioService.js

const Servicio  = require('../models/Servicio');

const obtenerTodos = async () => {
  return await Servicio.findAll({
    order: [['nombre', 'ASC']],
  });
};

const crearServicio = async (data) => {
  return await Servicio.create(data);
};

const actualizarServicio = async (id, data) => {
  const servicio = await Servicio.findByPk(id);
  if (!servicio) {
    const error = new Error('Servicio no encontrado');
    error.status = 404;
    throw error;
  }
  return await servicio.update(data);
};

module.exports = {
  obtenerTodos,
  crearServicio,
  actualizarServicio,
};
