// strategies/estrategiasCalculo.js

class EstrategiaCalculo {
  calcular(datos) {
    throw new Error("Debe implementarse");
  }
}

class CalculoFlete extends EstrategiaCalculo {
  calcular({ costoBaseFijo, precioPorKm, cantidadKm }) {
    if (cantidadKm == null || precioPorKm == null) throw new Error("Faltan datos de KM para el Flete");
    return Number(costoBaseFijo) + (Number(precioPorKm) * Number(cantidadKm));
  }
}

class CalculoAuxilio extends EstrategiaCalculo {
  calcular({ costoBaseFijo, precioPorKm, cantidadKm }) {
    // Hoy es igual al flete, pero al tener su propia clase, 
    // mañana Tatero te pide "sumale recargo por lluvia" y lo tocás solo acá.
    if (cantidadKm == null || precioPorKm == null) throw new Error("Faltan datos de KM para el Auxilio");
    return Number(costoBaseFijo) + (Number(precioPorKm) * Number(cantidadKm));
  }
}

class CalculoMudanzaLocal extends EstrategiaCalculo {
  calcular({ precioHora, cantidadHoras }) {
    if (cantidadHoras == null) throw new Error("Faltan horas para Mudanza Local");
    return Number(precioHora) * Number(cantidadHoras);
  }
}

class CalculoMudanzaInterior extends EstrategiaCalculo {
  calcular({ costoBaseFijo, precioPorKm, cantidadKm }) {
    if (cantidadKm == null || precioPorKm == null) throw new Error("Faltan datos de KM para Mudanza Interior");
    return Number(costoBaseFijo) + (Number(precioPorKm) * Number(cantidadKm));
  }
}

class CalculoAlquilerMula extends EstrategiaCalculo {
  calcular({ precioHora, cantidadHoras }) {
    if (cantidadHoras == null) throw new Error("Faltan horas para Alquiler Mula");
    // El traslado cuesta 1 hora extra, entonces es: precioHora (traslado) + (horas * precioHora)
    return Number(precioHora) + (Number(cantidadHoras) * Number(precioHora));
  }
}

module.exports = {
  CalculoFlete,
  CalculoAuxilio,
  CalculoMudanzaLocal,
  CalculoMudanzaInterior,
  CalculoAlquilerMula
};