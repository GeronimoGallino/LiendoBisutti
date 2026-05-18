//routes/servicios.js

const express = require('express');
const { getAllServicios, createServicio, updateServicio } = require('../controllers/servicioController');

const router = express.Router();

router.get('/', getAllServicios);
router.post('/', createServicio);
router.put('/:id', updateServicio);

module.exports = router;
