const preciosService = require('../services/preciosService');

const obtenerPrecios = async (req, res) => {
  try {
    const catalogo = await preciosService.obtenerCatalogoCompleto();
    res.status(200).json(catalogo);
  } catch (error) {
    console.error('Error al obtener el catálogo de precios:', error);
    res.status(500).json({ error: 'Error interno al cargar los precios' });
  }
};

const aplicarAumento = async (req, res) => {
  try {
    const { porcentaje } = req.body;

    // Validamos que el porcentaje sea un número positivo y exista
    if (porcentaje === undefined || isNaN(Number(porcentaje)) || Number(porcentaje) <= 0) {
      return res.status(400).json({ error: 'Debe enviar un porcentaje válido mayor a 0' });
    }

    await preciosService.aplicarAumentoMasivo(porcentaje);
    
    // Devolvemos el catálogo ya actualizado para que el frontend refresque la tabla
    const catalogoActualizado = await preciosService.obtenerCatalogoCompleto();
    res.status(200).json({ 
      mensaje: `Aumento del ${porcentaje}% aplicado con éxito a todo el sistema.`,
      datos: catalogoActualizado 
    });

  } catch (error) {
    console.error('Error al aplicar aumento masivo:', error);
    res.status(500).json({ error: 'Error crítico al intentar actualizar los precios.' });
  }
};

const actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { costo_base_fijo, precio_hora } = req.body;
    await preciosService.actualizarPrecioVehiculo(id, costo_base_fijo, precio_hora);
    const catalogoActualizado = await preciosService.obtenerCatalogoCompleto();
    res.status(200).json({ mensaje: 'Vehículo actualizado', datos: catalogoActualizado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar vehículo' });
  }
};

const actualizarTramo = async (req, res) => {
  try {
    const { id } = req.params;
    const { precio_por_km } = req.body;
    await preciosService.actualizarPrecioTramo(id, precio_por_km);
    const catalogoActualizado = await preciosService.obtenerCatalogoCompleto();
    res.status(200).json({ mensaje: 'Tramo actualizado', datos: catalogoActualizado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tramo' });
  }
};

module.exports = {
  obtenerPrecios,
  aplicarAumento,
  actualizarVehiculo,
  actualizarTramo
};