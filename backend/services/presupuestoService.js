const sequelize = require('../db');
const Presupuesto = require('../models/Presupuesto');
const PresupuestoDetalle = require('../models/PresupuestoDetalle');
const Cliente = require('../models/Cliente');
const Servicio = require('../models/Servicio');
const CategoriaVehiculo = require('../models/CategoriaVehiculo');
const TarifaTramo = require('../models/TarifaTramo');
const EstrategiaFactory = require('../strategies/EstrategiaFactory'); // Importamos el Factory
const { Op } = require('sequelize');

const IVA_RATE = 0.21; // 21% para Argentina

const calcularTotales = async (items, incluye_iva) => {
  const detallesCalculados = [];
  let subtotalGeneral = 0;

  for (const item of items) {
    const { servicio_id, vehiculo_id, cantidad_km, cantidad_horas } = item;

    // 1. Obtener servicio y vehículo
    const servicio = await Servicio.findByPk(servicio_id);
    if (!servicio) {
      const error = new Error(`Servicio con ID ${servicio_id} no encontrado`);
      error.status = 400;
      throw error;
    }

    const vehiculo = await CategoriaVehiculo.findByPk(vehiculo_id);
    if (!vehiculo) {
      const error = new Error(`Categoría de vehículo con ID ${vehiculo_id} no encontrada`);
      error.status = 400;
      throw error;
    }

    // 2. Preparar variables dinámicas para el cálculo
    let precioPorKmFijado = null;
    let kmDesde = null;
    let kmHasta = null;

    // Solo buscamos tramos si el payload trae kilómetros
    if (cantidad_km) {
      if (cantidad_km <= 0) {
        const error = new Error(`La cantidad_km debe ser mayor a 0`);
        error.status = 400;
        throw error;
      }

      const tarifa = await TarifaTramo.findOne({
        where: {
          vehiculo_id: vehiculo_id, // <-- Filtra por el vehículo actual
          km_desde: {
            [Op.lte]: cantidad_km   // <-- Equivalente a km_desde <= cantidad_km
          }
        },
        attributes: ['km_desde', 'km_hasta', 'precio_por_km'],
        order: [['km_desde', 'DESC']] // Asegura agarrar el tramo correcto más cercano
      });

      if (!tarifa) {
        const error = new Error(`No hay tarifa disponible para ${cantidad_km} KM en el vehículo ${vehiculo_id}`);
        error.status = 400;
        throw error;
      }

      precioPorKmFijado = Number(tarifa.precio_por_km);
      kmDesde = tarifa.km_desde;
      kmHasta = tarifa.km_hasta;
    }

    // 3. Armar el objeto de datos unificado
    const datosCalculo = {
      costoBaseFijo: Number(vehiculo.costo_base_fijo),
      precioHora: Number(vehiculo.precio_hora),
      precioPorKm: precioPorKmFijado,
      cantidadKm: cantidad_km,
      cantidadHoras: cantidad_horas
    };

    // 4. APLICAR PATRÓN STRATEGY
    const estrategia = EstrategiaFactory.obtenerEstrategia(servicio.tipo_calculo);
    const subtotalItem = estrategia.calcular(datosCalculo);

    // 5. Armar el Snapshot para auditoría histórica
    const snapshotPrecios = {
      servicio_nombre: servicio.nombre,
      tipo_calculo: servicio.tipo_calculo,
      vehiculo_nombre: vehiculo.nombre,
      costo_base_fijo: datosCalculo.costoBaseFijo,
      precio_hora: datosCalculo.precioHora,
      // Usamos spread operator condicional para no guardar nulos innecesarios
      ...(cantidad_km && { 
        cantidad_km, 
        precio_por_km: precioPorKmFijado, 
        km_desde: kmDesde, 
        km_hasta: kmHasta 
      }),
      ...(cantidad_horas && { cantidad_horas })
    };

    subtotalGeneral += subtotalItem;
    detallesCalculados.push({
      ...item,
      subtotal_item: subtotalItem,
      snapshot_precios: snapshotPrecios,
    });
  }

  const montoIva = incluye_iva ? subtotalGeneral * IVA_RATE : 0;
  const totalFinal = subtotalGeneral + montoIva;

  return {
    detallesCalculados,
    subtotalGeneral: Number(subtotalGeneral.toFixed(2)),
    montoIva: Number(montoIva.toFixed(2)),
    totalFinal: Number(totalFinal.toFixed(2)),
  };
};

