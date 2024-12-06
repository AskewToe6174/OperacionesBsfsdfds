const express = require('express');
const router = express.Router();
const cors = require('cors');
const { sequelize,Promotores, Plaza,TipoServicio,Periodos, TipoOperacion, TipoCliente, Grupo, Cliente, RegistroAplicaciones, desgloseImpuestos } = require('../models');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');


// app.use(express.json());
router.use(cors());
// --------------------------------- GET ----------------------------------
//OBTENER EL PERIODO DE APLICACION
router.get('/periodos', async (req, res) => {
  try {
    const periodos = await Periodos.findAll({
      attributes: ['id', 'name']
    });
    res.json(periodos);
  } catch (error) {
    console.error('Error fetching plazas:', error);
    res.status(500).send('Server error');
  }
});
//OBTENER TODOS LOS SERVICIOS
router.get('/servicios', async (req, res) => {
  try {
    const servicio = await TipoServicio.findAll({
      attributes: ['id', 'nombre']
    });
    res.json(servicio);
  } catch (error) {
    console.error('Error fetching plazas:', error);
    res.status(500).send('Server error');
  }
});
//OBTENER TODAS LAS OPERACIONES
router.get('/operaciones', async (req, res) => {
  try {
    const operacion = await TipoOperacion.findAll({
      attributes: ['id', 'nombre']
    });
    res.json(operacion);
  } catch (error) {
    console.error('Error fetching plazas:', error);
    res.status(500).send('Server error');
  }
});
//OBTENER TODOS LOS GRUPOS
router.get('/grupos', async (req, res) => {
  try {
    const grupo = await Grupo.findAll({
      attributes: ['id', 'nombre']
    });
    res.json(grupo);
  } catch (error) {
    console.error('Error fetching plazas:', error);
    res.status(500).send('Server error');
  }
});
//OBTENER TODAS LAS PLAZAS
router.get('/plazas', async (req, res) => {
  try {
    const plazas =  await Plaza.findAll({
      attributes: ['id', 'nombre']
    });
    res.json(plazas);
  } catch (error) {
    console.error('Error fetching plazas:', error);
    res.status(500).send('Server error');
  }
});

