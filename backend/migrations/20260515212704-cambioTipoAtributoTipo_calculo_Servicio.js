'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Aplicamos el cambio: pasamos tipo_calculo a VARCHAR(50) y no nulo
    await queryInterface.changeColumn('servicios', 'tipo_calculo', {
      type: Sequelize.STRING(50),
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
        
    await queryInterface.changeColumn('servicios', 'tipo_calculo', {
      type:  Sequelize.ENUM('KM', 'HORAS'), 
      allowNull: false 
    });
  }
};