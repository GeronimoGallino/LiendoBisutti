// controllers/presupuestoController.js

const {  calcularTotales,  generarNuevo,  listarTodos,  buscarUno,  actualizarEstado,} = require('../services/presupuestoService');
const { generarPresupuestoPDF } = require('../services/pdfService');

const descargarPdf = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Traemos todo el grafo de datos (Presupuesto + Detalles + Cliente + Servicio)
    const presupuesto = await buscarUno(id);
    
    // Generamos el buffer
    const pdfBuffer = await generarPresupuestoPDF(presupuesto);

    // Configuramos los headers para que el navegador sepa que es un PDF descargable
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=presupuesto_${id}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    // Enviamos el archivo
    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ error: 'Error al generar el documento' });
  }
};

const calcularPreview = async (req, res) => {
  try {
    const { items, incluye_iva } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items debe ser un array no vacío' });
    }

    if (incluye_iva === undefined || typeof incluye_iva !== 'boolean') {
      return res.status(400).json({ error: 'incluye_iva debe ser un booleano' });
    }

    const resultado = await calcularTotales(items, incluye_iva);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al calcular preview:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

const crearPresupuesto = async (req, res) => {
  try {
    // EXTRAEMOS EL FLAG DEL BODY
    const { cliente_id, items, incluye_iva, validez_dias, es_comprobante } = req.body;

    if (!cliente_id) {
      return res.status(400).json({ error: 'cliente_id es obligatorio' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items debe ser un array no vacío' });
    }

    if (incluye_iva === undefined || typeof incluye_iva !== 'boolean') {
      return res.status(400).json({ error: 'incluye_iva debe ser un booleano' });
    }

    // LE PASAMOS EL FLAG AL SERVICIO COMO 5to PARÁMETRO
    const presupuesto = await generarNuevo(cliente_id, items, incluye_iva, validez_dias, es_comprobante);
    res.status(201).json(presupuesto);
  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

const obtenerHistorial = async (req, res) => {
  try {
    const filtros = req.query;
    const presupuestos = await listarTodos(filtros);
    res.status(200).json(presupuestos);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const presupuesto = await buscarUno(id);
    res.status(200).json(presupuesto);
  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'estado es obligatorio' });
    }

    const presupuesto = await actualizarEstado(id, estado);
    res.status(200).json(presupuesto);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
};

module.exports = {
  calcularPreview,
  crearPresupuesto,
  obtenerHistorial,
  obtenerPorId,
  cambiarEstado,
  descargarPdf
};
