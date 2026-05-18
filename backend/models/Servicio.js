//models/Servicio.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const { DateTime } = require('luxon');

const Servicio = sequelize.define('Servicio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  tipo_calculo: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'servicios',
  timestamps: true
});

module.exports = Servicio;