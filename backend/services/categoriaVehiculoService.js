const CategoriaVehiculo = require('../models/CategoriaVehiculo');
const TarifaTramo = require('../models/TarifaTramo');

const obtenerTodas = async () => {
  return await CategoriaVehiculo.findAll({
    order: [['nombre', 'ASC']],
  });
};

const obtenerConTramos = async () => {
  return await CategoriaVehiculo.findAll({
    include: [{ model: TarifaTramo }],
    order: [['nombre', 'ASC']],
  });
};

const crearCategoria = async (data) => {
  return await CategoriaVehiculo.create(data);
};

const actualizarCategoria = async (id, data) => {
  const categoria = await CategoriaVehiculo.findByPk(id);
  if (!categoria) {
    const error = new Error('Categoría de vehículo no encontrada');
    error.status = 404;
    throw error;
  }

  return await categoria.update(data);
};

module.exports = {
  obtenerTodas,
  obtenerConTramos,
  crearCategoria,
  actualizarCategoria,
};
