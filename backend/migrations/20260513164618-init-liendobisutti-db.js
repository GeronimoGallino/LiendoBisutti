'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. TABLAS INDEPENDIENTES (Sin Foreign Keys)

    await queryInterface.createTable('clientes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nombre_razon_social: { type: Sequelize.STRING(100), allowNull: false },
      cuit_dni: { type: Sequelize.STRING(20), allowNull: true },
      telefono: { type: Sequelize.STRING(20), allowNull: true },
      direccion: { type: Sequelize.STRING(255), allowNull: true },
      es_empresa: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });

    await queryInterface.createTable('categorias_vehiculos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nombre: { type: Sequelize.STRING(50), allowNull: false },
      costo_base_fijo: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      precio_hora: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });

    await queryInterface.createTable('servicios', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nombre: { type: Sequelize.STRING(50), allowNull: false },
      tipo_calculo: { type: Sequelize.ENUM('KM', 'HORAS'), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });

    // 2. TABLAS DEPENDIENTES (Con Foreign Keys)

    await queryInterface.createTable('tarifas_tramos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      vehiculo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categorias_vehiculos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      km_desde: { type: Sequelize.INTEGER, allowNull: false },
      km_hasta: { type: Sequelize.INTEGER, allowNull: true },
      precio_por_km: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });

    await queryInterface.createTable('presupuestos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clientes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      estado: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'Pendiente' },
      incluye_iva: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      validez_dias: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 30 },
      subtotal_general: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      monto_iva_general: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total_final: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });

    await queryInterface.createTable('presupuestos_detalles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      presupuesto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'presupuestos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      servicio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'servicios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      vehiculo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categorias_vehiculos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cantidad_km: { type: Sequelize.INTEGER, allowNull: true },
      cantidad_horas: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      subtotal_item: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      snapshot_precios: { type: Sequelize.JSONB, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // El orden de eliminación es inverso a la creación
    await queryInterface.dropTable('presupuestos_detalles');
    await queryInterface.dropTable('presupuestos');
    await queryInterface.dropTable('tarifas_tramos');
    await queryInterface.dropTable('servicios');
    await queryInterface.dropTable('categorias_vehiculos');
    await queryInterface.dropTable('clientes');
  }
};