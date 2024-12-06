const express = require('express');
const router = express.Router();
const cors = require('cors');
const Decimal = require('decimal.js');
const { sequelize, Cliente, RegistroAplicaciones,ComentariosAplicacion,declaraciones } = require('../models');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
router.use(cors());


// --------------------------------- GET ----------------------------------
router.get('/:operacion/:year/:mes', async (req, res) => {
  try {
    let { operacion, year, mes } = req.params;
    let { deal } = req.query;

    console.log(`Operación: ${operacion}, Año: ${year}, Mes: ${mes}`);  // Aquí puedes ver los parámetros que recibes

    // Validar que existan los parámetros requeridos
    if (!operacion || !year || !mes) {
      return res.status(400).json({
        message: "error",
        details: 'Ingrese todos los campos requeridos: operacion, year y mes.'
      });
    }

    operacion = parseInt(operacion, 10);
    console.log(`Operación recibida: ${operacion}`);  // Verifica que se recibe '1'
    
    year = parseInt(year, 10);
    mes = parseInt(mes, 10);
    const currentYear = new Date().getFullYear();
    let results = [];

    // Primera consulta si "deal" está presente
    if (deal && Number.isInteger(operacion) && operacion > 0 && 
        Number.isInteger(year) && year > 0 && year <= currentYear &&
        Number.isInteger(mes) && mes >= 1 && mes <= 12) {
      console.log('Ejecutando consulta con "deal"');  // Ver qué consulta se está ejecutando
      [results] = await sequelize.query(
        `
SELECT
    registroaplicaciones.idCliente AS idCliente,
    MAX(registroaplicaciones.id) AS idAplicacion,
    MAX(registroaplicaciones.idTipoOperacion),
    MAX(clientes.id) AS idClienteCliente,
    MAX(periodos.name) AS periodo,
    promotores.nombre,
    grupos.nombre AS Grupo,
    clientes.razonSocial,
    CASE @mesAplicado
        WHEN 1 THEN 'Enero'
        WHEN 2 THEN 'Febrero'
        WHEN 3 THEN 'Marzo'
        WHEN 4 THEN 'Abril'
        WHEN 5 THEN 'Mayo'
        WHEN 6 THEN 'Junio'
        WHEN 7 THEN 'Julio'
        WHEN 8 THEN 'Agosto'
        WHEN 9 THEN 'Septiembre'
        WHEN 10 THEN 'Octubre'
        WHEN 11 THEN 'Noviembre'
        WHEN 12 THEN 'Diciembre'
    END AS mesAplicado,
    MAX(registroaplicaciones.anualAplicado) AS anualAplicado,
    SUM(registroaplicaciones.estimulo) AS totalEstimulo
FROM
    registroaplicaciones
INNER JOIN
    clientes ON registroaplicaciones.idCliente = clientes.id
INNER JOIN
    periodos ON registroaplicaciones.idPeriodo = periodos.id
INNER JOIN
    promotores ON clientes.idPromotor = promotores.id
INNER JOIN
    grupos ON clientes.idGrupo = grupos.id
WHERE
    registroaplicaciones.idTipoOperacion = :Operacion
    AND registroaplicaciones.mesAplicado = :mes
    AND registroaplicaciones.anualAplicado = :year
GROUP BY
    registroaplicaciones.idCliente,
    promotores.nombre,
    grupos.nombre,
    clientes.razonSocial;`,
        {
          replacements: {
            operacion,
            mes: mes || null,
            year: year || null,
            deal: deal || null
          }
        }
      );
    }
    // Segunda consulta si "deal" no está presente
    else if (Number.isInteger(operacion) && operacion > 0 && 
             Number.isInteger(year) && year > 0 && year <= currentYear &&
             Number.isInteger(mes) && mes >= 1 && mes <= 12) {
      console.log('Ejecutando consulta sin "deal"');  // Ver qué consulta se está ejecutando
      [results] = await sequelize.query(
        `SELECT
            registroaplicaciones.idCliente AS idCliente,
            registroaplicaciones.idTipoOperacion,
            MAX(registroaplicaciones.id) AS idAplicacion,
            MAX(clientes.id) AS idCliente,
            MAX(periodos.name) AS periodo,
            promotores.nombre,
            grupos.nombre AS Grupo,
            clientes.razonSocial,
            CASE MAX(registroaplicaciones.mesAplicado)
                WHEN 1 THEN 'Enero'
                WHEN 2 THEN 'Febrero'
                WHEN 3 THEN 'Marzo'
                WHEN 4 THEN 'Abril'
                WHEN 5 THEN 'Mayo'
                WHEN 6 THEN 'Junio'
                WHEN 7 THEN 'Julio'
                WHEN 8 THEN 'Agosto'
                WHEN 9 THEN 'Septiembre'
                WHEN 10 THEN 'Octubre'
                WHEN 11 THEN 'Noviembre'
                WHEN 12 THEN 'Diciembre'
            END AS mesAplicado,
            MAX(registroaplicaciones.anualAplicado) AS anualAplicado,
            SUM(registroaplicaciones.estimulo) AS totalEstimulo
        FROM
            registroaplicaciones
        INNER JOIN
            clientes ON registroaplicaciones.idCliente = clientes.id
        INNER JOIN
            periodos ON registroaplicaciones.idPeriodo = periodos.id
        INNER JOIN
            promotores ON clientes.idPromotor = promotores.id
        INNER JOIN
            grupos ON clientes.idGrupo = grupos.id
        WHERE
            registroaplicaciones.idTipoOperacion = :operacion
            AND (:mes IS NULL OR registroaplicaciones.mesAplicado = :mes)
            AND (:year IS NULL OR registroaplicaciones.anualAplicado = :year)
        GROUP BY
            registroaplicaciones.idCliente,
            promotores.nombre,
            grupos.nombre,
            clientes.razonSocial`,
        {
          replacements: {
            operacion,
            mes: mes || null,
            year: year || null
          }
        }
      );
    } else {
      return res.status(400).json({
        message: "error",
        details: "Parámetros inválidos. Asegúrate de que ID, year, y mes sean válidos."
      });
    }

    // Formatear el campo totalEstimulo para cada resultado
    results = results.map(result => ({
      ...result,
      totalEstimulo: new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(result.totalEstimulo)
    }));

    // Devolver los resultados con el formato aplicado
    if (results.length === 0) {
      res.json({ message: "Sin resultados" });
    } else {
      res.json(results);
    }

  } catch (error) {
    console.error('Error fetching registros:', error);
    res.status(500).send('Server error');
  }
});

