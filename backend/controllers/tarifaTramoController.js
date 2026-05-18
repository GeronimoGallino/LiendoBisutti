const { obtenerTodas, crearTarifa, actualizarTarifa } = require('../services/tarifaTramoService');
const TarifaTramo = require('../models/TarifaTramo');

const isValidNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
};

const getTarifas = async (req, res) => {
  try {
    const tarifas = await obtenerTodas();
    res.status(200).json(tarifas);
  } catch (error) {
    console.error('Error al obtener tarifas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createTarifa = async (req, res) => {
  try {
    const { vehiculo_id, km_desde, km_hasta, precio_por_km } = req.body;

    if (!isValidNumber(precio_por_km)) {
      return res.status(400).json({ error: 'precio_por_km debe ser un número válido mayor o igual a 0' });
    }

    if (!isValidNumber(km_desde)) {
      return res.status(400).json({ error: 'km_desde debe ser un número válido mayor o igual a 0' });
    }

    if (km_hasta !== null && km_hasta !== undefined) {
      if (!isValidNumber(km_hasta) || km_hasta <= km_desde) {
        return res.status(400).json({ error: 'km_hasta debe ser un número válido mayor que km_desde' });
      }
    }

    const tarifa = await crearTarifa({
      vehiculo_id,
      km_desde: Number(km_desde),
      km_hasta: km_hasta !== null && km_hasta !== undefined ? Number(km_hasta) : null,
      precio_por_km: Number(precio_por_km),
    });

    res.status(201).json(tarifa);
  } catch (error) {
    console.error('Error al crear tarifa:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

const updateTarifa = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehiculo_id, km_desde, km_hasta, precio_por_km } = req.body;
    const data = {};

    if (vehiculo_id !== undefined) data.vehiculo_id = vehiculo_id;
    if (km_desde !== undefined) {
      if (!isValidNumber(km_desde)) {
        return res.status(400).json({ error: 'km_desde debe ser un número válido mayor o igual a 0' });
      }
      data.km_desde = Number(km_desde);
    }
    if (km_hasta !== undefined) {
      if (km_hasta !== null) {
        if (!isValidNumber(km_hasta)) {
          return res.status(400).json({ error: 'km_hasta debe ser un número válido mayor que km_desde' });
        }
        // Obtener km_desde actual si no se actualiza
        const kmDesdeActual = data.km_desde !== undefined ? data.km_desde : (await TarifaTramo.findByPk(id)).km_desde;
        if (km_hasta <= kmDesdeActual) {
          return res.status(400).json({ error: 'km_hasta debe ser mayor que km_desde' });
        }
      }
      data.km_hasta = km_hasta !== null ? Number(km_hasta) : null;
    }
    if (precio_por_km !== undefined) {
      if (!isValidNumber(precio_por_km)) {
        return res.status(400).json({ error: 'precio_por_km debe ser un número válido mayor o igual a 0' });
      }
      data.precio_por_km = Number(precio_por_km);
    }

    const tarifa = await actualizarTarifa(id, data);
    res.status(200).json(tarifa);
  } catch (error) {
    console.error('Error al actualizar tarifa:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

module.exports = {
  getTarifas,
  createTarifa,
  updateTarifa,
};