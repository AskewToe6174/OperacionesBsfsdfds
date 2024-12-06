const express = require('express');
const router = express.Router();
const cors = require('cors');
const Decimal = require('decimal.js');
const {sequelize,HistorialMovimientos , CobroAplicaciones, Facturas} = require('../models');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const facturas = require('../models/facturas');
const historialmovimientos = require('../models/historialmovimientos');

router.use(cors());

// ------------------------------------- GET -----------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    let { id } = req.params;

    // Verificar si se proporcionó el ID
    if (!id) {
      return res.status(400).json({
        message: 'error',
        details: 'id de cobro requerido'
      });
    }

    // Obtener todos los registros de la tabla HistorialMovimientos donde idCobro sea igual a id
    const historialMovimientos = await HistorialMovimientos.findAll({
      attributes: ['id','idCobro', 'fecha', 'monto', 'numTransferencia', 'folioComplemento'],
      where: {
        idCobro: id
      }
    });

    // Formatear el monto de cada movimiento
    historialMovimientos.forEach((movimiento) => {
      movimiento.monto = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(movimiento.monto);
    });

    // Verificar si hay resultados
    if (historialMovimientos.length > 0) {
      // Devolver los datos obtenidos en la respuesta
      return res.json({
        message: 'success',
        data: historialMovimientos
      });
    } else {
      // Devolver un mensaje indicando que no hay resultados
      return res.status(404).json({
        message: 'error',
        details: 'No se encontraron resultados'
      });
    }

  } catch (error) {
    console.error('Error fetching historialMovimientos:', error);
    return res.status(500).json({
      message: 'error',
      details: 'Error en el servidor'
    });
  }
});


// ------------------------------------- GET -----------------------------------------------
// ------------------------------------ POST -----------------------------------------------

router.post('/nuevo', async (req, res) => {
  try {
    // Desestructuramos los campos del body
    let { aplicacion, monto, fechaPago, numeroTransferencia, folioComplemento } = req.body;
    if (!aplicacion) {
      res.json({
        message: 'error',
        details: 'Por favor, seleccione una aplicación.'
      });
    } else {
      // Lógica adicional si la aplicación no es vacía ni null.
    }
    

    // Convertir `aplicacion`, `numeroTransferencia`, y `folioComplemento` a enteros
    aplicacion = parseInt(aplicacion, 10);
    numeroTransferencia = parseInt(numeroTransferencia, 10);
    folioComplemento = parseInt(folioComplemento, 10);

    // Asegurar que `monto` sea un Decimal
    monto = new Decimal(monto);

    // Verificamos los campos obligatorios
    if (!aplicacion || monto.isNaN() || !fechaPago || !numeroTransferencia || !folioComplemento) {
      return res.status(400).json({
        message: 'error',
        details: {
          aplicacion: !aplicacion ? 'Falta aplicacion' : undefined,
          monto: monto.isNaN() ? 'Falta monto' : undefined,
          fechaPago: !fechaPago ? 'Falta fechaPago' : undefined,
          numeroTransferencia: !numeroTransferencia ? 'Falta numeroTransferencia' : undefined,
          folioComplemento: !folioComplemento ? 'Falta folioComplemento' : undefined
        }
      });
    }

    // Obtener abonos actuales
    const abonosActuales = await HistorialMovimientos.findAll({
      attributes: ['idCobro', 'monto'],
      where: { idCobro: aplicacion }
    });

    if (!abonosActuales) {
      return res.status(400).json({ message: 'error', details: 'Error al conseguir los abonos' });
    }

    // Calcular el total de abonos usando Decimal
    const totalAbonos = abonosActuales.reduce((total, abono) => total.plus(new Decimal(abono.monto)), new Decimal(0));

    // Sumar el monto al total de abonos
    let total = totalAbonos.plus(monto);

    // Buscar el registro de aplicación
    const cobro = await CobroAplicaciones.findOne({
      attributes: ['id', 'cobro', 'pagado', 'remanente', 'montoTotal', 'liberado'],
      where: { id: aplicacion }
    });

    if (!cobro) {
      return res.status(404).json({ message: 'error', details: 'Registro de cobro no encontrado' });
    }

    // Iniciar transacción
    await sequelize.transaction(async (t) => {
      if (new Decimal(cobro.montoTotal).greaterThan(totalAbonos)) {
        let remanente = new Decimal(cobro.montoTotal).minus(total);

        if (new Decimal(cobro.montoTotal).equals(total)) {
          const now = new Date(); // Obtiene la fecha y hora actual

          await HistorialMovimientos.create(
            {
              idCobro: aplicacion,
              monto: monto.toFixed(2),
              fecha: fechaPago,
              numTransferencia: numeroTransferencia,
              folioComplemento: folioComplemento
            },
            { transaction: t }
          );

          await CobroAplicaciones.update(
            {
              cobro: monto.toFixed(2),
              pagado: total.toFixed(2),
              remanente: remanente.toFixed(2),
              liberado: 1,
              fechaCobro: now
            },
            { where: { id: cobro.id }, transaction: t }
          );

          res.json({ message: 'success', details: 'Aplicación completamente pagada.' });

        } else if (new Decimal(cobro.montoTotal).greaterThan(total)) {
          await HistorialMovimientos.create(
            {
              idCobro: aplicacion,
              monto: monto.toFixed(2),
              fecha: fechaPago,
              numTransferencia: numeroTransferencia,
              folioComplemento: folioComplemento
            },
            { transaction: t }
          );

          remanente = new Decimal(cobro.montoTotal).minus(total);

          await CobroAplicaciones.update(
            { cobro: monto.toFixed(2), pagado: total.toFixed(2), remanente: remanente.toFixed(2) },
            { where: { id: cobro.id }, transaction: t }
          );

          res.json({ message: 'success', details: `Pago registrado, faltante de ${remanente}.` });

          if (total.greaterThan(new Decimal(cobro.montoTotal).times(0.50))) {
            await CobroAplicaciones.update(
              { liberado: 1 },
              { where: { id: cobro.id }, transaction: t }
            );
          }

        } else {
          const excedente = total.minus(new Decimal(cobro.montoTotal));
          res.json({
            message: 'error',
            details: `Remanente de ${excedente}, pago no registrado, ajuste la cantidad a abonar.`
          });
        }

      } else if (new Decimal(cobro.montoTotal).equals(totalAbonos)) {
        res.json({ message: 'success', details: 'La aplicación ya estaba completamente pagada.' });
      } else {
        res.json({ message: 'error', details: `Contacte a sistemas` });
      }
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ message: 'error', details: 'Error en el servidor' });
  }
});

