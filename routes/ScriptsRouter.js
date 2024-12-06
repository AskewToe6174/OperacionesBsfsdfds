const express = require('express');
const router = express.Router();
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');  // Importar el módulo 'path'

router.use(express.json());
router.use(cors());

//================================================================================================
/*
Ejemplo de json que voy a recibir:
{
    "year": 2024,
    "month": 11,
    "days": "1,20,34"
}

//================================================================================================
/*
Ejemplo de JSON que vas a recibir:
{
    "RFCs": [
        { "rfc": "BBXY09030423", "idCliente": 89 },
        { "rfc": "CCXZ03040534", "idCliente": 87 }
    ]
}
*/
router.post('/calcular-fecha', async (req, res) => {
    console.log("Cuerpo de la solicitud recibido:", req.body);

    const dataArray = req.body.RFCs;

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar un array de objetos con RFC e idCliente' });
    }

    const invalidItems = dataArray.filter(item => !item.rfc || !item.idCliente);
    if (invalidItems.length > 0) {
        return res.status(400).json({ error: 'Todos los objetos deben contener las claves "rfc" e "idCliente"' });
    }

    try {
        const resultado = await calcularFechaConPython(dataArray);
        
        res.json(resultado);  // Devolver el resultado del script Python
    } catch (error) {
        console.error('Error al calcular las fechas:', error);
        res.status(500).json({ error: 'Error al calcular las fechas en Python', detalles: error });
    }
});

// Función para ejecutar el script de Python
function calcularFechaConPython(dataArray) {
    return new Promise((resolve, reject) => {
        const pythonPath = path.join(__dirname, 'PythonScriptRFC.py');
        console.log(`Ejecutando el script Python con los RFCs: ${JSON.stringify(dataArray)}`);
        
        // Convertir el objeto a una cadena JSON y escaparla para que Python la reciba correctamente
        const jsonData = JSON.stringify({ RFCs: dataArray });
        const pythonProcess = spawn('python', [pythonPath, jsonData]);

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('error', (err) => {
            reject(`Error al iniciar el proceso Python: ${err.message}`);
        });

        pythonProcess.on('exit', (code) => {
            console.log("Salida estándar del proceso Python:", output);
            console.log("Salida de error del proceso Python:", errorOutput);
            if (code === 0) {
                try {
                    const parsedOutput = JSON.parse(output.trim());
                    if (parsedOutput.error) {
                        reject(`Error desde el script Python: ${parsedOutput.error}`);
                    } else {
                        resolve(parsedOutput.resultados);
                    }
                } catch (err) {
                    reject(`Error al procesar la salida del script Python: ${err.message}`);
                }
            } else {
                reject(`El proceso Python terminó con código: ${code}. Salida de error: ${errorOutput}`);
            }
        });
    });
}
//================================================================================================
/*
Ejemplo de json que voy a recibir:
{
    "year":2024 ,
    "month": 11,
    "days": "1,20,34"
}
 */
// Lo de los RFC
router.post('/FechasInhabiles', async (req, res) => {
    const { year, month, days } = req.body;

    // Separar los días en un array y construir las fechas en el formato deseado
    const daysArray = days.split(',').map(day => {
        const formattedDay = parseInt(day, 10);
        return `${year}-${String(month).padStart(2, '0')}-${String(formattedDay).padStart(2, '0')}`; // Formato "YYYY-MM-DD"
    });

    

    try {
        for (let i = 0; i < daysArray.length; i++) {
            // Crear el objeto que se insertará en la base de datos
            await fechasInhabiles.create({ fecha: daysArray[i] });
        }
        res.status(200).json({ message: 'Fechas inahábiles recibidas', daysArray });
    } catch (error) {
        res.status(500).json({ message: 'Error al insertar fechas', error });
    }
});

module.exports = router;


