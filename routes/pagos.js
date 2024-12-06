const express = require('express');
const router = express.Router();
const cors = require('cors');
const { sequelize, Facturas } = require('../models');
const { TipoFacturas } = require('../models') 
const {PagosAplicaciones}=require('../models');
const{PagosAplicacionesProvedores}=require('../models');
const{PagosProveedoresMensuales}=require('../models');
const{CuotaActualMensual}=require('../models');

const { Op } = require('sequelize');
const Sequelize = require('sequelize');

router.use(express.json());
router.use(cors({
  origin: 'http://localhost' // Permite solo el origen http://localhost
}));
//===========================================================GetPagosPromotores
router.get('/promotores', async (req, res) => {
  let { promotor } = req.query;
  
  try {
    // Comenzamos a construir la consulta SQL
    let query = `
      SELECT 
          r.id AS idRegistro,    
          p.id AS Idpromotor,
          p.nombre as NombrePromotor,
          cl.razonSocial,
          c.montoTotal,              
          st.nombre,
          c.liberado,
          c.fechaCobro 
      FROM 
          registroaplicaciones r
      INNER JOIN 
          cobroaplicaciones c ON r.id = c.idRegistro  
      INNER JOIN 
          promotores p ON r.idPromotor = p.id
      INNER JOIN
          clientes cl ON r.idCliente = cl.id
      INNER JOIN 
          statuspagos st ON c.idStatusCobro = st.id
      WHERE 
          c.liberado = 1
      AND NOT EXISTS (
          SELECT *
          FROM pagosaplicaciones pa
          WHERE pa.idAplicacion = r.id
        )
    `;
  
    // Si se proporciona el promotor, agregamos la condición adicional
    if (promotor) {
      query += ` AND p.id = :promotor`;  // Usamos 'AND' para agregar el filtro
    }

    // Ejecutar la consulta
    const result = await sequelize.query(query, {
      replacements: { 
        promotor  // Pasamos el promotor directamente
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Función para formatear el monto como moneda
    const formatCurrency = (amount) => {
      if (amount !== null && !isNaN(amount)) {
        return '$' + parseFloat(amount).toLocaleString('es-MX', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
      } else {
        return '$0.00'; // Si el valor es nulo o no es un número, retornar $0.00
      }
    };
    
    const transformedResult = result.map(item => {
      item.montoTotal = formatCurrency(item.montoTotal);
      
      
      return item;
    });

    res.json(transformedResult);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al ejecutar la consulta' });
  }
});

  

router.get('/HnC/:mes/:year', async (req, res) => {
  let { mes,year  } = req.params;
  
  try {
    year = parseInt(year);
    mes = parseInt(mes);

    if (isNaN(year) || isNaN(mes)) {
      return res.status(400).json({
        message: 'El año y el mes deben ser números válidos.'
      });
    }

    let query = `
      SELECT 
          r.idTipoOperacion AS TipoOperacion,
          r.mesAplicado,
          r.anualAplicado,
          r.id AS idRegistro,
          r.estimulo,
          r.deal,
          r.total,
          r.idCliente,
          r.porcentajeProveedor,
          cl.razonSocial AS RazonSocial
      FROM 
          registroaplicaciones r
      INNER JOIN
          clientes cl ON r.idCliente = cl.id
      WHERE 
          r.idTipoOperacion = 2
          AND NOT EXISTS (
              SELECT *
              FROM pagosaplicacionesprovedores pa
              WHERE pa.idAplicacion = r.id
          )
          AND r.mesAplicado = :mes 
          AND r.anualAplicado = :year;  
    `;
  
    // Ejecutar la consulta con los valores de `mes` y `year`
    const result = await sequelize.query(query, {
      replacements: { mes, year }, // Pasamos los valores a la consulta
      type: sequelize.QueryTypes.SELECT // Aseguramos que la consulta se ejecute como SELECT
    });

    // Función para formatear el total y estimulo con el símbolo de $ y comas
    const formatCurrency = (amount) => {
      if (amount !== null && !isNaN(amount)) {
        // Aseguramos que el valor es un número válido antes de formatear
        return '$' + parseFloat(amount).toLocaleString('es-MX', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
      } else {
        return '$0.00'; // Si el valor es nulo o no es un número, retornamos $0.00
      }
    };
  
    // Transformar el resultado
    const transformedResult = result.map(item => {
      // Formatear 'deal' como porcentaje
      if (item.deal !== null && !isNaN(item.deal)) {
        item.deal = (item.deal * 1).toFixed(2) + '%';
      }
      // Formatear 'total' como moneda
      item.total = formatCurrency(item.total);
      // Formatear 'estimulo' como moneda
      item.estimulo = formatCurrency(item.estimulo);
      return item;
    });
  
    // Enviar la respuesta con los resultados transformados
    res.status(200).json(transformedResult);
  
  } catch (error) {
    console.error('Error fetching Pagos HnC :', error);
    res.status(500).json({
      message: 'An error occurred while fetching Pagos Promotores',
      error: error.message
    });
  }
});


router.post('/provedor', async (req, res) => {
  try {
    const { Aplicacionespagadas, comentarios } = req.body;

    if (!Aplicacionespagadas || !Array.isArray(Aplicacionespagadas) || Aplicacionespagadas.length === 0) {
      return res.status(400).json({ message: 'Debe proporcionar un array de Aplicacionespagadas' });
    }

    const comentario = comentarios || null;
    const pagosRegistrados = [];

    for (const idAplicacion of Aplicacionespagadas) {
      const data = await sequelize.query(
        `SELECT  
            r.id AS idAplicacion,
            r.idTipoOperacion AS idProvedor,
            r.montoProveedor AS montoPagado,
            c.idStatusCobro
        FROM
            operacionesdev.registroaplicaciones r
        LEFT JOIN
            cobroaplicaciones c ON r.id = c.idRegistro
        LEFT JOIN
            statuspagos st ON c.idStatusCobro = st.id
        WHERE
            r.id = :idAplicacion`,
        {
          replacements: { idAplicacion },
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log('Resultado de la consulta:', data);

      if (!data || data.length === 0) {
        return res.status(404).json({ message: `Aplicación ${idAplicacion} no encontrada` });
      }

      const { idProvedor, montoPagado, idStatusCobro } = data[0];

      console.log('Datos desestructurados:', { idAplicacion, idProvedor, montoPagado, idStatusCobro });

      try {
        const nuevoPago = await PagosAplicacionesProvedores.create({
          idAplicacion,
          idProvedor,
          montoPagado,
          idStatusPago: idStatusCobro,
          Status: 1,
          comentarios: comentario,
        });
        console.log('Pago registrado:', nuevoPago);
        pagosRegistrados.push(nuevoPago);
      } catch (error) {
        console.error('Error al crear el registro:', error);
      }
    }

    console.log('Pagos registrados:', pagosRegistrados);
    res.status(201).json({
      message: "success",
      datails: 'Registro actualizado exitosamente',
      data: pagosRegistrados,
    });

  } catch (error) {
    console.error('Error al registrar pagos:', error);
    res.status(500).json({
      message:"error",
      message: 'Ocurrió un error al registrar los pagos',
    });
  }
});

  

  //================================Registrar pagos==============================
  router.post('/promotor', async (req, res) => {
    try {
      const { idAplicacion, comentarios } = req.body;
  
      // Verificación de idAplicacion
      if (!idAplicacion) {
        return res.status(400).json({ message: 'idAplicacion es obligatorio' });
      }
  
      // Consulta para obtener los datos necesarios
      const aplicacionData = await sequelize.query(
        `SELECT 
            r.id AS idAplicacion, 
            r.idPromotor, 
            r.montoPromotor AS montoPagado, 
            c.idStatusCobro
        FROM 
            operacionesdev.registroaplicaciones r
        INNER JOIN 
            cobroaplicaciones c ON r.id = c.idRegistro
        INNER JOIN 
            statuspagos st ON c.idStatusCobro = st.id
        WHERE 
            r.id = :idAplicacion`,
        {
          replacements: { idAplicacion },
          type: sequelize.QueryTypes.SELECT
        }
      );
  
      // Verificar si se encontró la aplicación
      if (!aplicacionData || aplicacionData.length === 0) {
        return res.status(404).json({ message: 'Aplicación no encontrada' });
      }
  
      // Extraer la información de la consulta
      const { idPromotor, montoPagado, idStatusCobro } = aplicacionData[0];
  
      // Crear el nuevo registro en PagosAplicaciones sin verificaciones adicionales
      const nuevoPago = await PagosAplicaciones.create({
        idAplicacion,
        idPromotor,
        montoPagado,
        idStatusPago: idStatusCobro,
        Status: 1,
        comentarios,
      });
  
      res.status(201).json({
        message: 'sucess',
        details: "Pago hecho exitosamente",
        data: nuevoPago
      });
  
    } catch (error) {
      console.error('Error al registrar pago:', error);
      res.status(500).json({
        message: 'error',
        details:error.message
      });
    }
  });
  


//======================Registrar pagos provedores mensuales==============================

router.post('/mensuales', async (req, res) => {
  try {
    const { toperacion, monto, comentarios } = req.body;

    if (!toperacion || !monto) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Creating a new "Pago Proveedor Mensual"
    const nuevoPagomensual = await PagosProveedoresMensuales.create({
      idtipooperacion:toperacion,
      monto,
      status: 1,  
      comentarios,
    });

    return res.status(201).json({
      message: 'Pago mensual registrado con éxito',
      data: nuevoPagomensual,
    });

  } catch (error) {
    console.error('Error al registrar pago mensual:', error);
    
    return res.status(500).json({
      message: 'Hubo un error al registrar el pago mensual.',
      error: error.message || error,
    });
  }
});


//===========================Obtener registros de pagos(GET) registrarpagoprovedores==============================

router.get('/historial/provedores', async (req, res) => {
  try {
    // Obtén el año y mes de los parámetros de consulta en la URL
    const { year, month } = req.query;

    // Define la consulta base
    let query = `
      
      SELECT 
          a.idAplicacion, 
          c.razonSocial,
          p.nombre, 
          a.montoPagado, 
          s.nombre AS Status, 
          a.comentarios
      FROM 
          pagosaplicacionesprovedores a
      LEFT JOIN 
          statuspagos s ON a.idStatusPago = s.id
      LEFT JOIN 
          tipooperacions p ON a.idProvedor = p.id
	  LEFT JOIN 
			registroaplicaciones r on a.idAplicacion=r.id
	  LEFT JOIN	
			clientes c on r.idCliente=c.id
      WHERE 1=1
	  AND r.idTipoOperacion=2
    `;

    // Agrega los filtros solo si existen
    if (year) {
      query += ` AND YEAR(a.createdAt) = ${sequelize.escape(year)}`;
    }
    if (month) {
      query += ` AND MONTH(a.createdAt) = ${sequelize.escape(month)}`;
    }

    const result = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

    // Función para formatear el monto como moneda
    const formatCurrency = (amount) => {
      if (amount !== null && !isNaN(amount)) {
        return '$' + parseFloat(amount).toLocaleString('es-MX', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
      } else {
        return '$0.00';
      }
    };

    // Transformar el resultado
    const transformedResult = result.map(item => {
      // Formatear 'montoPagado' como moneda
      item.montoPagado = formatCurrency(item.montoPagado);
      return item;
    });

    // Enviar la respuesta con los resultados transformados
    res.status(200).json(transformedResult);

  } catch (error) {
    console.error('Error fetching Pagos promotores', error);
    res.status(500).json({
      message: 'An error occurred while fetching Pagos Promotores',
      error: error.message
    });
  }
});
//===========================Obtener registros de pagos(GET) registrarpagopromotores PagosAplicaciones==============================
router.get('/historial/promotores', async (req, res) => {
  try {
    // Obtén el año y mes de los parámetros de consulta en la URL
    const { year, month } = req.query;

    // Define la consulta base
    let query = `
      SELECT 
          a.idAplicacion, 
          p.nombre, 
          a.montoPagado, 
          s.nombre AS Status, 
          a.comentarios
      FROM 
          pagosaplicaciones a
      INNER JOIN 
          statuspagos s ON a.idStatusPago = s.id
      INNER JOIN 
          promotores p ON a.idPromotor = p.id
      WHERE 1=1
    `;

    // Agrega los filtros solo si existen
    if (year) {
      query += ` AND YEAR(a.createdAt) = ${sequelize.escape(year)}`;
    }
    if (month) {
      query += ` AND MONTH(a.createdAt) = ${sequelize.escape(month)}`;
    }

    const result = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

    // Función para formatear el monto como moneda
    const formatCurrency = (amount) => {
      if (amount !== null && !isNaN(amount)) {
        return '$' + parseFloat(amount).toLocaleString('es-MX', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
      } else {
        return '$0.00';
      }
    };

    // Transformar el resultado
    const transformedResult = result.map(item => {
      // Formatear 'montoPagado' como moneda
      item.montoPagado = formatCurrency(item.montoPagado);
      return item;
    });

    // Enviar la respuesta con los resultados transformados
    res.status(200).json(transformedResult);

  } catch (error) {
    console.error('Error fetching Pagos promotores', error);
    res.status(500).json({
      message: 'An error occurred while fetching Pagos Promotores',
      error: error.message
    });
  }
});
//===========================Obtener registros de pagos(GET)  Mensuales ==============================
router.get('/historial/mensuales', async (req, res) => {
  try {
    // Obtén el año y mes de los parámetros de consulta en la URL
    const { year, month } = req.query;

    // Define la consulta base
    let query = `
      SELECT 
        monto, 
       DATE_FORMAT(createdAt, '%d-%m-%Y') AS createdAt
      FROM 
        pagosproveedoresmensuales
      WHERE 1=1
    `;

    // Agrega los filtros solo si existen
    if (year) {
      query += ` AND YEAR(createdAt) = ${sequelize.escape(year)}`;
    }
    if (month) {
      query += ` AND MONTH(createdAt) = ${sequelize.escape(month)}`;
    }

    const result = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

    // Función para formatear el monto como moneda
    const formatCurrency = (amount) => {
      if (amount !== null && !isNaN(amount)) {
        return '$' + parseFloat(amount).toLocaleString('es-MX', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
      } else {
        return '$0.00';
      }
    };

    // Transformar el resultado
    const transformedResult = result.map(item => {
      // Formatear 'montoPagado' como moneda
      item.monto = formatCurrency(item.monto);
      return item;
    });

    // Enviar la respuesta con los resultados transformados
    res.status(200).json(transformedResult);

  } catch (error) {
    console.error('Error fetching Pagos promotores', error);
    res.status(500).json({
      message: 'An error occurred while fetching Pagos Promotores',
      error: error.message
    });
  }
});



router.get('/historial/cuotas', async (req, res) => {
  try {
    // Consulta para obtener las cuotas
    let query = `
      SELECT 
          c.id AS IdCuota, 
          c.Monto, 
          c.Idoperacion, 
          t.nombre AS TipoOperacion, 
          c.status, 
          c.createdAt, 
          c.updatedAt
      FROM 
          cuotaactualmensuals c
      INNER JOIN 
          TipoOperacions t ON c.Idoperacion = t.id
    `;

    // Ejecutar la consulta
    const result = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

    // Función para formatear el monto como moneda
    const formatCurrency = (amount) => {
      if (amount !== null && !isNaN(amount)) {
        return '$' + parseFloat(amount).toLocaleString('es-MX', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
      } else {
        return '$0.00';
      }
    };

    // Formatear los resultados
    const formattedResult = result.map((cuota) => ({
      ...cuota,
      Monto: formatCurrency(cuota.Monto),
      status: cuota.status ? 'Activo' : 'Inactivo', // Convertir status a texto
    }));

    // Enviar respuesta
    res.status(200).json(formattedResult);
  } catch (error) {
    console.error('Error al obtener el historial de cuotas:', error);
    res.status(500).json({
      message: 'Error al obtener el historial de cuotas',
      error: error.message,
    });
  }
});
router.put('/cuotas/:id', async (req, res) => {
  const { id } = req.params; // Obtener el ID de los parámetros
  const { Monto, Idoperacion, status } = req.body; // Datos enviados en el cuerpo de la solicitud
  console.log('Monto recibido:', Monto);

  try {
    // Buscar la cuota por ID
    const cuota = await CuotaActualMensual.findByPk(id);

    if (!cuota) {
      return res.status(404).json({ message: 'Cuota no encontrada' });
    }

    // Construir dinámicamente los datos a actualizar
    const fieldsToUpdate = {};
    if (Monto !== undefined) fieldsToUpdate.Monto = Monto;
    if (Idoperacion !== undefined) fieldsToUpdate.Idoperacion = Idoperacion;
    if (status !== undefined) fieldsToUpdate.status = status;

    // Actualizar el registro con los campos proporcionados
    await CuotaActualMensual.update(fieldsToUpdate, {
      where: { id },
    });

    // Recuperar el registro actualizado
    const updatedCuota = await CuotaActualMensual.findByPk(id);

    res.status(200).json({
      message: 'Cuota actualizada exitosamente',
      cuota: updatedCuota,
    });
  } catch (error) {
    console.error('Error al actualizar la cuota:', error);
    res.status(500).json({
      message: 'Error al actualizar la cuota',
      error: error.message,
    });
  }
});



module.exports = router;



/*
json test: 

{
  "idAplicacion": 123,
  "comentarios": "Pago realizado correctamente"
}


 */