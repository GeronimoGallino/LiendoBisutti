const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Presupuesto = require('./Presupuesto');
const Servicio = require('./Servicio');
const CategoriaVehiculo = require('./CategoriaVehiculo');
const { DateTime } = require('luxon');

const PresupuestoDetalle = sequelize.define('PresupuestoDetalle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  presupuesto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Presupuesto,
      key: 'id'
    }
  },
  servicio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Servicio,
      key: 'id'
    }
  },
  vehiculo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CategoriaVehiculo,
      key: 'id'
    }
  },
  cantidad_km: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cantidad_horas: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  subtotal_item: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  snapshot_precios: {
    type: DataTypes.JSONB,
    allowNull: false
  }
}, {
  tableName: 'presupuestos_detalles',
  timestamps: true
});

// Relaciones
PresupuestoDetalle.belongsTo(Presupuesto, { foreignKey: 'presupuesto_id' });
Presupuesto.hasMany(PresupuestoDetalle, { foreignKey: 'presupuesto_id' });

PresupuestoDetalle.belongsTo(Servicio, { foreignKey: 'servicio_id' });
Servicio.hasMany(PresupuestoDetalle, { foreignKey: 'servicio_id' });

PresupuestoDetalle.belongsTo(CategoriaVehiculo, { foreignKey: 'vehiculo_id' });
CategoriaVehiculo.hasMany(PresupuestoDetalle, { foreignKey: 'vehiculo_id' });

module.exports = PresupuestoDetalle;