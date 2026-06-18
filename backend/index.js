const express = require('express');
const cors = require('cors');
const sequelize = require('./db'); 

// (Opcional por ahora) middlewares de autenticación
// const authController = require('./controllers/authController');
// const verifyToken = require('./middlewares/authMiddleware');

// IMPORTAR RUTAS (Las crearemos luego)
const clientesRoutes = require('./routes/clientes'); 
const categoriasVehiculosRoutes = require('./routes/categoriasVehiculos');
const serviciosRoutes = require('./routes/servicios');
const tarifasTramosRoutes = require('./routes/tarifasTramos');
const presupuestosRoutes = require('./routes/presupuestos');
const preciosRoutes = require('./routes/precios');

const app = express();  
const port = process.env.PORT || 3000;

// CONFIGURACIÓN DE CORS
const allowedOrigins = [
  'http://localhost:5173', 
  process.env.FRONTEND_URL 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true); 
    } 
    if (origin.startsWith('http://192.168')) {
         return callback(null, true);
    }
    console.error(`🚫 Bloqueado por CORS: ${origin}`);
    return callback(new Error(`No permitido por CORS`));
  },
  credentials: true 
}));

app.use(express.json());

// USAR RUTAS (Comentadas hasta que existan los archivos)
app.use('/api/clientes', clientesRoutes);
app.use('/api/categorias-vehiculos', categoriasVehiculosRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/tarifas-tramos', tarifasTramosRoutes);
app.use('/api/presupuestos', presupuestosRoutes);
app.use('/api/precios', preciosRoutes);

app.get('/', (req, res) => {
    res.send("Backend de Logística Funcionando 🚀");
});

// Iniciar servidor y probar BD
app.listen(port, async () => {
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
  try {
      await sequelize.authenticate();
      console.log('✅ Base de Datos Conectada');
      
      // Sincronizar modelos (Opcional, si usas migraciones manuales no hace falta)
      // await sequelize.sync({ alter: true }); 
      
  } catch (error) {
      console.error('❌ Error de conexión:', error);
  }
});