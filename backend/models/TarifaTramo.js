const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const CategoriaVehiculo = require('./CategoriaVehiculo');
const { DateTime } = require('luxon');

const TarifaTramo = sequelize.define('TarifaTramo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehiculo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CategoriaVehiculo,
      key: 'id'
    }
  },
  km_desde: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  km_hasta: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  precio_por_km: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'tarifas_tramos',
  timestamps: true
});

// Relaciones
TarifaTramo.belongsTo(CategoriaVehiculo, { foreignKey: 'vehiculo_id' });
CategoriaVehiculo.hasMany(TarifaTramo, { foreignKey: 'vehiculo_id' });

module.exports = TarifaTramo;