const generarNuevo = async (cliente_id, items, incluye_iva, validez_dias = 30) => {
  // Validar cliente
  const cliente = await Cliente.findByPk(cliente_id);
  if (!cliente) {
    const error = new Error(`Cliente con ID ${cliente_id} no encontrado`);
    error.status = 400;
    throw error;
  }

  // Recalcular totales (no confiar en frontend)
  const { detallesCalculados, subtotalGeneral, montoIva, totalFinal } = await calcularTotales(
    items,
    incluye_iva
  );

  // Abrir transacción
  const transaction = await sequelize.transaction();

  try {
    // Crear presupuesto
    const presupuesto = await Presupuesto.create(
      {
        cliente_id,
        estado: 'Pendiente',
        incluye_iva,
        validez_dias,
        subtotal_general: subtotalGeneral,
        monto_iva_general: montoIva,
        total_final: totalFinal,
      },
      { transaction }
    );

    // Mapear detalles con presupuesto_id
    const detallesParaCrear = detallesCalculados.map((detalle) => ({
      presupuesto_id: presupuesto.id,
      servicio_id: detalle.servicio_id,
      vehiculo_id: detalle.vehiculo_id,
      cantidad_km: detalle.cantidad_km || null,
      cantidad_horas: detalle.cantidad_horas || null,
      subtotal_item: detalle.subtotal_item,
      snapshot_precios: detalle.snapshot_precios,
    }));

    // Crear detalles en bulk
    await PresupuestoDetalle.bulkCreate(detallesParaCrear, { transaction });

    // Commit
    await transaction.commit();

    // Retornar presupuesto con detalles
    return await Presupuesto.findByPk(presupuesto.id, {
      include: [{ model: PresupuestoDetalle }],
    });
  } catch (error) {
    // Rollback
    await transaction.rollback();
    throw error;
  }
};

const listarTodos = async (filtros = {}) => {
  const where = {};

  if (filtros.estado) {
    where.estado = filtros.estado;
  }
  if (filtros.cliente_id) {
    where.cliente_id = filtros.cliente_id;
  }

  return await Presupuesto.findAll({
    where,
    include: [{ model: Cliente }],
    order: [['createdAt', 'DESC']],
  });
};

const buscarUno = async (id) => {
  const presupuesto = await Presupuesto.findByPk(id, {
    include: [
      { model: Cliente },
      {
        model: PresupuestoDetalle,
        include: [{ model: Servicio }, { model: CategoriaVehiculo }],
      },
    ],
  });

  if (!presupuesto) {
    const error = new Error('Presupuesto no encontrado');
    error.status = 404;
    throw error;
  }

  return presupuesto;
};

const actualizarEstado = async (id, nuevoEstado) => {
  const estadosPermitidos = ['Pendiente', 'Aceptado', 'Anulado'];

  if (!estadosPermitidos.includes(nuevoEstado)) {
    const error = new Error(
      `Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}`
    );
    error.status = 400;
    throw error;
  }

  const presupuesto = await Presupuesto.findByPk(id);
  if (!presupuesto) {
    const error = new Error('Presupuesto no encontrado');
    error.status = 404;
    throw error;
  }

  await presupuesto.update({ estado: nuevoEstado });
  return presupuesto;
};

module.exports = {
  calcularTotales,
  generarNuevo,
  listarTodos,
  buscarUno,
  actualizarEstado,
};