const { Op } = require('sequelize');
const Cliente = require('../models/Cliente');

const crearCliente = async (data) => {
  const { cuit_dni } = data;

  if (cuit_dni !== null && cuit_dni !== undefined && cuit_dni.toString().trim() !== '') {
    const existente = await Cliente.findOne({ where: { cuit_dni } });
    if (existente) {
      const error = new Error('El CUIT/DNI ya está registrado');
      error.status = 400;
      throw error;
    }
  }

  return await Cliente.create(data);
};

const actualizarCliente = async (id, data) => {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) {
    const error = new Error('Cliente no encontrado');
    error.status = 404;
    throw error;
  }

  const { cuit_dni } = data;
  if (cuit_dni !== null && cuit_dni !== undefined && cuit_dni.toString().trim() !== '') {
    const duplicado = await Cliente.findOne({
      where: {
        cuit_dni,
        id: { [Op.ne]: cliente.id },
      },
    });

    if (duplicado) {
      const error = new Error('El CUIT/DNI ya está registrado en otro cliente');
      error.status = 400;
      throw error;
    }
  }

  return await cliente.update(data);
};

const obtenerClientes = async () => {
  return await Cliente.findAll({ order: [['nombre_razon_social', 'ASC']] });
};

module.exports = {
  crearCliente,
  actualizarCliente,
  obtenerClientes,
};
