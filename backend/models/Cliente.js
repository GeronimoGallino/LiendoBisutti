const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ajusta la ruta a donde guardaste tu código de conexión

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_razon_social: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  cuit_dni: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  es_empresa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
}, {
  tableName: 'clientes', 
  timestamps: true,      
});

module.exports = Cliente;