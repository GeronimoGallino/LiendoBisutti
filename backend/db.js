// backend/db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  // Configuración para PRODUCCIÓN (Render)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    timezone: '+00:00', // 1. Fechas estrictamente en UTC
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // 2. Obligatorio en Render para la BD
      }
    }
  });
} else {
  // Configuración para DESARROLLO (Local con DBeaver)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false,
      timezone: '+00:00', // Mantenemos UTC en local para consistencia
    }
  );
}

module.exports = sequelize;