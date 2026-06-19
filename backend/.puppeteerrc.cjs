const { join } = require('path');

module.exports = {
  // Obliga a Puppeteer a instalar Chrome en una carpeta local que Render no borre
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};