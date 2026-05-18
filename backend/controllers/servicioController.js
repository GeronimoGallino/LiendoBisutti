// controllers/servicioController.js

const { obtenerTodos, crearServicio, actualizarServicio } = require('../services/servicioService');

// Las estrategias válidas ahora se validan sobre tu campo original 'tipo_calculo'
const VALID_ESTRATEGIAS = [
  'FLETE', 
  'AUXILIO', 
  'MUDANZA_LOCAL', 
  'MUDANZA_INTERIOR', 
  'ALQUILER_MULA'
];

const getAllServicios = async (req, res) => {
  try {
    const servicios = await obtenerTodos();
    res.status(200).json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createServicio = async (req, res) => {
  try {
    const { nombre, tipo_calculo } = req.body; 

    if (!nombre || nombre.toString().trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    // Validamos que el tipo_calculo que intentás guardar exista en el Factory
    if (!VALID_ESTRATEGIAS.includes(tipo_calculo)) {
      return res.status(400).json({ 
        error: `tipo_calculo inválido. Debe ser uno de: ${VALID_ESTRATEGIAS.join(', ')}` 
      });
    }

    const servicio = await crearServicio({ nombre, tipo_calculo });
    res.status(201).json(servicio);
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo_calculo } = req.body;

    if (tipo_calculo !== undefined && !VALID_ESTRATEGIAS.includes(tipo_calculo)) {
      return res.status(400).json({ 
        error: `tipo_calculo inválido. Debe ser uno de: ${VALID_ESTRATEGIAS.join(', ')}` 
      });
    }

    const data = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (tipo_calculo !== undefined) data.tipo_calculo = tipo_calculo;

    const servicio = await actualizarServicio(id, data);
    res.status(200).json(servicio);
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllServicios,
  createServicio,
  updateServicio,
};