const express = require('express');
const {
  getCategorias,
  getCategoriasConTramos,
  createCategoria,
  updateCategoria,
} = require('../controllers/categoriaVehiculoController');

const router = express.Router();

router.get('/', getCategorias);
router.get('/con-tramos', getCategoriasConTramos);
router.post('/', createCategoria);
router.put('/:id', updateCategoria);

module.exports = router;