//buscar x id cliente por año y mes de aplicacion
router.get('/buscar/:id/:mesAplicado/:year', async (req, res) => {
  try {
    let { id, year, mesAplicado } = req.params;

    // Convertir los parámetros a enteros
    id = parseInt(id, 10);
    year = parseInt(year, 10);
    mesAplicado = parseInt(mesAplicado, 10);

    // Obtener el año actual
    const currentYear = new Date().getFullYear();

    // Validación de parámetros obligatorios
    if (
      Number.isInteger(id) && id > 0 &&  // Validar que ID es un número entero válido
      Number.isInteger(year) && year > 0 && year <= currentYear &&  // Validar que year es un número entero y anterior al año actual
      Number.isInteger(mesAplicado) && mesAplicado > 0 && mesAplicado < 13  // Validar que mesAplicado está entre 1 y 12
    ) {
      // Consulta si los parámetros son válidos
      const [results] = await sequelize.query(
        `SELECT
              registroaplicaciones.id AS idRegistro,
              registroaplicaciones.idTipoOperacion AS idTipoOperacion,
              comentariosaplicacions.comentario,
              promotores.nombre,
              grupos.nombre AS Grupo,
              clientes.razonSocial,
              CASE registroaplicaciones.mesAplicado
                WHEN 1 THEN 'Enero'
                WHEN 2 THEN 'Febrero'
                WHEN 3 THEN 'Marzo'
                WHEN 4 THEN 'Abril'
                WHEN 5 THEN 'Mayo'
                WHEN 6 THEN 'Junio'
                WHEN 7 THEN 'Julio'
                WHEN 8 THEN 'Agosto'
                WHEN 9 THEN 'Septiembre'
                WHEN 10 THEN 'Octubre'
                WHEN 11 THEN 'Noviembre'
                WHEN 12 THEN 'Diciembre'
              END AS mesAplicado,
              registroaplicaciones.anualAplicado AS anualAplicado
            FROM
              registroaplicaciones
            INNER JOIN
              clientes ON registroaplicaciones.idCliente = clientes.id
            INNER JOIN
              periodos ON registroaplicaciones.idPeriodo = periodos.id
            INNER JOIN
              promotores ON clientes.idPromotor = promotores.id
            INNER JOIN
              grupos ON clientes.idGrupo = grupos.id
            LEFT JOIN
              comentariosaplicacions ON registroaplicaciones.id = comentariosaplicacions.idAplicacion
            WHERE
            registroaplicaciones.idCliente = :id
          AND registroaplicaciones.mesAplicado = :mesAplicado
          AND registroaplicaciones.anualAplicado = :year`,
        {
          replacements: { id, mesAplicado, year }
        }
      );

      // Enviar resultados o mensaje de sin resultados
      if (results.length === 0) {
        res.status(404).json({ message: "Sin resultados para los parámetros especificados" });
      } else {
        res.json(results);
      }
    } else {
      // Si la validación falla, enviar error de solicitud inválida
      res.status(400).json({
        message: "error",
        details: "Parámetros inválidos. Asegúrate de que ID, year, y mesAplicado sean válidos.",
        data: {
          id,
          mesAplicado,
          year
        }

      });
    }
  } catch (error) {
    console.error('Error fetching registros:', error);
    res.status(500).send('Error del servidor');
  }
});


