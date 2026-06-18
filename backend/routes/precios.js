const express = require('express');
const { obtenerPrecios, aplicarAumento } = require('../controllers/preciosController');

const router = express.Router();

// GET /api/precios -> Trae todo el listado de vehículos y sus tramos
router.get('/', obtenerPrecios);

// POST /api/precios/aumento-masivo -> Aplica el multiplicador a la base de datos
router.post('/aumento-masivo', aplicarAumento);

module.exports = router;