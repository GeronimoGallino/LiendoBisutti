'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('presupuestos_detalles', 'porcentaje_descuento', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Porcentaje de descuento aplicado al ítem (0-100)'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('presupuestos_detalles', 'porcentaje_descuento');
  }
};