//======================================Put
router.put('/editar/movimiento', async (req, res) => {
  try {
    let { id, folioComplemento } = req.body;
    let folio;
    folio=folioComplemento;
    if (!id) {
      return res.status(400).json({
        message: 'error',
        details: 'id de cobro requerido'
      });
    }

    if (!folio) {
      return res.status(400).json({
        message: 'error',
        details: 'folio requerido'
      });
    }

    // Buscar el registro con el id de cobro proporcionado
    const movimiento = await HistorialMovimientos.findOne({
      where: {
        id: id
      }
    });

    if (!movimiento) {
      return res.status(404).json({
        message: 'error',
        details: 'No se encontró el movimiento con ese id'
      });
    }

    // Actualizar solo el campo 'folio'
    movimiento.folioComplemento = folio;
    await movimiento.save();

    return res.json({
      message: 'success',
      details: "Registro guardado"
    });

  } catch (error) {
    console.error('Error updating movimiento:', error);
    return res.status(500).json({
      message: 'error',
      details: 'Error en el servidor'
    });
  }
});



router.delete('/eliminar/movimiento', async (req, res) => {
  try {
    let { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: 'error',
        details: 'id de cobro requerido'
      });
    }

    // Buscar el registro con el id de cobro proporcionado
    const movimiento = await HistorialMovimientos.findOne({
      where: {
        id: id
      }
    });

    if (!movimiento) {
      return res.status(404).json({
        message: 'error',
        details: 'No se encontró el movimiento con ese id'
      });
    }

    // Eliminar el movimiento
    await movimiento.destroy();

    return res.json({
      message: 'success',
      details: 'Movimiento eliminado correctamente'
    });

  } catch (error) {
    console.error('Error deleting movimiento:', error);
    return res.status(500).json({
      message: 'error',
      details: 'Error en el servidor'
    });
  }
});



module.exports = router;
