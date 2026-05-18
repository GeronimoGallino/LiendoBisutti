const TarifaTramo = require('../models/TarifaTramo');
const CategoriaVehiculo = require('../models/CategoriaVehiculo');

const obtenerTodas = async () => {
  return await TarifaTramo.findAll({
    include: [{ model: CategoriaVehiculo }],
    order: [['km_desde', 'ASC']],
  });
};

const crearTarifa = async (data) => {
  return await TarifaTramo.create(data);
};

const actualizarTarifa = async (id, data) => {
  const tarifa = await TarifaTramo.findByPk(id);
  if (!tarifa) {
    const error = new Error('Tarifa de tramo no encontrada');
    error.status = 404;
    throw error;
  }

  return await tarifa.update(data);
};

module.exports = {
  obtenerTodas,
  crearTarifa,
  actualizarTarifa,
};