import sys
import json
import datetime
import mysql.connector
import re  # Librería para expresiones regulares

# Conectar a la base de datos para obtener los días festivos
def obtener_dias_festivos():
    conexion = mysql.connector.connect(
        user='root',
        password='16220068',
        host='localhost',
        port=3306,
        database='operacionesdev'
    )
    cursor = conexion.cursor()
    cursor.execute("SELECT fecha FROM fechasinhabiles;")
    dias_festivos = [fila[0] for fila in cursor.fetchall()]
    cursor.close()
    conexion.close()
    return [fecha.date() if isinstance(fecha, datetime.datetime) else fecha for fecha in dias_festivos]

# Función para agregar días hábiles a una fecha
def agregar_dias_habiles(fecha_inicial, dias_habiles, dias_festivos):
    dias_agregados = 0
    while dias_habiles > 0:
        fecha_inicial += datetime.timedelta(days=1)
        if fecha_inicial.weekday() < 5 and fecha_inicial not in dias_festivos:
            dias_habiles -= 1
        dias_agregados += 1
    return fecha_inicial, dias_agregados

# Función para calcular la fecha aproximada de declaración según el RFC
def calcular_fecha(rfc, dias_festivos):
    numero = int(rfc[5])
    dias_habiles = {1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 0: 5}.get(numero, 0)

    hoy = datetime.datetime.now()
    fecha_inicial = datetime.date(hoy.year, hoy.month, 17)
    nueva_fecha, dias_totales_agregados = agregar_dias_habiles(fecha_inicial, dias_habiles, dias_festivos)

    return nueva_fecha.isoformat(), dias_totales_agregados

# Función para validar el formato de RFC
def validar_rfc(rfc):
    # Usar expresión regular para validar el formato de RFC de 12 caracteres (físicos) o 13 caracteres (morales)
    patron_rfc = r"^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{2,3}$"
    return bool(re.match(patron_rfc, rfc))

# Función para procesar los RFCs y almacenar los resultados en la base de datos
def procesar_rfcs(rfcs):
    dias_festivos = obtener_dias_festivos()
    
    # Conectar a la base de datos para insertar resultados
    conexion = mysql.connector.connect(
        user='root',
        password='16220068',
        host='localhost',
        port=3306,
        database='operacionesdev'
    )
    cursor = conexion.cursor()

    resultados = []
    for item in rfcs:
        if isinstance(item, dict) and "rfc" in item and "idCliente" in item:  # Validación de formato
            rfc = item["rfc"]
            id_cliente = item["idCliente"]
            if not validar_rfc(rfc):  # Verificación de RFC válido
                print(f"Error: Formato incorrecto para el item {rfc}", file=sys.stderr)
                continue

            fecha_calculada, dias_agregados = calcular_fecha(rfc, dias_festivos)
            
            # Insertar el resultado en la tabla fechas_rfc
            cursor.execute("""
                INSERT INTO fechasrfcs (IdCliente, FechaAproximadadeclarar, DiasHabiles, createdAt, updatedAt)
                VALUES (%s, %s, %s, %s, %s)
            """, (id_cliente, fecha_calculada, dias_agregados, datetime.datetime.now(), datetime.datetime.now()))
            
            resultados.append({
                "RFC": rfc,
                "IdCliente": id_cliente,
                "fecha_calculada": fecha_calculada,
                "dias_agregados": dias_agregados
            })
        else:
            print(f"Error: Formato incorrecto para el item {item}", file=sys.stderr)  # Mensaje de error a stderr

    # Confirmar los cambios y cerrar la conexión
    conexion.commit()
    cursor.close()
    conexion.close()

    return resultados

if __name__ == "__main__":
    try:
        data = json.loads(sys.argv[1])
        rfcs = data.get("RFCs", [])
        
        if not rfcs:
            print(json.dumps({"error": "No se proporcionaron RFCs"}))
        else:
            resultados = procesar_rfcs(rfcs)
            print(json.dumps({"resultados": resultados}))
    except json.JSONDecodeError:
        print(json.dumps({"error": "El formato del JSON es inválido"}))
