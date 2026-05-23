// backend/routes/clientes.js

const express = require('express');
const { createCliente, updateCliente, getAllClientes } = require('../controllers/clienteController');

const router = express.Router();


// Crear un nuevo cliente
router.post('/', createCliente);

// Actualizar un cliente existente
router.put('/:id', updateCliente);

// Obtener todos los clientes
router.get('/', getAllClientes);

module.exports = router;