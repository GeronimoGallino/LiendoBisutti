// strategies/EstrategiaFactory.js
const { 
  CalculoFlete, CalculoAuxilio, CalculoMudanzaLocal, 
  CalculoMudanzaInterior, CalculoAlquilerMula 
} = require('./estrategiasCalculo');

class EstrategiaFactory {
  static obtenerEstrategia(codigoEstrategia) {
    const estrategias = {
      'FLETE': new CalculoFlete(),
      'AUXILIO': new CalculoAuxilio(),
      'MUDANZA_LOCAL': new CalculoMudanzaLocal(),
      'MUDANZA_INTERIOR': new CalculoMudanzaInterior(),
      'ALQUILER_MULA': new CalculoAlquilerMula()
    };

    const estrategia = estrategias[codigoEstrategia];
    if (!estrategia) {
      throw new Error(`Estrategia no definida para el código: ${codigoEstrategia}`);
    }
    return estrategia;
  }
}

module.exports = EstrategiaFactory;