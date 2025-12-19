- [x] 1.⁠ ⁠poner la data en un solo lado steps
- [ ] 2.⁠ ⁠poner el router y el layout para los steps
- [ ] 3.⁠ ⁠completar los diseños de los steps.
- [x] 4.⁠ ⁠agrupar el menu


!urgent
- [ ] edit, add dates, in stocks



## 
- [ ] validar si ya paso la hora de la asamblea, pero aun no se ha creado su instancia de ejecucion.
- [x] poner el header tipo neon o trello para la parte superior y con un fondo
- [x] agregar solicitud de prestamo. con usuario y monto.
- [x] al momento de aprobar
- [x] mostrar nombre del usuario logeado



### bugs
- [ ] al dar click en guardar prestamos, solo se debe dar un click hasta esperar por la respuesta de la solicitud.

agregale un fondo al topheader tanto para light y dark. ponle relacionado ocn el tema




- [x] mover totalees de acciones en la partes superior
- [x] mover totalees de interese en la partes superior
- [x] cambiar de Pago de interes a pago de prestamos


- [x] credit application
- [x] cambir column initalInstallments to initialInstallments


/*
1. [x] crear credit application.
2. [x] si se aprueba, crear el loan con el monto, tipo de prestamo y las cuotas.
3. [x] si se rechaza, actualizar el estado y eliminar el loan si es que ya se creo.
4.[x] poder eliminar la solicitud si es que no se ha aprobado. si se ha aprobado, eliminar pero tambien eliminar el loan y las cuotas y todo lo relacionado.
5.[x] listar las solicitudes de credito en creditApplications {creditApplications,loan: (loans with installments)}
*/


- [ ] cada pago darle su link de lo que ha pagado, un comprobante 
- [] se cobra 2 soles por solicitud de prestamo.


1. (cuota fija) es interes + mas capital.
2. (cuota al rebatir). el interes baja mientras baja el capital, el capital se mantiene
3. (cuota variable). el interes y el capital es variable, y disminuye en ambos casos.
4. (cuota al vencimiento), se paga solo interes y en el ultimo mes se paga el capital.


- [ ] llenar toda la data
- [ ] fondo social y reserva legal (que se pueda enviar sin usuario).
- [ ] hacer calculos
- [ ] los usuarios que tenga balance en UserBalance,  (acciones, ahorros,)



Nueva Unica 2.0 

Qipi 1.o
qipi 1.0

- [ ] si no paga una multa o tardanza, esta bien, puedes pagarlo el siguiente mes, pero se te quedara como un prestamo, osea tienes que pagar el interes.

- [ ] hacer documentacion 
- [ ] poder hacer el balance de los prestamos en live y el balance de las cuotas. desde el adminsitrador de prestamos correguir eso. y que seiempre te calcule la cuotas
- [x] integrar operaciones en la asamblea.



#ERRORES 
- [x] al crear nueva accion no multiplica por el precio
- [x] en la lista de una asamblea, se duplica mucho los usuarios
- [ ] calcular cuotas correctamente segun el tipo de prestamo.
- [ ] hacer bien la documentacion para gestionar las asambleas.
- [x] ingresos se cruza en la fila de acumulados al mes anterior, hay un error, donde se cruza la suma de fondo social con reserva legal.
- [x] en el reporte de ingresos en interes obtiene un dato de intereses pagado de egresos.
- [x] sumas totales en pasos de la asamblea


#FEATURES
- [x] pagar faltas y tardanzas al llamar lista.
- [x] operaciones 
- [x] disenar logica de utilidades.
- [ ] en prestamos agregar balance, que es el prestamo vigente por pagar, y a partir de ahi poder generar cuotas. 
- [ ] hacer dashboard con data real.
- [ ] configuracion de faltas y tardanzas.


## entregable
- [ ] asamblea, donde pudes adminstrar los participantes de una instancia y de la asamblea general.
- [ ] y poder configurar las fechas de la asamblea.
- [ ] poder pagar bien las tardanzas.
- [ ] ver las cuotas reales que toca pagar a un usuario durante la asamblea, bueno correguir junto con saldo sobrante de un prestamo.
- [ ] poder realizar las operacioens durante la asamblea.
# sprint 
- [ ] subir un nuevo proyecto 


# Modulo de prestamos.
- [ ] calcular cuotas y balance de un prestamo.
# Modulo Asamblea
- [x] agregar el paso de operaciones
- [ ] configuracion y administracion.
- [ ] que faltas y tardanzas sea configurable.
- [ ] crear bien la acta anterior y actual.


# MOdulo Utilidades
- [ ] mostrar los pasos. (ver passos)

- bugs
- [ ] en la parte de pagar en la asistencia que no se envie doble ves.
- [ ] en compra de acciones evitar que se envie dos veces.
- [ ] traer cantidad de falta al llamar de lista.
- [ ] poder llenar bien un usuario, con telefono y email.s,


- FEATURES
- [] en pagos de capital e interes en los totales, tner suma de capital, suma de interes.


namig
- [] recolectar interes cambiar a Pagos de prestamos en el paso de la asamblea.


#fix 02
en usuarios que se adapte al modo oscuro la tabla
que si esta en / y no esta loegado que rediriga a /login
poder crear bien el usuario xd

- mostrar mensaje de error al crear usuario que diga usuario ya existe con dni tal