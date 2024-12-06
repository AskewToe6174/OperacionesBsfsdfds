
# 🛠️ **API Test Routes Documentation** 🛠️

---

## **Registro Router**
### **PUT** `/editar/:id`
Payload:
```json
{
    "bandera": "3",
    "Comentario[71]": "",
    "Comentario[72]": "",
    "Comentario[73]": "",
    "ivaCliente": "79973.00",
    "isrPmorales": "0.00",
    "isrRetencionesSalarios": "0.00",
    "isrRetencionesAsim": "0.00",
    "isrRetencionesServ": "0.00",
    "deal": "30.00",
    "subtotal": "23991.9",
    "ivaFacturacion": "3838.70",
    "total": "944968.9653",
    "porcentajeDsb": "0.00",
    "montoDsb": "0",
    "porcentajePromotor": "10.00",
    "montoPromotor": "7997.3",
    "ahorro": "55981.1",
    "recepcionPrevia": "",
    "fechaElaboracionAviso": "",
    "folioResponsableSolidario": "",
    "fechaRecepcionDeclaracion": "",
    "folioDeclaracion": "",
    "fechaDeclaracion": "",
    "fechaAvisoCliente": "",
    "folioAvisoCliente": "",
    "opinionCumplimiento": "",
    "fechaGeneracionOpinionCumplimiento": "",
    "fechaEnvioExpediente": ""
}
```

### **POST** `/nuevo`
Payload:
```json
{
  "idCliente": 123,
  "mesAplicado": "noviembre",
  "anualAplicado": 2024,
  "idPeriodo": 10,
  "anualPeriodo": 2024,
  "estimulo": 1500.00,
  "deal": "super deal 2024",
  "porcentajePromotor": 5.5
}
```

---

## **Cobro Router**
### **POST** `/nuevo`
Payload:
```json
{
  "aplicacion": 12345,
  "monto": "1500.00",
  "fechaPago": "2024-11-21",
  "numeroTransferencia": 987654321,
  "folioComplemento": 123456789
}
```

---

## **Facturación Router**
### **POST** `/nueva`
Payload:
```json
{
  "TipoFactura": "valor1",
  "folioFactura": "valor2",
  "nombreAFacturar": "valor3",
  "IdAplicaciones": "1,20,34"
}
```

---

## **Clientes Router**
### **POST** `/nuevo_tipo`
Payload:
```json
{
  "nombre": "Nuevo Tipo de Cliente"
}
```

### **POST** `/nuevo`
Payload:
```json
{
  "idPlaza": 1,
  "idPromotor": 2,
  "idGrupo": 3,
  "idTipoCliente": 4,
  "idTipoOperacion": 5,
  "idTipoServicio": 6,
  "razonSocial": "Empresa XYZ",
  "responsableSolidario": "Juan Pérez",
  "rfc": "XYZ123456789"
}
```

### **PUT** `/update/:id`
Payload:
```json
{
  "idPlaza": 1,
  "idPromotor": 2,
  "idGrupo": 3,
  "rfc": "XYZ987654321",
  "idTipoCliente": 4,
  "idTipoOperacion": 5,
  "idTipoServicio": 6,
  "razonSocial": "Empresa XYZ Actualizada",
  "responsableSolidario": "Carlos Gómez"
}
```

---

## **Operaciones Router**
### **POST** `/promotores/nuevo`
Payload:
```json
{
  "nombre": "Carlos",
  "apellido": "Gómez"
}
```

### **POST** `/plaza/nuevo`
Payload:
```json
{
  "nombre": "Plaza Central"
}
```

### **PUT** `/update/:id`
Payload:
```json
{
  "nombre": "Carlos Alberto",
  "apellido": "Gómez Sánchez"
}
```
