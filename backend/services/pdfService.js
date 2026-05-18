const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const { DateTime } = require('luxon');

// Función auxiliar para leer la imagen y convertirla a base64
const getBase64Image = (fileName) => {
  const filePath = path.join(__dirname, '../assets', fileName);
  if (fs.existsSync(filePath)) {
    const bitmap = fs.readFileSync(filePath);
    const extension = path.extname(fileName).replace('.', '');
    return `data:image/${extension};base64,${bitmap.toString('base64')}`;
  }
  return null; // Si no hay imagen, no rompe el código
};

const generarPresupuestoPDF = async (datosPresupuesto) => {
  const templatePath = path.join(__dirname, '../templates/presupuesto.hbs');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateHtml);

  // Convertimos el logo a Base64
  const logoBase64 = getBase64Image('logo.png'); // Asegúrate que el nombre coincida

  const htmlFinal = template({
    logo: logoBase64,
    id_presupuesto: datosPresupuesto.id.toString().padStart(5, '0'),
    fecha: DateTime.now().setZone('America/Argentina/Buenos_Aires').toFormat('dd/MM/yyyy'),
    
    // Datos del Cliente
    cliente: {
      nombre: datosPresupuesto.Cliente.nombre,
      cuit: datosPresupuesto.Cliente.cuit || '---',
      telefono: datosPresupuesto.Cliente.telefono || '---',
      direccion: datosPresupuesto.Cliente.direccion || '---'
    },

    // Datos de la Empresa (Fijos)
    empresa: {
      telefono: '351-7596392',
      email: 'transporteliendobisutti@gmail.com',
      direccion: 'Calle Baltimore 1843'
    },

    items: datosPresupuesto.PresupuestoDetalles.map(d => ({
      servicio_nombre: d.Servicio.nombre,
      vehiculo_nombre: d.CategoriaVehiculo.nombre,
      // Lógica para mostrar cantidad según el tipo
      cantidad: d.cantidad_km ? `${d.cantidad_km} KM` : `${d.cantidad_horas} Hs`,
      precio_unitario: d.snapshot_precios.precio_por_km || d.snapshot_precios.precio_hora,
      subtotal_item: d.subtotal_item
    })),
    
    subtotal: datosPresupuesto.subtotal_general,
    iva: datosPresupuesto.monto_iva_general,
    total: datosPresupuesto.total_final
  });

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' } 
  });

  await browser.close();
  return pdfBuffer;
};

module.exports = { generarPresupuestoPDF };