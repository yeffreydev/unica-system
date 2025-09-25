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




- [] clock en llamado de lista.
- [] mover totalees de acciones en la partes superior
- [] mover totalees de interese en la partes superior
- [] cambiar de Pago de interes a pago de prestamos


- [x] credit application
- [] cambir column initalInstallments to initialInstallments


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
- [ ] integrar operaciones en la asamblea.



#ERRORES 
- [ ] al crear nueva accion no multiplica por el precio
- [ ] en la lista, se duplica mucho los usuarios
- [ ] operaciones 