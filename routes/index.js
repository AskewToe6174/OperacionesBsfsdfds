const operacionesRouter = require('./operacionesRouter');
const clientesRouter = require('./clientesRouter');
const registroRouter = require('./registroRouter');
const cobroRouter = require('./cobroRouter');
const facturacion = require('./facturacion');
const pagos = require('./pagos')
const reportes = require('./reportesRouter')
const scripts = require('./ScriptsRouter')

function routerApi(app){
  app.use('/operaciones',operacionesRouter);
  app.use('/operaciones/clientes', clientesRouter);
  app.use('/operaciones/registros', registroRouter);
  app.use('/operaciones/cobros',cobroRouter);
  app.use('/operaciones/facturas',facturacion);
  app.use('/operaciones/pagos', pagos);
  app.use('/operaciones/reportes', reportes);
  app.use('/operaciones/scripts', scripts);
}
module.exports = routerApi;