// BUSCAR X ID DE APLICACION.
//=======================================================================================
router.get('/buscar/:id', async (req, res) => {
  try {
    let { id } = req.params;

    // Convertir el parámetro id a entero
    id = parseInt(id, 10);

    // Validación de parámetros obligatorios
    if (Number.isInteger(id) && id > 0) {
      // Consulta si el parámetro id es válido
      const [results] = await sequelize.query(
        `SELECT 
          registroaplicaciones.id AS idAplicacion,
          registroaplicaciones.idTipoOperacion,
          registroaplicaciones.ivaCliente,
          comentariosaplicacions.Comentario,
          declaraciones.status,
          declaraciones.recepcionPrevia,
          declaraciones.fechaElaboracionAviso,
          declaraciones.folioResponsableSolidario,
          declaraciones.fechaRecepcionDeclaracion,
          declaraciones.folioDeclaracion,
          declaraciones.fechaDeclaracion,
          declaraciones.fechaAvisoCliente,
          declaraciones.folioAvisoCliente,
          declaraciones.opinionCumplimiento,
          declaraciones.fechaGeneracionOpinionCumplimiento,
          declaraciones.fechaEnvioExpediente,
          declaraciones.fechaElaboracionEscrito,
          declaraciones.fechaRetornoAvisoFirmado,
          declaraciones.fechaIngresoAviso,
          declaraciones.envioPrevia,
          declaraciones.recepcionAvisoResponsableSolidario,
          declaraciones.envioDeclaracion,
          declaraciones.retornoExpediente,
          registroaplicaciones.estimulo,
          FORMAT(registroaplicaciones.subtotal * (registroaplicaciones.ivaFacturacion / 100), 2) AS ivaCalculado,
          registroaplicaciones.isrPmorales,
          registroaplicaciones.isrRetencionesSalarios,
          registroaplicaciones.isrRetencionesAsim,
          registroaplicaciones.isrRetencionesServ,
          registroaplicaciones.deal,
          registroaplicaciones.subtotal,
          registroaplicaciones.ivaFacturacion,
          registroaplicaciones.total,
          registroaplicaciones.porcentajeDsb,
          registroaplicaciones.montoDsb,
          registroaplicaciones.porcentajePromotor,
          registroaplicaciones.montoPromotor,
          registroaplicaciones.porcentajeProveedor,
          registroaplicaciones.montoProveedor,
          registroaplicaciones.ahorro,
          registroaplicaciones.status,
          periodos.name AS periodo,
          grupos.nombre AS Grupo,
          clientes.razonSocial,
          CASE registroaplicaciones.mesAplicado
              WHEN 1 THEN 'Enero'
              WHEN 2 THEN 'Febrero'
              WHEN 3 THEN 'Marzo'
              WHEN 4 THEN 'Abril'
              WHEN 5 THEN 'Mayo'
              WHEN 6 THEN 'Junio'
              WHEN 7 THEN 'Julio'
              WHEN 8 THEN 'Agosto'
              WHEN 9 THEN 'Septiembre'
              WHEN 10 THEN 'Octubre'
              WHEN 11 THEN 'Noviembre'
              WHEN 12 THEN 'Diciembre'
          END AS mesAplicado,
          registroaplicaciones.anualAplicado AS anualAplicado,
          registroaplicaciones.estimulo AS totalEstimulo
        FROM 
          registroaplicaciones
        INNER JOIN 
          clientes ON registroaplicaciones.idCliente = clientes.id
        INNER JOIN 
          periodos ON registroaplicaciones.idPeriodo = periodos.id
        INNER JOIN 
          promotores ON clientes.idPromotor = promotores.id
        INNER JOIN 
          grupos ON clientes.idGrupo = grupos.id
        INNER JOIN 
          declaraciones ON registroaplicaciones.id = declaraciones.idRegistroApp 
        INNER JOIN 
          comentariosaplicacions ON registroaplicaciones.id = comentariosaplicacions.idAplicacion 
        WHERE 
          registroaplicaciones.id = :id`,
        {
          replacements: { id }
        }
      );

      
    const validarDecimal = (valor) => {
      const valorStr = String(valor).trim();
      return !isNaN(valorStr) && valorStr !== "" ? new Decimal(valorStr) : new Decimal(0);
    };

      // Si no se encuentran registros, enviar respuesta de error
      if (results.length === 0) {
        res.status(404).json({ message: "Sin resultados para los parámetros especificados" });
        return;
      }

      // Formatear ivaCalculado como moneda


      results[0].totalEstimulo = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(results[0].totalEstimulo);
      // Consultar la barra de progreso del segundo método
      let processbarValue = 0;

      const queryProcessbar = `SELECT 
          registroaplicaciones.idTipoOperacion,
          declaraciones.idRegistroApp, 
          declaraciones.status, 
          declaraciones.fechaElaboracionAviso,
          declaraciones.recepcionPrevia, 
          declaraciones.fechaElaboracionAviso, 
          declaraciones.folioResponsableSolidario, 
          declaraciones.fechaRecepcionDeclaracion, 
          declaraciones.folioDeclaracion, 
          declaraciones.fechaDeclaracion, 
          declaraciones.fechaAvisoCliente, 
          declaraciones.folioAvisoCliente, 
          declaraciones.opinionCumplimiento, 
          declaraciones.fechaGeneracionOpinionCumplimiento, 
          declaraciones.fechaEnvioExpediente, 
          declaraciones.fechaElaboracionEscrito, 
          declaraciones.fechaRetornoAvisoFirmado, 
          declaraciones.fechaIngresoAviso, 
          declaraciones.envioPrevia, 
          declaraciones.recepcionAvisoResponsableSolidario, 
          declaraciones.envioDeclaracion, 
          declaraciones.retornoExpediente
        FROM  
          declaraciones 
        INNER JOIN 
          registroaplicaciones ON declaraciones.idRegistroApp = registroaplicaciones.id
        WHERE  
          declaraciones.idRegistroApp = :id;
      `;

      const resultProcessbar = await sequelize.query(queryProcessbar, {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      });

      if (resultProcessbar.length === 0) {
        processbarValue = 0; // Si no hay datos, el proceso no ha avanzado.
      } else {
        const {
          folioDeclaracion,
          opinionCumplimiento,
          fechaGeneracionOpinionCumplimiento,
          fechaEnvioExpediente,
          fechaElaboracionEscrito,
          fechaElaboracionAviso,
          fechaRetornoAvisoFirmado,
          fechaIngresoAviso,
          recepcionPrevia,
          folioResponsableSolidario,
          fechaRecepcionDeclaracion,
          fechaDeclaracion,
          fechaAvisoCliente,
          folioAvisoCliente,
          recepcionAvisoResponsableSolidario,
          envioDeclaracion,
          retornoExpediente,
          idTipoOperacion,
          envioPrevia
        } = resultProcessbar[0];
      
        let elementosRequeridos;
        
        if (idTipoOperacion === 1) {
          elementosRequeridos = [
            folioDeclaracion,
            fechaDeclaracion,
            fechaElaboracionEscrito,
            fechaRetornoAvisoFirmado,
            fechaIngresoAviso,
            folioAvisoCliente,
            opinionCumplimiento,
            fechaGeneracionOpinionCumplimiento,
            fechaEnvioExpediente
          ];
        } else if (idTipoOperacion === 2) {
          elementosRequeridos = [//hyc
            recepcionPrevia,
            envioPrevia,
            recepcionAvisoResponsableSolidario,
            folioResponsableSolidario,
            fechaRecepcionDeclaracion,
            envioDeclaracion,
            folioDeclaracion,
            fechaDeclaracion,
            retornoExpediente,
            fechaAvisoCliente,
            folioAvisoCliente,
            opinionCumplimiento,
            fechaGeneracionOpinionCumplimiento,
            fechaEnvioExpediente
          ];
        } else if (idTipoOperacion === 3) {
          elementosRequeridos = [
            recepcionPrevia,
            fechaElaboracionAviso,
            folioResponsableSolidario,
            fechaRecepcionDeclaracion,
            folioDeclaracion,
            fechaDeclaracion,
            fechaAvisoCliente,
            folioAvisoCliente,
            opinionCumplimiento,
            fechaGeneracionOpinionCumplimiento,
            fechaEnvioExpediente
          ];
        }
      
        const valorPorElemento = 100 / elementosRequeridos.length;
      
        elementosRequeridos.forEach((elemento) => {
          if (elemento) processbarValue += valorPorElemento;
        });
      
        if (processbarValue > 100) processbarValue = 100;
      }
      
      results[0].Processbar = parseFloat(processbarValue.toFixed(2));
      
      res.json([results[0]]);
    } else {
      // Si la validación falla, enviar error de solicitud inválida
      res.status(400).json({
        message: "error",
        details: "Parámetro ID inválido. Asegúrate de que ID sea válido.",
        data: { id }
      });
    }
  } catch (error) {
    console.error('Error fetching registros:', error);
    res.status(500).send('Error del servidor');
  }
});