//OBTENER TODOS LOS PROMOTORES
router.get('/promotores', async (req,res)=>{
  try {
    const promotores = await Promotores.findAll();
    res.json(promotores);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
})





// OBTENER EL TOTAL DE ESTIMULO - O LA CANTIDAD DE ESTIMULO POR EL TIPO DE OPERACION
router.get('/estimulo/:operacion/:mes/:year', async (req, res) => {
  // Función para formatear la cantidad como moneda
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

  try {
    let { operacion, mes, year } = req.params;
    operacion = parseInt(operacion, 10); // Asegúrate de que operacion sea un número entero
    year = parseInt(year, 10);
    mes = parseInt(mes, 10);

    const currentYear = new Date().getFullYear(); // Definimos currentYear

    if (
      Number.isInteger(operacion) && operacion > 0 &&  // Validar que operacion es un número entero válido
      Number.isInteger(year) && year > 0 && year <= currentYear &&  // Validar que year es un número entero válido
      Number.isInteger(mes) && mes >= 1 && mes <= 12  // Validar que mesAplicado está entre 1 y 12
    ) {
      // Ejecutar la consulta solo si los parámetros son válidos
      const [results] = await sequelize.query(
        `SELECT
          SUM(registroaplicaciones.estimulo) AS totalEstimulo
          FROM registroaplicaciones
          INNER JOIN tipooperacions ON registroaplicaciones.idTipoOperacion = tipooperacions.id
          WHERE
          registroaplicaciones.mesAplicado = :mes
          AND registroaplicaciones.anualAplicado = :year
          AND registroaplicaciones.idTipoOperacion = :operacion`,
        { replacements: { operacion, year, mes } }
      );

      // Si no hay resultados o el total de estimulo es null
      if (results.length === 0 || !results[0].totalEstimulo) {
        res.json({
          message: "success",
          details: "sin datos"
        });
      } else {
        // Formatear el totalEstimulo como moneda
        results[0].totalEstimulo = formatCurrency(results[0].totalEstimulo);
        res.json(results);
      }
    } else {
      // Manejo de error por parámetros inválidos
      res.json({
        message: "success",
        details: "datos inválidos",
        data: {
          year,
          mes
        }
      });
    }
  } catch (error) {
    console.error('Error fetching registros:', error);
    res.status(500).send('Server error');
  }
});





// Obtener el estimulo total por mes y año
router.get('/total/estimulo/:mes/:year', async (req, res) => {
  // Función para formatear la cantidad como moneda
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

  try {
    let { mes, year } = req.params;

    year = parseInt(year, 10);
    mes = parseInt(mes, 10);
    const currentYear = new Date().getFullYear(); // Definimos currentYear

    // Validar que year es un número entero válido
    if (
      Number.isInteger(year) && year > 0 && year <= currentYear &&
      Number.isInteger(mes) && mes >= 1 && mes <= 12  // Validar que mes está entre 1 y 12
    ) {
      // Ejecutar la consulta solo si los parámetros son válidos
      const [results] = await sequelize.query(
        `SELECT
          SUM(registroaplicaciones.estimulo) AS totalEstimulo
          FROM registroaplicaciones
          INNER JOIN tipooperacions ON registroaplicaciones.idTipoOperacion = tipooperacions.id
          WHERE
          registroaplicaciones.mesAplicado = :mes
          AND registroaplicaciones.anualAplicado = :year`,
        { replacements: { year, mes } }
      );

      // Si no hay resultados o el total de estimulo es null
      if (results.length === 0 || results[0].totalEstimulo === null) {
        return res.json({
          message: "success",
          details: "sin datos"
        });
      } else {
        // Formatear el totalEstimulo como moneda
        results[0].totalEstimulo = formatCurrency(results[0].totalEstimulo);
        return res.json(results);
      }
    } else {
      // Manejo de error por parámetros inválidos
      return res.json({
        message: "success",
        details: "datos inválidos",
        data: {
          year,
          mes
        }
      });
    }
  } catch (error) {
    console.error('Error fetching registros:', error);
    res.status(500).send('Server error');
  }
});


// --------------------------------- GET ----------------------------------
// --------------------------------- POST --------------------------------
//CREAR UN NUEVO PROMOTOR
router.post('/promotores/nuevo', async (req, res) => {
  try {
    const { nombre, apellido } = req.body;

    // Validar los datos recibidos si es necesario
    if (!nombre || !apellido) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Convertir a minúsculas para la comparación
    const nombreLower = nombre.toLowerCase();
    const apellidoLower = apellido.toLowerCase();

    // Verificar si ya existe un registro con el mismo nombre y apellido (en minúsculas)
    const existePromotor = await Promotores.findOne({
      where: {
        [Op.and]: [
          { nombre: nombreLower },
          { apellido: apellidoLower }
        ]
      }
    });

    if (existePromotor) {
      return res.status(201).json({
        message: 'error',
        details: 'Ya existe un promotor con el mismo nombre y apellido'
      });
    }

    // Crear un nuevo registro en la base de datos
    const nuevoPromotor = await Promotores.create({
      nombre: nombreLower,
      apellido: apellidoLower,
    });

    // Responder con el nuevo registro creado
    res.status(201).json({
      message: 'success',
      details: 'Promotor creado'
    });
  } catch (error) {
    console.error('Error creando promotor:', error.message);
    res.status(500).json({ error: 'Error del servidor', details: error.message });
  }
});


// CREAR UNA NUEVA PLAZA
router.post('/plaza/nuevo', async (req, res) => {
  try {
    const { nombre } = req.body;

    // Validar los datos recibidos si es necesario
    if (!nombre) {
      return res.status(400).json({
        message: 'error',
        details: 'Faltan datos obligatorios' });
    }

    // Convertir a minúsculas para la comparación
    const nombreLower = nombre.toLowerCase();

    // Verificar si ya existe una plaza con el mismo nombre (en minúsculas)
    const existePlaza = await Plaza.findOne({
      where: {
        nombre: {
          [Op.eq]: nombreLower
        }
      }
    });

    if (existePlaza) {
      return res.status(201).json({
        message: 'error',
        details: 'Ya existe una plaza con el mismo nombre' });
    }

    // Crear un nuevo registro en la base de datos
    const nuevaPlaza = await Plaza.create({
      nombre: nombreLower,
    });

    // Responder con el nuevo registro creado
    res.status(200).json({
      message:'success',
      details: 'Plaza creada correctamente',
    });
  } catch (error) {
    console.error('Error creando plaza:', error.message);
    res.status(500).json({ error: 'Error del servidor', details: error.message });
  }
});
// --------------------------------- POST ----------------------------------
module.exports = router;
