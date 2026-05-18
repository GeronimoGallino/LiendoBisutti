const express = require('express');
const { getTarifas, createTarifa, updateTarifa } = require('../controllers/tarifaTramoController');

const router = express.Router();

router.get('/', getTarifas);
router.post('/', createTarifa);
router.put('/:id', updateTarifa);

module.exports = router;