// --------------------------------- GET ----------------------------------
// --------------------------------- POST ----------------------------------
// NUEVO REGISTRO DE APLICACION
router.post('/nuevo', async (req, res) => {
  try {
    const {
      idCliente,
      mesAplicado,
      anualAplicado,
      idPeriodo,
      anualPeriodo,
      estimulo,
      deal,
      porcentajePromotor,
    } = req.body;

    // Validar que se reciban todos los campos obligatorios
    if (!idCliente || !mesAplicado || !anualAplicado || !idPeriodo) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios.'
      });
    }

    // Recuperar datos del cliente
    const cliente = await Cliente.findOne({
      where: { id: idCliente },
      attributes: [
        'idPlaza',
        'idPromotor',
        'idGrupo',
        'idTipoCliente',
        'idTipoOperacion',
        'idTipoServicio'
      ]
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado.'
      });
    }

    // Crear un nuevo registro en la tabla registro_aplicacion
    const nuevoRegistro = await RegistroAplicaciones.create({
      idCliente,
      idPlaza: cliente.idPlaza,
      idPromotor: cliente.idPromotor,
      idGrupo: cliente.idGrupo,
      idTipoCliente: cliente.idTipoCliente,
      idTipoOperacion: cliente.idTipoOperacion,
      idTipoServicio: cliente.idTipoServicio,
      subtotal: 0,
      ivaCliente: 0,
      isrPmorales: 0,
      isrRetencionesSalarios: 0,
      isrRetencionesAsim: 0,
      isrRetencionesServ: 0,
      mesAplicado,
      anualAplicado,
      porcentajeDsb: 20,
      ivaFacturacion: 16,
      total:0,
      montoDsb:0,
      ahorro:0,
      montoPromotor:0,
      idPeriodo,
      anualPeriodo,
      estimulo,
      deal,
      porcentajePromotor,
      status: 1 // Asumiendo que el valor predeterminado es 1
    });
    
    const registrodecl=await declaraciones.create({
      idRegistroApp: nuevoRegistro.id,
      status: 1

    });

    const nuevoComentario = await ComentariosAplicacion.create({
      idAplicacion:nuevoRegistro.id
    });

    // Responder con el nuevo registro
    return res.status(201).json({
      message: "success",
      details: 'Registro creado exitosamente',
      data: nuevoRegistro
    }); 
  
    
  } catch (error) {
    console.error('Error al crear el registro:', error);
    return res.status(500).json({
      message: "error",
      details: 'Error al crear el registro',
      error: error.message || 'Error interno del servidor'
    });
  }
});

