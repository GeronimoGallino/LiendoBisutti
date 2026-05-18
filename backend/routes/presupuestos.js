const express = require('express');
const {
  calcularPreview,
  crearPresupuesto,
  obtenerHistorial,
  obtenerPorId,
  cambiarEstado,
} = require('../controllers/presupuestosController');

const router = express.Router();

router.post('/calcular', calcularPreview);
router.post('/', crearPresupuesto);
router.get('/', obtenerHistorial);
router.get('/:id', obtenerPorId);
router.patch('/:id/estado', cambiarEstado);

module.exports = router;
