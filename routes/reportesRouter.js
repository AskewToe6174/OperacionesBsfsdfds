const express = require('express');
const router = express.Router();
const cors = require('cors');
const Decimal = require('decimal.js');
const { sequelize, Cliente, RegistroAplicaciones,ComentariosAplicacion,declaraciones } = require('../models');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
router.use(cors());


// --------------------------------- GET ----------------------------------
router.get('/reportes', async (req, res) => {
    try {
      let {mes, year, operacion } = req.query;
      // Other parameters
      const anio = year || null;
      const month = mes || null;
      operacion= operacion !== undefined ? String(operacion) : null;

      // Base SQL query
      let query = `
        
  
      `;
      
      // Initialize conditions and replacements
      let conditions = [];
      let replacements = {};
  
      // Apply filters if parameters are provided
      if (razonsocial) {
        
      
      }
  
      if (month) {
 
      }
  
      if (anio) {
        
      }
  
      if (pendiente) {
       
      } 
      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
      }
  
      const [consultareportes] = await sequelize.query(query, { replacements });
      res.json(consultareportes);
    } catch (error) {
      console.error('Error al obtener las facturas:', error);
      res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
  });
  
  


module.exports = router;
