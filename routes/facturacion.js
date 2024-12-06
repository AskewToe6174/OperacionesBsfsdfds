const express = require('express');
const router = express.Router();
const cors = require('cors');
const { sequelize, Facturas } = require('../models');
const { TipoFacturas } = require('../models') 
const {CobroAplicaciones}=require('../models');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

//facturacion
//obtener facturas
router.get('/', async (req, res) => {
  try {
    let { razonsocial, mes, year, pendiente } = req.query;

    // Ensure 'pendiente' is a valid string, fallback to null or other default if undefined
    pendiente = pendiente !== undefined ? String(pendiente) : null;

    // Other parameters
    const anio = year || null;
    const month = mes || null;

    // Base SQL query
    let query = `
      SELECT 
        facturas.id AS idFactura,
        facturas.folioFactura,
        facturas.nombreAFacturar AS razonSocial,
        facturas.deal,
        facturas.subtotal,
        facturas.montoIva,
        facturas.totalFactura,
        statuspagos.nombre AS statusPago,
        tipofacturas.nombre AS tipoFactura
      FROM facturas
      INNER JOIN statuspagos ON facturas.idStatus = statuspagos.id
      INNER JOIN tipofacturas ON facturas.idTipoFactura = tipofacturas.id
    `;
    
    // Initialize conditions and replacements
    let conditions = [];
    let replacements = {};

    // Apply filters if parameters are provided
    if (razonsocial) {
      conditions.push("facturas.nombreAFacturar  = :razonsocial");
      replacements.razonsocial = razonsocial; // Correct key for replacement
    }

    if (month) {
      conditions.push("MONTH(facturas.createdAt) = :mes");
      replacements.mes = month;
    }

    if (anio) {
      conditions.push("YEAR(facturas.createdAt) = :anio");
      replacements.anio = anio;
    }

    if (pendiente) {
      conditions.push("facturas.idStatus = :pendiente");
      replacements.pendiente = pendiente;
    } else {
      // Default to status 1 or 3 if 'pendiente' is not provided
      conditions.push("facturas.idStatus IN (2, 3)");
    }

    // If conditions exist, append them to the query
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    // Execute query with parameter replacements
    const [resultsFacturas] = await sequelize.query(query, { replacements });

    // Format the results
    const formattedResults = resultsFacturas.map(factura => {
      // Formatear la moneda (MXN) usando Intl.NumberFormat
      const formatCurrency = (value) => {
        return value != null ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value) : '$0.00';
      };

      // Formatear el porcentaje del 'deal'
      const formatDeal = (value) => {
        return value != null ? `${value}%` : '0.00%';
      };

      return {
        ...factura,
        subtotal: formatCurrency(factura.subtotal),
        montoIva: formatCurrency(factura.montoIva),
        totalFactura: formatCurrency(factura.totalFactura),
        deal: formatDeal(factura.deal)
      };
    });

    // Return formatted results
    res.json(formattedResults);

  } catch (error) {
    console.error('Error al obtener las facturas:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});





router.get('/:id/aplicaciones/', async (req, res) => {
  const { id } = req.params;

  try {
    const resultsFacturaAplicacion = await sequelize.query(
      `SELECT cobroaplicaciones.id AS idCobro, facturas.folioFactura, facturas.nombreAFacturar AS nombre, facturas.deal, cobroaplicaciones.cobro, cobroaplicaciones.pagado, cobroaplicaciones.montoTotal, cobroaplicaciones.cobro
       FROM cobroaplicaciones
       INNER JOIN facturas ON cobroaplicaciones.idFactura = facturas.id
       WHERE cobroaplicaciones.idFactura = :id`,
      {
        replacements: { id }, // Reemplazo seguro del valor
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (resultsFacturaAplicacion.length > 0) {
      // Formatear los resultados
      const formattedResults = resultsFacturaAplicacion.map(aplicacion => {
        // Formatear la moneda (MXN) usando Intl.NumberFormat
        const formatCurrency = (value) => {
          return value != null ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value) : '$0.00';
        };

        // Formatear el porcentaje del 'deal'
        const formatDeal = (value) => {
          return value != null ? `${value}%` : '0.00%';
        };

        return {
          ...aplicacion,
          cobro: formatCurrency(aplicacion.cobro),
          pagado: formatCurrency(aplicacion.pagado),
          montoTotal: formatCurrency(aplicacion.montoTotal),
          deal: formatDeal(aplicacion.deal)
        };
      });

      res.json({
        message: 'success',
        data: formattedResults
      });
    } else {
      // Si no se encuentran resultados, enviamos un mensaje indicando esto
      res.status(404).json({
        message: 'success',
        details: 'No se encontraron aplicaciones'
      });
    }

  } catch (error) {
    console.error('Error al obtener las aplicaciones:', error);
    res.status(500).send('Error del servidor');
  }
});

//========================================================================== Lo de la factura nueva con las aplicaciones
router.post('/nueva', async (req, res) => {
  try {
    // Extraemos los valores directamente del cuerpo de la solicitud
    const { TipoFactura, folioFactura, nombreAFacturar } = req.body;

    // Las aplicaciones se reciben como claves 'aplicacion[0]', 'aplicacion[1]', etc.
    const aplicaciones = [];
    
    // Filtramos todas las claves que corresponden a 'aplicacion[n]' y las agregamos al array
    for (const key in req.body) {
      if (key.startsWith('aplicacion[')) {
        aplicaciones.push(parseInt(req.body[key].trim())); // Convertimos a entero
      }
    }

    // Verificamos que al menos haya una aplicación
    if (aplicaciones.length === 0) {
      return res.status(400).json({
        message: "error",
        details: 'El campo aplicacion es requerido y debe contener al menos un valor.'});
    }

    // Consulta 1: Obtener los totales generales para la factura
    const resultFactura = await sequelize.query(
      `SELECT SUM(subtotal) AS subtotal, 
              SUM(total) AS totalgeneral, 
              deal
       FROM operacionesdev.registroaplicaciones
       WHERE id IN (:ids)
       GROUP BY deal;`, {
        replacements: { ids: aplicaciones },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (resultFactura.length === 0) {
      return res.status(404).json({
        message: "error",
        details: 'No se encontraron registros de aplicaciones con los IDs proporcionados.'});
    }

    let totalSubtotal = 0;
    let totalGeneral = 0;
    let montoIva = 0;
    let deal = null;

    // Obtener los totales generales y deal para la factura
    resultFactura.forEach(row => {
      totalSubtotal += row.subtotal || 0;
      totalGeneral += row.totalgeneral || 0;
      deal = row.deal;  // Se asume que sólo hay un deal (si hay más, se puede agregar validación)
    });

    montoIva = totalGeneral - totalSubtotal;

    // Crear la factura
    const factura = await Facturas.create({
      idTipoFactura: TipoFactura,
      folioFactura: folioFactura,
      nombreAFacturar: nombreAFacturar,
      subtotal: totalSubtotal,
      totalFactura: totalGeneral,
      deal: deal,
      montoIva: montoIva,
      idStatus: 3,  // Estado de la factura (por ejemplo, "Cobrado")
    });

    // Consulta 2: Obtener los detalles de cada aplicación, incluyendo idRegistro
    const resultAplicaciones = await sequelize.query(
      `SELECT id, subtotal, total, deal  -- Incluimos idRegistro
       FROM operacionesdev.registroaplicaciones
       WHERE id IN (:ids);`, {
        replacements: { ids: aplicaciones },
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Preparar los datos para insertar en CobroAplicaciones
    const cobros = resultAplicaciones.map(row => ({
      idFactura: factura.id,        // ID de la factura recién creada
      idRegistro: row.id,           // Extraemos idRegistro de la consulta
      idStatusCobro: 1,             // Cobro en 0
      cobro: 0,
      pagado: 0, 
      remanente: 0,                 // Pagado en 0
      montoTotal: row.total,        // Monto total de la aplicación
      liberado: 0,                  // Liberado en 0
      fechaCobro: new Date()        // Fecha actual de cobro
    }));

    // Insertar los registros en operacionesdev.cobroaplicaciones
    await sequelize.models.CobroAplicaciones.bulkCreate(cobros);

    const jsonResponse = {
      facturaId: factura.id,
      TipoFactura,
      folioFactura,
      nombreAFacturar,
      subtotal: totalSubtotal,
      totalgeneral: totalGeneral,
      deal,
      montoIva
    };
    
    return res.status(200).json({
      message: "success",
      details: 'Factura generada exitosamente',
      data: jsonResponse,  // Aquí estamos retornando el objeto jsonResponse en "data"
    });    
  } catch (error) {
    return res.status(500).json({
      message: "error",
      details: 'Error interno del servidor al generar factura llame al administrador',
    });
  }
});




/*
{
  "TipoFactura": "valor1",
  "folioFactura": "valor2",
  "nombreAFacturar": "valor3",
  "IdAplicaciones": "1,20,34"
}
*/
//===========================================================Obtener todas los tipos de factura 
router.get('/TipoFactura', async (req, res) => {
  try {
    const tipoFacturas = await TipoFacturas.findAll({
      attributes: ['id', 'nombre'],
    });
    res.json(tipoFacturas);
  } catch (error) {
    console.error('Error fetching TipoFacturas:', error);
    res.status(500).send('Server error');
  }
});




module.exports = router;

