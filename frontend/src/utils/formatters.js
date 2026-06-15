export const formatearMoneda = (valor) => {
  if (valor === undefined || valor === null) return "$ 0,00";
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2
  }).format(valor);
};