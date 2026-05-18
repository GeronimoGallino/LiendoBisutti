const {
  obtenerTodas,
  obtenerConTramos,
  crearCategoria,
  actualizarCategoria,
} = require('../services/categoriaVehiculoService');

const isValidNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
};

const getCategorias = async (req, res) => {
  try {
    const categorias = await obtenerTodas();
    res.status(200).json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCategoriasConTramos = async (req, res) => {
  try {
    const categorias = await obtenerConTramos();
    res.status(200).json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías con tramos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createCategoria = async (req, res) => {
  try {
    const { nombre, costo_base_fijo, precio_hora } = req.body;

    if (!isValidNumber(costo_base_fijo) || !isValidNumber(precio_hora)) {
      return res.status(400).json({ error: 'costo_base_fijo y precio_hora deben ser números válidos mayores o iguales a 0' });
    }

    const categoria = await crearCategoria({
      nombre,
      costo_base_fijo: Number(costo_base_fijo),
      precio_hora: Number(precio_hora),
    });

    res.status(201).json(categoria);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, costo_base_fijo, precio_hora } = req.body;
    const data = {};

    if (nombre !== undefined) data.nombre = nombre;
    if (costo_base_fijo !== undefined) {
      if (!isValidNumber(costo_base_fijo)) {
        return res.status(400).json({ error: 'costo_base_fijo debe ser un número válido mayor o igual a 0' });
      }
      data.costo_base_fijo = Number(costo_base_fijo);
    }
    if (precio_hora !== undefined) {
      if (!isValidNumber(precio_hora)) {
        return res.status(400).json({ error: 'precio_hora debe ser un número válido mayor o igual a 0' });
      }
      data.precio_hora = Number(precio_hora);
    }

    const categoria = await actualizarCategoria(id, data);
    res.status(200).json(categoria);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

module.exports = {
  getCategorias,
  getCategoriasConTramos,
  createCategoria,
  updateCategoria,
};
