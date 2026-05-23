import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inicio from './pages/Inicio';
import WizardPresupuesto from './pages/WizardPresupuesto';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* En el futuro esta ruta estará envuelta en <PrivateRoute> */}
         <Route path="/" element={<Inicio />} />
          <Route path="/WizardPresupuesto" element={<WizardPresupuesto />} />
        
        
        {/* Ruta por defecto para URLs no encontradas */}
        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;