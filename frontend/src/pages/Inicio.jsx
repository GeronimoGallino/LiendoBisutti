import React from 'react';
import { useNavigate } from 'react-router-dom';

const Inicio = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Si tenés una función logout importada usala, sino quitala.
    navigate('/login');
  };

  const probarMenuNativo = async () => {
    try {
      // 1. Fabricamos un archivo de texto falso al instante (sin ir al backend)
      const blob = new Blob(['Hola Tatero, si ves esto el menú funciona.'], { type: 'text/plain' });
      const file = new File([blob], 'Presupuesto_Prueba.txt', { type: 'text/plain' });

      // 2. Intentamos abrir el menú nativo inmediatamente
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Prueba Liendo Bissutti',
          text: 'Mirá este presupuesto de prueba.',
        });
        console.log('¡Menú nativo abierto con éxito!');
      } else {
        alert('Este navegador/dispositivo no soporta compartir archivos nativamente.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        alert(`Falló la prueba: ${error.message}`);
      }
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-2">
        
        {/* BLOQUE IZQUIERDO: Títulos */}
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Liendo Bisutti</h1>
          <p className="text-sm text-gray-400">Panel Principal</p>
        </div>

        {/* BLOQUE DERECHO: Botonera agrupada */}
        <div className="flex items-center gap-4">
          
          {/* LOGOUT - Rojo */}
          <button 
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="w-10 h-10 bg-gray-700 hover:bg-red-900/50 text-gray-300 hover:text-red-400 border-2 border-red-500 rounded-full flex items-center justify-center transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>

        </div>
      </header>

      {/* --- BOTÓN PRINCIPAL: GENERAR PRESUPUESTO --- */}
      <button 
        onClick={() => navigate('/WizardPresupuesto')}
        className="relative w-full bg-blue-600 p-6 rounded-2xl shadow-lg text-left flex justify-between items-center active:scale-95 transition-transform group"
      >
        <div>
           <h2 className="text-2xl font-bold text-white">Generar Presupuesto</h2>
           <p className="text-blue-200 text-sm">Crear nueva cotización</p>
        </div>
        <div className="text-4xl group-hover:scale-110 transition-transform">
           📝
        </div>
      </button>

      {/* --- NUEVO BOTÓN: COSTO DE SERVICIO --- */}
      <button 
        onClick={() => navigate('/WizardPresupuesto', { state: { esComprobante: true } })}
        className="relative w-full bg-emerald-600 p-6 rounded-2xl shadow-lg text-left flex justify-between items-center active:scale-95 transition-transform group"
      >
        <div>
           <h2 className="text-2xl font-bold text-white">Generar Costo de Servicio</h2>
           <p className="text-emerald-200 text-sm">Registrar viaje ya realizado (Comprobante)</p>
        </div>
        <div className="text-4xl group-hover:scale-110 transition-transform">
           🧾
        </div>
      </button>

      {/* --- NUEVO BOTÓN: DASHBOARD DE PRECIOS --- */}
      <button 
        onClick={() => navigate('/precios')}
        className="relative w-full bg-slate-800 p-6 rounded-2xl shadow-lg text-left flex justify-between items-center active:scale-95 transition-transform group mt-2"
      >
        <div>
           <h2 className="text-2xl font-bold text-white">Tarifas y Precios</h2>
           <p className="text-slate-300 text-sm">Ajustar catálogo y aplicar aumentos</p>
        </div>
        <div className="text-4xl group-hover:scale-110 transition-transform">
           📈
        </div>
      </button>

      <button 
        onClick={probarMenuNativo}
          className="bg-blue-600 text-white p-4 m-4 rounded-lg font-bold"
      >
  🧪 PROBAR MENÚ DE WHATSAPP
</button>

    </div>
  );
};

export default Inicio;