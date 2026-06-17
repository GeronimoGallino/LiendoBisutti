const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const { DateTime } = require('luxon');

const formatearMoneda = (valor) => {
  if (valor === undefined || valor === null || isNaN(valor)) return "$ 0,00";
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2
  }).format(valor);
};

const getBase64Image = (fileName) => {
  const filePath = path.join(__dirname, '../assets', fileName);
  if (fs.existsSync(filePath)) {
    const bitmap = fs.readFileSync(filePath);
    const extension = path.extname(fileName).replace('.', '');
    return `data:image/${extension};base64,${bitmap.toString('base64')}`;
  }
  return null;
};

const generarPresupuestoPDF = async (datosPresupuesto) => {
  const templatePath = path.join(__dirname, '../templates/presupuesto.hbs');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateHtml);

  const logoBase64 = getBase64Image('logo.png');

  // --- NUEVA LÓGICA DE CÁLCULOS PARA EL PDF ---
  let subtotal_bruto = 0;
  let descuento_total = 0;
  let porcentaje_aplicado = 0;

  const itemsMapeados = datosPresupuesto.PresupuestoDetalles.map(d => {
    const calculoPorHora = !!d.cantidad_horas;
    
    // Rescatamos el descuento del snapshot
    const porcentaje = d.snapshot_precios.porcentaje_descuento || 0;
    const subtotalNeto = Number(d.subtotal_item);
    
    // Reconstruimos el valor original antes del descuento
    let subtotalOriginal = subtotalNeto;
    if (porcentaje > 0) {
      subtotalOriginal = subtotalNeto / (1 - (porcentaje / 100));
      porcentaje_aplicado = porcentaje; // Asumimos que es global para mostrarlo en el resumen
    }

    subtotal_bruto += subtotalOriginal;
    descuento_total += (subtotalOriginal - subtotalNeto);

    // Detectamos si es mudanza para el texto de los 2 ayudantes
    const esMudanza = d.snapshot_precios.tipo_calculo.includes('MUDANZA');

    return {
      servicio_nombre: d.Servicio.nombre,
      vehiculo_nombre: d.CategoriaVehiculo.nombre,
      cantidad: d.cantidad_km ? `${d.cantidad_km} KM` : `${d.cantidad_horas} Hs`,
      precio_unitario: formatearMoneda(d.snapshot_precios.precio_por_km || d.snapshot_precios.precio_hora),
      es_por_hora: calculoPorHora,
      es_mudanza: esMudanza, // Pasamos este flag al HTML
      subtotal_item: formatearMoneda(subtotalNeto)
    };
  });

  const htmlFinal = template({
    logo: logoBase64,
    id_presupuesto: datosPresupuesto.id.toString().padStart(5, '0'),
    fecha: DateTime.now().setZone('America/Argentina/Buenos_Aires').toFormat('dd/MM/yyyy'),
    validez_dias: datosPresupuesto.validez_dias,
    cliente: {
      nombre: datosPresupuesto.Cliente.nombre_razon_social || '---',
      cuit: datosPresupuesto.Cliente.cuit_dni || '---',
      telefono: datosPresupuesto.Cliente.telefono || '---',
      direccion: datosPresupuesto.Cliente.direccion || '---'
    },
    empresa: {
      telefono: '351-7596392',
      email: 'transporteliendobisutti@gmail.com',
      direccion: 'Calle Baltimore 1843'
    },
    
    items: itemsMapeados,

    modo_compacto: itemsMapeados.length > 5,
    tiene_descuento: descuento_total > 0,
    descuento_porcentaje: porcentaje_aplicado,
    
    
    subtotal_bruto: formatearMoneda(subtotal_bruto),
    descuento_total: formatearMoneda(descuento_total),
    subtotal_neto: formatearMoneda(datosPresupuesto.subtotal_general), 
    iva: formatearMoneda(datosPresupuesto.monto_iva_general),
    total: formatearMoneda(datosPresupuesto.total_final)
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