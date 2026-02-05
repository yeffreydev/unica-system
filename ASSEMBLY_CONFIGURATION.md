# Configuración de Frecuencia de Asamblea

El sistema de Agenda de Asamblea utiliza un formato de frecuencia flexible basado en expresiones **Cron** (formato de asteriscos) para determinar automáticamente la fecha de la próxima asamblea.

## Modos de Configuración

Existen dos modos principales para configurar la frecuencia:

### 1. Frecuencia Simple (Mensual)
Configura la asamblea para que ocurra un día específico de cada mes.

*   **Configuración UI**: "Día del Mes" (Ej: 15)
*   **Formato Interno (Cron)**: `MM HH DD * *`
    *   `MM`: Minutos
    *   `HH`: Hora
    *   `DD`: Día del mes seleccionado
*   **Ejemplo**: El día 15 de cada mes a las 10:00 AM -> `0 10 15 * *`

### 2. Frecuencia Avanzada (Ocurrencia Semanal)
Permite configurar la asamblea basándose en el día de la semana (por ejemplo, "El primer lunes del mes" o "El último viernes del mes").

*   **Configuración UI**: 
    *   "Ocurrencia Semanal": Primero, Segundo, Tercero, Cuarto, Último.
    *   "Día de la Semana": Lunes - Domingo.
*   **Formato Interno (Cron)**: `MM HH * * DIA#OCURRENCIA` o `MM HH * * DIA-L`
    *   `DIA`: 0-7 (donde 1=Lunes, ... 7=Domingo/0=Domingo)
    *   `#OCURRENCIA`: Indica la n-ésima ocurrencia del día en el mes (Ej: `#1` para el primero, `#2` para el segundo).
    *   `L`: Indica la última ocurrencia del día en el mes (Ej: `5L` = Último Viernes).
*   **Ejemplo**: Primer Lunes del mes a las 10:00 AM -> `0 10 * * 1#1`
*   **Ejemplo**: Último Viernes del mes a las 18:30 PM -> `30 18 * * 5L`

## Cálculo de Próxima Ejecución

El sistema calcula automáticamente la fecha de la próxima asamblea (`nextRun`) utilizando la última fecha de ejecución registrada y la expresión Cron configurada.

1.  Si no hay ejecuciones previas, calcula la próxima fecha válida a partir de hoy.
2.  Si hay una ejecución previa, calcula la próxima fecha válida posterior a esa ejecución.

Esta lógica garantiza que las asambleas se programen de manera consistente según la configuración establecida.
