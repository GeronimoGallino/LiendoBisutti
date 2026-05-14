const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Cliente = require('./Cliente'); // Importamos el modelo Cliente

const Presupuesto = sequelize.define('Presupuesto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Cliente,
        key: 'id'
    }
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  incluye_iva: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  validez_dias: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30
  },
  subtotal_general: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  monto_iva_general: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  total_final: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'presupuestos',
  timestamps: true
});

// --- DEFINICIÓN DE RELACIONES ---
Presupuesto.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Cliente.hasMany(Presupuesto, { foreignKey: 'cliente_id' });

module.exports = Presupuesto;