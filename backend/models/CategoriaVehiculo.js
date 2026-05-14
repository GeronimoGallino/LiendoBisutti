const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const { DateTime } = require('luxon');

const CategoriaVehiculo = sequelize.define('CategoriaVehiculo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  costo_base_fijo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  precio_hora: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
}, {
  tableName: 'categorias_vehiculos',
  timestamps: true
});

module.exports = CategoriaVehiculo;