const esFechaValida = (fecha) => {
  return !isNaN(new Date(fecha).getTime());
};



router.put('/editar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // Extraer comentarios dinámicamente
    const comentarios = {};
    Object.keys(body).forEach((key) => {
      const match = key.match(/^Comentario\[(\d+)\]$/); // Detecta claves como Comentario[71]
      if (match) {
        const comentarioId = match[1]; // Extrae el ID entre corchetes
        comentarios[comentarioId] = body[key]?.trim() || null; // Si está vacío o solo espacios, asigna null
      }
    });

    console.log("Comentarios extraídos:", comentarios);

    // Actualizar los comentarios en la tabla ComentariosAplicacion
    for (const [comentarioId, comentarioTexto] of Object.entries(comentarios)) {
      const updateResult = await ComentariosAplicacion.update(
        { Comentario: comentarioTexto }, // Puede ser texto o null
        { where: { idAplicacion: comentarioId } }
      );
      console.log(`Comentario ${comentarioId} actualizado:`, updateResult);
    }

    const validarDecimal = (valor) => {
      const valorStr = String(valor).trim();
      return !isNaN(valorStr) && valorStr !== "" ? new Decimal(valorStr) : new Decimal(0);
    };

    const {
      bandera = null,
      recepcionPrevia = null,
      fechaElaboracionAviso = null,
      folioResponsableSolidario = null,
      fechaRecepcionDeclaracion = null,
      folioDeclaracion = null,
      fechaDeclaracion = null,
      fechaAvisoCliente = null,
      folioAvisoCliente = null,
      opinionCumplimiento = null,
      fechaGeneracionOpinionCumplimiento = null,
      fechaEnvioExpediente = null,
      fechaElaboracionEscrito = null,
      fechaRetornoAvisoFirmado = null,
      fechaIngresoAviso = null,
      envioPrevia = null,
      recepcionAvisoResponsableSolidario = null,
      envioDeclaracion = null,
      retornoExpediente = null,
      ivaCliente = null,
      isrPmorales = null,
      isrRetencionesSalarios = null,
      isrRetencionesAsim = null,
      isrRetencionesServ = null,
      deal = null,
      porcentajePromotor = null,
      ivaFacturacion = null,
      porcentajeDsb = null,
    } = body;

    const ivaClienteValue = validarDecimal(ivaCliente);
    const isrPmoralesValue = validarDecimal(isrPmorales);
    const isrRetencionesSalariosValue = validarDecimal(isrRetencionesSalarios);
    const isrRetencionesAsimValue = validarDecimal(isrRetencionesAsim);
    const isrRetencionesServValue = validarDecimal(isrRetencionesServ);

    const totalImpuestos = ivaClienteValue
      .plus(isrPmoralesValue)
      .plus(isrRetencionesSalariosValue)
      .plus(isrRetencionesAsimValue)
      .plus(isrRetencionesServValue);

    if (totalImpuestos.isZero()) {
      return res.status(400).json({
        message: "error",
        details: 'El total de impuestos no puede ser 0.'
      });
    }

    const registro = await RegistroAplicaciones.findOne({ where: { id } });

    if (!registro) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado.'
      });
    }

    let porcentajeDsbValue = porcentajeDsb
      ? validarDecimal(porcentajeDsb).dividedBy(100)
      : new Decimal(0.20);

    let dealValue = deal
      ? validarDecimal(deal).dividedBy(100)
      : validarDecimal(registro.deal).dividedBy(100);

    let porcentajePromotorValue = porcentajePromotor
      ? validarDecimal(porcentajePromotor).dividedBy(100)
      : validarDecimal(registro.porcentajePromotor).dividedBy(100);

    const ivaCalculed = ivaFacturacion
      ? validarDecimal(ivaFacturacion).dividedBy(100)
      : new Decimal(0);

    const subtotalCalculated = totalImpuestos.times(dealValue);
    const totalFacturado = subtotalCalculated.times(ivaCalculed.plus(1));
    let IvaCalculadosa = totalFacturado.minus(subtotalCalculated);
    const totalFinal = ivaFacturacion === 0 ? subtotalCalculated : totalFacturado;
    IvaCalculadosa=validarDecimal(IvaCalculadosa);
    const montoPromotorCalculated = totalImpuestos.times(porcentajePromotorValue);
    const montoDsbCalculated = totalImpuestos.times(porcentajeDsbValue);
    const ahorroCalculated = totalImpuestos.minus(subtotalCalculated);

    let results2 = await registro.update({
      ivaCliente: ivaClienteValue.toNumber(),
      isrPmorales: isrPmoralesValue.toNumber(),
      isrRetencionesSalarios: isrRetencionesSalariosValue.toNumber(),
      isrRetencionesAsim: isrRetencionesAsimValue.toNumber(),
      isrRetencionesServ: isrRetencionesServValue,
      deal: dealValue.toNumber() * 100,
      subtotal: subtotalCalculated.toNumber(),
      porcentajePromotor: porcentajePromotorValue.toNumber() * 100,
      ivaFacturacion: ivaCalculed.toNumber() * 100,
      total: totalFinal.toNumber(),
      porcentajeDsb: porcentajeDsbValue.toNumber() * 100,
      montoPromotor: montoPromotorCalculated.toNumber(),
      montoDsb: montoDsbCalculated.toNumber(),
      ahorro: ahorroCalculated.toNumber(),
      estimulo: totalImpuestos.toNumber(),
    }, {
      returning: true
    });

    const sanitizeField = (value) => {
      if (typeof value === "string" && value.trim() === "") {
        return null;
      }
      return value;
    };

    const camposActualizar = {
      status: 1,
      recepcionPrevia: sanitizeField(recepcionPrevia),
      folioResponsableSolidario: sanitizeField(folioResponsableSolidario),
      fechaRecepcionDeclaracion: sanitizeField(fechaRecepcionDeclaracion),
      folioDeclaracion: sanitizeField(folioDeclaracion),
      opinionCumplimiento: sanitizeField(opinionCumplimiento),
      fechaGeneracionOpinionCumplimiento: sanitizeField(fechaGeneracionOpinionCumplimiento),
      fechaEnvioExpediente: sanitizeField(fechaEnvioExpediente),
      envioPrevia: sanitizeField(envioPrevia),
      recepcionAvisoResponsableSolidario: sanitizeField(recepcionAvisoResponsableSolidario),
      envioDeclaracion: sanitizeField(envioDeclaracion),
      retornoExpediente: sanitizeField(retornoExpediente),
      fechaElaboracionAviso: sanitizeField(fechaElaboracionAviso),
      folioAvisoCliente: sanitizeField(folioAvisoCliente),
      fechaDeclaracion: sanitizeField(fechaDeclaracion),
      fechaAvisoCliente: sanitizeField(fechaAvisoCliente),
      fechaElaboracionEscrito: sanitizeField(fechaElaboracionEscrito),
      fechaRetornoAvisoFirmado: sanitizeField(fechaRetornoAvisoFirmado),
      fechaIngresoAviso: sanitizeField(fechaIngresoAviso),
    };

    if (bandera === "1" || bandera === "2" || bandera === "3") {
      await declaraciones.update(camposActualizar, { where: { idRegistroApp: id } });
    }
    

    const [result23] = await sequelize.query(
      `SELECT 
        registroaplicaciones.estimulo AS totalEstimulo

      FROM 
        registroaplicaciones
      INNER JOIN 
        clientes ON registroaplicaciones.idCliente = clientes.id
      INNER JOIN 
        periodos ON registroaplicaciones.idPeriodo = periodos.id
      INNER JOIN 
        promotores ON clientes.idPromotor = promotores.id
      INNER JOIN 
        grupos ON clientes.idGrupo = grupos.id
      INNER JOIN 
        declaraciones ON registroaplicaciones.id = declaraciones.idRegistroApp 
      INNER JOIN 
        comentariosaplicacions ON registroaplicaciones.id = comentariosaplicacions.idAplicacion 
      WHERE 
        registroaplicaciones.id = :id`,
      {
        replacements: { id }
      }
    );


    const formattedIvaCalculadosa = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(IvaCalculadosa);

    // Formatear ivaCalculado como moneda
    result23[0].totalEstimulo = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(result23[0].totalEstimulo);

    return res.status(200).json({
      message: "success",
      details: 'Registro actualizado exitosamente',
      data: results2,
      data2:formattedIvaCalculadosa,
      data3:result23[0].totalEstimulo
    });
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    return res.status(500).json({
      message: "error",
      details: 'Error al actualizar el registro',
      error: error.message || 'Error interno del servidor'
    });
  }
});








