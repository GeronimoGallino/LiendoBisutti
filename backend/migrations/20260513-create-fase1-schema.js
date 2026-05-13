const { Table } = require('typeorm');

module.exports = {
  up: async (queryRunner) => {
    await queryRunner.createTable(
      new Table({
        name: 'clientes',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'nombre_razon_social',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'cuit_dni',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'telefono',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'direccion',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'es_empresa',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'createdAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'categorias_vehiculos',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'costo_base_fijo',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            default: '0',
          },
          {
            name: 'precio_hora',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            default: '0',
          },
          {
            name: 'createdAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'servicios',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'tipo_calculo',
            type: 'varchar',
            length: '20',
            isNullable: false,
            enum: ['KM', 'HORAS'],
          },
          {
            name: 'createdAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'tarifas_tramos',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'vehiculo_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'km_desde',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'km_hasta',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'precio_por_km',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['vehiculo_id'],
            referencedTableName: 'categorias_vehiculos',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'presupuestos',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'cliente_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'estado',
            type: 'varchar',
            length: '20',
            isNullable: false,
            default: "'Pendiente'",
          },
          {
            name: 'incluye_iva',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'validez_dias',
            type: 'integer',
            isNullable: false,
            default: 30,
          },
          {
            name: 'subtotal_general',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'monto_iva_general',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            default: '0',
          },
          {
            name: 'total_final',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['cliente_id'],
            referencedTableName: 'clientes',
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'presupuestos_detalles',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'presupuesto_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'servicio_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'vehiculo_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'origen',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'destino',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'cantidad_km',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'cantidad_horas',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'subtotal_item',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'snapshot_precios',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'date',
            isNullable: false,
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['presupuesto_id'],
            referencedTableName: 'presupuestos',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['servicio_id'],
            referencedTableName: 'servicios',
            referencedColumnNames: ['id'],
          },
          {
            columnNames: ['vehiculo_id'],
            referencedTableName: 'categorias_vehiculos',
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );
  },

  down: async (queryRunner) => {
    await queryRunner.dropTable('presupuestos_detalles');
    await queryRunner.dropTable('presupuestos');
    await queryRunner.dropTable('tarifas_tramos');
    await queryRunner.dropTable('servicios');
    await queryRunner.dropTable('categorias_vehiculos');
    await queryRunner.dropTable('clientes');
  },
};
