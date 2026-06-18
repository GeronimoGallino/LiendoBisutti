const sequelize = require('../db');
const CategoriaVehiculo = require('../models/CategoriaVehiculo');
const TarifaTramo = require('../models/TarifaTramo');

// Trae todo el catálogo ordenado para el Dashboard
const obtenerCatalogoCompleto = async () => {
  const vehiculos = await CategoriaVehiculo.findAll({
    include: [
      {
        model: TarifaTramo,
        attributes: ['id', 'km_desde', 'km_hasta', 'precio_por_km'],
      }
    ],
    order: [
      ['id', 'ASC'],
      [TarifaTramo, 'km_desde', 'ASC'] // Ordena los tramos de menor a mayor KM
    ]
  });
  return vehiculos;
};

// La magia transaccional para el aumento masivo
const aplicarAumentoMasivo = async (porcentaje) => {
  // Si envían un 15%, el multiplicador es 1.15
  const multiplicador = 1 + (Number(porcentaje) / 100);

  const transaction = await sequelize.transaction();

  try {
    // 1. Actualizamos todos los Vehículos (Base y Hora)
    await CategoriaVehiculo.update(
      {
        costo_base_fijo: sequelize.literal(`costo_base_fijo * ${multiplicador}`),
        precio_hora: sequelize.literal(`precio_hora * ${multiplicador}`)
      },
      { where: {}, transaction }
    );

    // 2. Actualizamos todos los Tramos (Precio por KM)
    await TarifaTramo.update(
      {
        precio_por_km: sequelize.literal(`precio_por_km * ${multiplicador}`)
      },
      { where: {}, transaction }
    );

    // 3. Confirmamos los cambios en PostgreSQL
    await transaction.commit();
    return true;

  } catch (error) {
    // Si algo falla, revertimos la base de datos a su estado original
    await transaction.rollback();
    throw error;
  }
};

const actualizarPrecioVehiculo = async (id, costo_base_fijo, precio_hora) => {
  const vehiculo = await CategoriaVehiculo.findByPk(id);
  if (!vehiculo) throw new Error('Vehículo no encontrado');
  await vehiculo.update({ costo_base_fijo, precio_hora });
  return vehiculo;
};

const actualizarPrecioTramo = async (id, precio_por_km) => {
  const tramo = await TarifaTramo.findByPk(id);
  if (!tramo) throw new Error('Tramo no encontrado');
  await tramo.update({ precio_por_km });
  return tramo;
};

module.exports = {
  obtenerCatalogoCompleto,
  aplicarAumentoMasivo,
  actualizarPrecioVehiculo,
  actualizarPrecioTramo
};