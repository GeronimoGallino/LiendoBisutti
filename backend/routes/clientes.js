const express = require('express');
const { createCliente, updateCliente } = require('../controllers/clienteController');

const router = express.Router();


// Crear un nuevo cliente
router.post('/', createCliente);

// Actualizar un cliente existente
router.put('/:id', updateCliente);

module.exports = router;