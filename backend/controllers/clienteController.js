// backend/controllers/clienteController.js

const { crearCliente, actualizarCliente, obtenerClientes } = require('../services/clienteService');

const createCliente = async (req, res) => {
  try {
    const { nombre_razon_social, cuit_dni, telefono, direccion, es_empresa } = req.body;
    const cliente = await crearCliente({ nombre_razon_social, cuit_dni, telefono, direccion, es_empresa });
    res.status(201).json(cliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const cliente = await actualizarCliente(id, data);
    res.status(200).json(cliente);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

const getAllClientes = async (req, res) => {
  try {
    const clientes = await obtenerClientes();
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

module.exports = {
  createCliente,
  updateCliente,
  getAllClientes,
};

