const sequelize = require('../db');
const Presupuesto = require('../models/Presupuesto');
const PresupuestoDetalle = require('../models/PresupuestoDetalle');
const Cliente = require('../models/Cliente');
const Servicio = require('../models/Servicio');
const CategoriaVehiculo = require('../models/CategoriaVehiculo');
const TarifaTramo = require('../models/TarifaTramo');
const EstrategiaFactory = require('../strategies/EstrategiaFactory'); 
const { Op } = require('sequelize');

const IVA_RATE = 0.21; 

const calcularTotales = async (items, incluye_iva) => {
  const detallesCalculados = [];
  let subtotalGeneral = 0;

  for (const item of items) {
    const {
      servicio_id,
      vehiculo_id,
      cantidad_km,
      cantidad_horas,
      costo_base_fijo_manual,
      precio_hora_manual,
      porcentaje_descuento = 0
    } = item;

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

    let precioPorKmFijado = null;
    let kmDesde = null;
    let kmHasta = null;

    if (cantidad_km) {
      if (cantidad_km <= 0) {
        const error = new Error(`La cantidad_km debe ser mayor a 0`);
        error.status = 400;
        throw error;
      }

      const tarifa = await TarifaTramo.findOne({
        where: {
          vehiculo_id: vehiculo_id,
          km_desde: {
            [Op.lte]: cantidad_km
          }
        },
        attributes: ['km_desde', 'km_hasta', 'precio_por_km'],
        order: [['km_desde', 'DESC']] 
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

    // 3. Armar el objeto de datos unificado priorizando la edición manual
    const datosCalculo = {
      costoBaseFijo: (costo_base_fijo_manual !== undefined && costo_base_fijo_manual !== '') 
        ? Number(costo_base_fijo_manual) 
        : Number(vehiculo.costo_base_fijo),
        
      precioHora: (precio_hora_manual !== undefined && precio_hora_manual !== '') 
        ? Number(precio_hora_manual) 
        : Number(vehiculo.precio_hora),
        
      precioPorKm: precioPorKmFijado,
      cantidadKm: cantidad_km,
      cantidadHoras: cantidad_horas
    };

    // 4. APLICAR PATRÓN STRATEGY
    const estrategia = EstrategiaFactory.obtenerEstrategia(servicio.tipo_calculo);
    let subtotalItem = estrategia.calcular(datosCalculo);

    // Aplicar descuento porcentual
    const descuentoAplicado = (porcentaje_descuento / 100) * subtotalItem;
    subtotalItem = subtotalItem - descuentoAplicado;

    // 5. Armar el Snapshot
    const snapshotPrecios = {
      servicio_nombre: servicio.nombre,
      tipo_calculo: servicio.tipo_calculo,
      vehiculo_nombre: vehiculo.nombre,
      costo_base_fijo: datosCalculo.costoBaseFijo,
      precio_hora: datosCalculo.precioHora,
      ...(cantidad_km && {
        cantidad_km,
        precio_por_km: precioPorKmFijado,
        km_desde: kmDesde,
        km_hasta: kmHasta
      }),
      ...(cantidad_horas && { cantidad_horas }),
      porcentaje_descuento: Number(porcentaje_descuento)
    };

    subtotalGeneral += subtotalItem;
    detallesCalculados.push({
      ...item,
      subtotal_item: subtotalItem,
      snapshot_precios: snapshotPrecios,
      porcentaje_descuento: Number(porcentaje_descuento)
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
  const cliente = await Cliente.findByPk(cliente_id);
  if (!cliente) {
    const error = new Error(`Cliente con ID ${cliente_id} no encontrado`);
    error.status = 400;
    throw error;
  }

  const { detallesCalculados, subtotalGeneral, montoIva, totalFinal } = await calcularTotales(
    items,
    incluye_iva
  );

  const transaction = await sequelize.transaction();

  try {
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

    const detallesParaCrear = detallesCalculados.map((detalle) => ({
      presupuesto_id: presupuesto.id,
      servicio_id: detalle.servicio_id,
      vehiculo_id: detalle.vehiculo_id,
      cantidad_km: detalle.cantidad_km || null,
      cantidad_horas: detalle.cantidad_horas || null,
      subtotal_item: detalle.subtotal_item,
      snapshot_precios: detalle.snapshot_precios,
      porcentaje_descuento: detalle.porcentaje_descuento || 0
    }));

    await PresupuestoDetalle.bulkCreate(detallesParaCrear, { transaction });
    await transaction.commit();

    return await Presupuesto.findByPk(presupuesto.id, {
      include: [{ model: PresupuestoDetalle }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const listarTodos = async (filtros = {}) => {
  const where = {};
  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.cliente_id) where.cliente_id = filtros.cliente_id;

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
    const error = new Error(`Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}`);
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

module.exports = { calcularTotales, generarNuevo, listarTodos, buscarUno, actualizarEstado };