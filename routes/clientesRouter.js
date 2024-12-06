const express = require('express');
const router = express.Router();
const cors = require('cors');
const { sequelize,TipoCliente,Cliente,fechasInhabiles } = require('../models');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const { spawn } = require('child_process');


router.use(express.json());
router.use(cors());

//----------------------------------------------------------------------- GET --------------------
//OBTENER TODOS LOS TIPOS DE CLIENTE
router.get('/tipos', async (req, res) => {
  try {
    const cliente = await TipoCliente.findAll({
      attributes: ['id', 'nombre']
    });
    res.json(cliente);
  } catch (error) {
    console.error('Error fetching plazas:', error);
    res.status(500).send('Server error');
  }
});
// AGREGAR UN NUEVO TIPO DE CLIENTE
router.post('/nuevo_tipo', async (req, res) => {
  try {
    const { nombre } = req.body;
    const NuevoNombre  = nombre*16

    // Validar los datos recibidos si es necesario
    if (!nombre ) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Crear un nuevo registro en la base de datos
    const tipoCliente = await TipoCliente.create({
      nombre,
    });

    // Responder con el nuevo registro creado
    res.status(201).json(tipoCliente);
  } catch (error) {
    console.error('Error creando promotor:', error.message);
    res.status(500).json({
      error: 'Error del servidor',
       details: error.message });
  }
});

// VER TODOS LOS CLIENTES O FILTRARLOS POR TIPO DE OPERACION
router.get('/', async (req, res) => {
  try {
    let { operacion } = req.query;

    // Construir la consulta base
    let query = `
        SELECT clientes.id,
               plazas.nombre AS plaza,
               promotores.nombre AS promotor,
               grupos.nombre AS grupo,
               tipoclientes.nombre AS tipoCliente,
               tipooperacions.nombre AS operacion,
               tiposervicios.nombre AS tipoServicio,
               clientes.razonSocial,
               clientes.rfc
        FROM clientes
        INNER JOIN plazas ON clientes.idPlaza = plazas.id
        INNER JOIN promotores ON clientes.idPromotor = promotores.id
        INNER JOIN grupos ON clientes.idGrupo = grupos.id
        INNER JOIN tipoclientes ON clientes.idTipoCliente = tipoclientes.id
        INNER JOIN tipooperacions ON clientes.idTipoOperacion = tipooperacions.id
        INNER JOIN tiposervicios ON clientes.idTipoServicio = tiposervicios.id`;

    // Si 'operacion' existe, agregar la cláusula WHERE
    if (operacion) {
      query += ` WHERE tipooperacions.id = :operacion`;
    }

    // Ejecutar la consulta SQL directamente
    const [results, metadata] = await sequelize.query(query, { replacements: { operacion } });

    // Enviar los resultados en la respuesta
    res.json(results);
  } catch (error) {
    console.error('Error fetching registros:', error);
    res.status(500).send('Server error');
  }
});

//----------------------------------------------------------------------- GET --------------------
//----------------------------------------------------------------------- POST --------------------
// GENERAR UN NUEVO CLIENTE
router.post('/nuevo', async (req, res) => {
  try {
    const status = 1; // Estado por defecto
    const {
      idPlaza,
      idPromotor,
      idGrupo,
      idTipoCliente,
      idTipoOperacion,
      idTipoServicio,
      responsableSolidario,
      razonSocial,
      rfc
    } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!idPlaza || !idPromotor || !idGrupo || !idTipoCliente || !idTipoOperacion || !idTipoServicio || !razonSocial || !rfc) {
      return res.status(400).json({
        message: 'error',
        details: 'Faltan datos obligatorios'
      });
    }

    // Convertir la razón social a minúsculas para evitar duplicados
    const razonSocialLower = razonSocial.toLowerCase();

    // Verificar si ya existe un cliente con la misma razón social (en minúsculas)
    const existingCliente = await Cliente.findOne({
      where: {
        [Op.and]: [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('razonSocial')), razonSocialLower)
        ]
      }
    });

    if (existingCliente) {
      return res.status(409).json({
        message: 'error',
        details: 'La razón social ya está registrada'
      });
    }

    // Crear un nuevo cliente
    const cliente = await Cliente.create({
      idPlaza,
      idPromotor,
      idGrupo,
      idTipoCliente,
      idTipoOperacion,
      idTipoServicio,
      razonSocial,
      responsableSolidario,
      rfc,
      status
    });

    // Responder con éxito y los detalles del cliente creado
    res.status(201).json({
      message: 'success',
      details: 'Cliente creado correctamente',
      cliente
    });
  } catch (error) {
    console.error('Error creando cliente:', error.message);
    res.status(500).json({
      message: 'error',
      details: 'Error del servidor',
      error: error.message
    });
  }
});
//----------------------------------------------------------------------- POST --------------------

//----------------------------------------------------------------------- PUT --------------------
// ACTUALIZAR UN CLIENTE
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      idPlaza,
      idPromotor,
      idGrupo,
      rfc,
      idTipoCliente,
      idTipoOperacion,
      idTipoServicio,
      razonSocial,
      responsableSolidario // Añadir responsableSolidario si es necesario
    } = req.body;

    // Validar los datos recibidos
    if (!idPlaza || !idPromotor || !idGrupo || !idTipoCliente || !idTipoOperacion || !idTipoServicio || !razonSocial || !rfc) {
      return res.status(400).json({
        message: 'error',
        details: 'Faltan datos obligatorios'
      });
    }

    // Buscar el cliente por ID
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({
        message: 'error',
        details: 'Cliente no encontrado'
      });
    }

    // Convertir la razón social a minúsculas para evitar duplicados
    const razonSocialLower = razonSocial.toLowerCase();

    // Verificar si ya existe un cliente con la misma razón social en minúsculas (excluyendo el actual)
    const existingCliente = await Cliente.findOne({
      where: {
        [Op.and]: [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('razonSocial')), razonSocialLower),
          { id: { [Op.ne]: id } } // Excluir el cliente actual
        ]
      }
    });

    if (existingCliente) {
      return res.status(409).json({
        message: 'error',
        details: 'La razón social ya está registrada en otro cliente'
      });
    }

    // Actualizar el cliente con los nuevos datos
    await cliente.update({
      idPlaza,
      idPromotor,
      idGrupo,
      rfc,
      idTipoCliente,
      idTipoOperacion,
      idTipoServicio,
      razonSocial,
      responsableSolidario // Añadir responsableSolidario si se va a actualizar
    });

    // Responder con el registro actualizado
    res.status(200).json({
      message: 'success',
      details: 'Cliente actualizado correctamente',
      cliente
    });
  } catch (error) {
    console.error('Error actualizando cliente:', error.message);
    res.status(500).json({
      message: 'error',
      details: 'Error del servidor',
      error: error.message
    });
  }
});

//----------------------------------------------------------------------- PUT --------------------
module.exports = router;