//===============================================================END POINTS POST 



router.get('/Processbar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'El ID es necesario' });
    }

    let query = `
      SELECT 
        registroaplicaciones.idTipoOperacion,
        declaraciones.idRegistroApp, 
        declaraciones.status, 
        declaraciones.fechaElaboracionAviso,
        declaraciones.recepcionPrevia, 
        declaraciones.fechaElaboracionAviso, 
        declaraciones.folioResponsableSolidario, 
        declaraciones.fechaRecepcionDeclaracion, 
        declaraciones.folioDeclaracion, 
        declaraciones.fechaDeclaracion, 
        declaraciones.fechaAvisoCliente, 
        declaraciones.folioAvisoCliente, 
        declaraciones.opinionCumplimiento, 
        declaraciones.fechaGeneracionOpinionCumplimiento, 
        declaraciones.fechaEnvioExpediente, 
        declaraciones.fechaElaboracionEscrito, 
        declaraciones.fechaRetornoAvisoFirmado, 
        declaraciones.fechaIngresoAviso, 
        declaraciones.envioPrevia, 
        declaraciones.recepcionAvisoResponsableSolidario, 
        declaraciones.envioDeclaracion, 
        declaraciones.retornoExpediente
      FROM  
        declaraciones 
      INNER JOIN 
        registroaplicaciones ON declaraciones.idRegistroApp = registroaplicaciones.id
      WHERE  
        declaraciones.idRegistroApp = :id;
    `;

    const result = await sequelize.query(query, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'No se encontraron datos para el ID proporcionado' });
    }

    const {
      folioDeclaracion,
      opinionCumplimiento,
      fechaGeneracionOpinionCumplimiento,
      fechaEnvioExpediente,
      fechaElaboracionEscrito,
      fechaElaboracionAviso,
      fechaRetornoAvisoFirmado,
      fechaIngresoAviso,
      recepcionPrevia,
      folioResponsableSolidario,
      fechaRecepcionDeclaracion,
      fechaDeclaracion,
      fechaAvisoCliente,
      folioAvisoCliente,
      recepcionAvisoResponsableSolidario,
      envioDeclaracion,
      retornoExpediente,
      idTipoOperacion
    } = result[0];

    let processbarValue = 0;

    if (idTipoOperacion === 1) {
      if (folioDeclaracion) processbarValue += 14.22;
      if (opinionCumplimiento) processbarValue += 14.22;
      if (fechaGeneracionOpinionCumplimiento) processbarValue += 14.22;
      if (fechaEnvioExpediente) processbarValue += 14.22;
      if (fechaElaboracionEscrito) processbarValue += 14.22;
      if (fechaRetornoAvisoFirmado) processbarValue += 14.22;
      if (fechaIngresoAviso) processbarValue += 14.22;

      if (processbarValue >= 100) processbarValue = 100;

      return res.json({ Processbar: processbarValue.toFixed(2) });

    } else if (idTipoOperacion === 2) {
      if (recepcionPrevia) processbarValue += 10;
      if (folioResponsableSolidario) processbarValue += 10;
      if (fechaRecepcionDeclaracion) processbarValue += 10;
      if (folioDeclaracion) processbarValue += 10;
      if (opinionCumplimiento) processbarValue += 10;
      if (fechaGeneracionOpinionCumplimiento) processbarValue += 10;
      if (fechaEnvioExpediente) processbarValue += 10;
      if (envioPrevia) processbarValue += 10;
      if (recepcionAvisoResponsableSolidario) processbarValue += 10;
      if (envioDeclaracion) processbarValue += 10;
      if (retornoExpediente) processbarValue += 10;

      if (processbarValue >= 100) processbarValue = 100;

      return res.json({ Processbar: processbarValue.toFixed(2) });

    } else if (idTipoOperacion === 3) {
      if (recepcionPrevia) processbarValue += 9.09091;
      if (fechaElaboracionAviso) processbarValue += 9.09091;
      if (folioResponsableSolidario) processbarValue += 9.09091;
      if (fechaRecepcionDeclaracion) processbarValue += 9.09091;
      if (folioDeclaracion) processbarValue += 9.09091;
      if (fechaDeclaracion) processbarValue += 9.09091;
      if (fechaAvisoCliente) processbarValue += 9.09091;
      if (folioAvisoCliente) processbarValue += 9.09091;
      if (opinionCumplimiento) processbarValue += 9.09091;
      if (fechaGeneracionOpinionCumplimiento) processbarValue += 9.09091;
      if (fechaEnvioExpediente) processbarValue += 9.09091;

      if (processbarValue >= 100) processbarValue = 100;

      return res.json({ Processbar: processbarValue.toFixed(2) });
      
    } else {
      res.status(400).json({ error: 'Tipo de operación no compatible' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al ejecutar la consulta' });
  }
});
//============================================================================================
router.get('/aplicaciones/filtrar', async (req, res) => { 
  try {
    let { mes, year, operacion } = req.query;

    // Consulta para obtener los clientes que tienen registros de aplicaciones válidos
    let queryClientes = `
      SELECT DISTINCT
          clientes.id AS id, 
          clientes.razonSocial
      FROM 
          clientes
      WHERE 
          EXISTS (
              SELECT 1
              FROM registroaplicaciones
              WHERE registroaplicaciones.idCliente = clientes.id
                AND registroaplicaciones.idTipoOperacion = :operacion
                AND registroaplicaciones.mesAplicado = :mes
                AND registroaplicaciones.anualAplicado = :year
          );
    `;

    // Consulta para obtener las aplicaciones por cliente con los filtros aplicados
    let queryAplicaciones = `
      SELECT 
          registroaplicaciones.id AS idAplicacion,
          registroaplicaciones.idCliente,
          clientes.razonSocial,
          grupos.nombre AS grupo,
          registroaplicaciones.mesAplicado,
          registroaplicaciones.anualPeriodo,
          registroaplicaciones.estimulo
      FROM 
          registroaplicaciones
      INNER JOIN 
          clientes ON registroaplicaciones.idCliente = clientes.id
      INNER JOIN 
          grupos ON clientes.idGrupo = grupos.id
      WHERE 
          registroaplicaciones.idTipoOperacion = :operacion
          AND registroaplicaciones.mesAplicado = :mes
          AND registroaplicaciones.anualAplicado = :year
          AND registroaplicaciones.id NOT IN(SELECT idRegistro FROM cobroaplicaciones);
    `;

    // Ejecutar la consulta de clientes
    const clientes = await sequelize.query(queryClientes, {
      replacements: { mes, year, operacion },
      type: sequelize.QueryTypes.SELECT
    });

    if (!clientes.length) {
      return res.status(404).json({
        message: "error",
        details: 'Error al encontrar registros.'
      });
    }

    // Generar una lista de IDs de clientes obtenidos en la primera consulta
    const clienteIds = clientes.map(cliente => cliente.id);

    // Ejecutar la consulta de aplicaciones con filtros
    const aplicaciones = await sequelize.query(queryAplicaciones, {
      replacements: { mes, year, operacion },
      type: sequelize.QueryTypes.SELECT
    });

    // Construir el JSON solicitado
    const response = clientes
      .map(cliente => {
        const clienteAplicaciones = aplicaciones
          .filter(app => app.idCliente === cliente.id)
          .map(app => ({
            idAplicacion: app.idAplicacion,
            razonSocial: app.razonSocial,
            grupo: app.grupo || "N/A",
            mesAplicado: app.mesAplicado,
            anualPeriodo: app.anualPeriodo,
            estimulo: new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(app.estimulo)
          }));

        // Solo incluir el cliente en la respuesta si tiene aplicaciones
        if (clienteAplicaciones.length > 0) {
          return {
            idCliente: cliente.id,
            razonSocial: cliente.razonSocial,
            aplicaciones: clienteAplicaciones
          };
        }
        return null; // Si no tiene aplicaciones, no devolver el cliente
      })
      .filter(cliente => cliente !== null); // Filtra los clientes con aplicaciones vacías

    // Devolver la respuesta
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al procesar la solicitud.' });
  }
});



module.exports = router;
