const {  calcularTotales,  generarNuevo,  listarTodos,  buscarUno,  actualizarEstado,} = require('../services/presupuestoService');

const calcularPreview = async (req, res) => {
  try {
    const { items, incluye_iva } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items debe ser un array no vacío' });
    }

    if (incluye_iva === undefined || typeof incluye_iva !== 'boolean') {
      return res.status(400).json({ error: 'incluye_iva debe ser un booleano' });
    }

    const resultado = await calcularTotales(items, incluye_iva);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al calcular preview:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

const crearPresupuesto = async (req, res) => {
  try {
    const { cliente_id, items, incluye_iva, validez_dias } = req.body;

    if (!cliente_id) {
      return res.status(400).json({ error: 'cliente_id es obligatorio' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items debe ser un array no vacío' });
    }

    if (incluye_iva === undefined || typeof incluye_iva !== 'boolean') {
      return res.status(400).json({ error: 'incluye_iva debe ser un booleano' });
    }

    const presupuesto = await generarNuevo(cliente_id, items, incluye_iva, validez_dias);
    res.status(201).json(presupuesto);
  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

const obtenerHistorial = async (req, res) => {
  try {
    const filtros = req.query;
    const presupuestos = await listarTodos(filtros);
    res.status(200).json(presupuestos);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = await buscarUno(id);
    res.status(200).json(presupuesto);
  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'estado es obligatorio' });
    }

    const presupuesto = await actualizarEstado(id, estado);
    res.status(200).json(presupuesto);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

module.exports = {
  calcularPreview,
  crearPresupuesto,
  obtenerHistorial,
  obtenerPorId,
  cambiarEstado,
};
