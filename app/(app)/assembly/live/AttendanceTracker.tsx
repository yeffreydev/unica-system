"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, DollarSign, UserPlus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiGetAssemblyRun, apiUpdateParticipantStatusInAssemblyRun, apiCreateOtherIncomesTransaction, apiGetOtherIncomesByScheduleRun, apiDeleteOtherIncomesTransactionAssembly } from "../api";
import { useAssembly } from "../AssemblyContext";
import { IAssemblyScheduleRun, ParticipantStatusTypes } from "../types";
import { translateParticipantStatus } from "../utils";
import { ComboBoxUsers } from "@/components/combobox/ComboboxUsers";
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import { IUser } from "@/types/IUser";
import { OtherIncomesTags } from "@/constants";
import { IOtherIncome } from "../../incomes/others/types";


export function AttendanceTracker() {
  const { assembly } = useAssembly();
  const { users } = useContext(AppContext);
  const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  const [payments, setPayments] = useState<Record<string, {amount: number; transactionIds: string[]}>>({});
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [confirmChange, setConfirmChange] = useState<{id: string, status: ParticipantStatusTypes} | null>(null);
  const [confirmDeletePayment, setConfirmDeletePayment] = useState<string | null>(null);
 
  useEffect(() => {
    //get assembly run
    (async () => {
      if (!assembly?.lastRun) return;
      const data = await apiGetAssemblyRun(assembly.lastRun.id);
      console.log({ data });
      setAssemblyRun(data);
    
      // Fetch other incomes for payments
      if (data.id) {
        try {
          const otherIncomes = await apiGetOtherIncomesByScheduleRun(data.id);
          console.log({ otherIncomes });
          const userData: Record<string, {amount: number; transactionIds: string[]}> = {};
          otherIncomes.forEach((income: IOtherIncome) => {
            const uid = income.userId || '';
            if (!userData[uid]) {
              userData[uid] = {amount: 0, transactionIds: []};
            }
            userData[uid].amount += income.amount;
            userData[uid].transactionIds.push(income.id);
          });
          const newPayments: Record<string, {amount: number; transactionIds: string[]}> = {};
            data.participants.forEach((attendee) => {
            const userDataEntry = userData[attendee.user.id];
            if (userDataEntry) {
              newPayments[attendee.id] = userDataEntry;
            }
            });
          setPayments(newPayments);
        } catch (error) {
          console.error('Error fetching other incomes:', error);
        }
      }
    })();
  }, [assembly?.lastRun]);

  if (!assembly) {
   return null;
  }
  if (!assembly.lastRun) {
    return <div className="p-4">No hay una asamblea en curso.</div>;
  }

  const handleStatusChange = async (participantId: string, status: ParticipantStatusTypes) => {
    try {
      // Delete payments if exist
      const paymentData = payments[participantId];
      if (paymentData?.amount > 0 && paymentData.transactionIds.length > 0) {
        for (const transactionId of paymentData.transactionIds) {
          await apiDeleteOtherIncomesTransactionAssembly(transactionId);
        }
      }

      //fetch to patch endpoint
    if (!assembly.lastRun?.id) return;
    const data = await apiUpdateParticipantStatusInAssemblyRun( participantId, status);
    if (!data || data.count === 0) {
      throw new Error('No se pudo actualizar el estado del participante');
    }

    const updatedAttendees = assemblyRun?.participants.map(attendee =>

      attendee.id === participantId
        ? { ...attendee, status, time: status === ParticipantStatusTypes.ATTENDED || status === ParticipantStatusTypes.LATE ? new Date().toLocaleTimeString() : undefined }
        : attendee
    );
    setAssemblyRun(prev => prev ? { ...prev, participants: updatedAttendees || [] } : prev);
    setPayments(prev => ({ ...prev, [participantId]: {amount: 0, transactionIds: []} }));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  
  };

  const handleDeletePayment = async (participantId: string) => {
    try {
      const paymentData = payments[participantId];
      if (paymentData?.transactionIds.length > 0) {
        for (const transactionId of paymentData.transactionIds) {
          await apiDeleteOtherIncomesTransactionAssembly(transactionId);
        }
      }
      setPayments(prev => ({ ...prev, [participantId]: {amount: 0, transactionIds: []} }));
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'registered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'MISSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'absent': return <XCircle className="w-4 h-4" />;
      case 'late': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const handleAddAttendee = () => {
    if (!selectedUser) return;
    // TODO: implement add participant API
    console.log('Add attendee:', selectedUser);
    setSelectedUser(null);
    setOpenAddModal(false);
  };

  const presentCount = assemblyRun?.participants.filter(a => a.status === ParticipantStatusTypes.ATTENDED).length || 0;
  const absentCount = assemblyRun?.participants.filter(a => a.status === ParticipantStatusTypes.ABSENT).length || 0;
  const lateCount = assemblyRun?.participants.filter(a => a.status === ParticipantStatusTypes.LATE).length || 0;
  const totalCount = assemblyRun?.participants.length || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Users className="w-5 h-5" />
            <span>Control de Asistencia</span>
          </CardTitle>
          <Button onClick={() => setOpenAddModal(true)} size="sm" className="flex items-center space-x-1">
            <UserPlus className="w-4 h-4" />
            <span>Agregar Participante</span>
          </Button>
        </div>
      </CardHeader>
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal} modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Participante</DialogTitle>
            <DialogDescription>
              Selecciona un usuario para agregarlo como participante a la asamblea.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ComboBoxUsers
              users={users}
              controller={{ userSelected: selectedUser, setUserSelected: setSelectedUser }}
            />
            <Button onClick={handleAddAttendee} className="w-full" disabled={!selectedUser}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <CardContent className="space-y-4">
        {!assemblyRun ? (
          <>
            {/* Loading Statistics */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <Skeleton className="h-6 w-8 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                <Skeleton className="h-6 w-8 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                <Skeleton className="h-6 w-8 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                <Skeleton className="h-6 w-8 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>

            {/* Loading Attendees List */}
            <div className="space-y-2 max-h-128 overflow-y-auto">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex space-x-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{presentCount}</div>
                <div className="text-xs text-green-600 dark:text-green-400">Presentes</div>
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{lateCount}</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">Tardanzas</div>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">{absentCount}</div>
                <div className="text-xs text-red-600 dark:text-red-400">Ausentes</div>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalCount}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Total</div>
              </div>
            </div>

            {/* Attendees list */}
            <div className="space-y-2 max-h-128 overflow-y-auto">
              {assemblyRun?.participants.map((attendee) => (
                <div key={attendee.id} className={`flex items-center justify-between p-2 border rounded ${(attendee.status === ParticipantStatusTypes.LATE || attendee.status === ParticipantStatusTypes.ABSENT) && (payments[attendee.id]?.amount == null || payments[attendee.id]?.amount === 0) ? 'bg-red-100 dark:bg-red-900/20' : ''}`}>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{attendee.user.name}</div>
                    {/* {attendee.time && (
                      <div className="text-xs text-muted-foreground">Hora: {attendee.time}</div>
                    )} */}

                      <div className="text-xs text-muted-foreground">{attendee.user.lastname}</div>


                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(attendee.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(attendee.status)}
                        <span className="capitalize">{translateParticipantStatus(attendee.status)}</span>
                      </div>
                    </Badge>
                    {payments[attendee.id]?.amount > 0 && (
                      <Button
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 h-auto px-2 py-1"
                        onClick={() => setConfirmDeletePayment(attendee.id)}
                      >
                        Pagado: ${payments[attendee.id].amount}
                        <Info className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                    {(attendee.status === ParticipantStatusTypes.LATE || attendee.status === ParticipantStatusTypes.ABSENT) && (
                      <Dialog open={openModal === attendee.id} onOpenChange={(open) => setOpenModal(open ? attendee.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => { setAmount(attendee.status === ParticipantStatusTypes.LATE ? 5 : 20); setOpenModal(attendee.id); }}>
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Pagar {attendee.status === ParticipantStatusTypes.LATE ? 'Tardanza' : 'Falta'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="amount" className="block text-sm font-medium">Monto</label>
                              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                            </div>
                            <p>¿Confirmar pago para {attendee.user.name} {attendee.user.lastname}?</p>
                            <Button onClick={async () => {
                              try {
                                const description = attendee.status === ParticipantStatusTypes.LATE ? 'Pago por tardanza en asamblea' : 'Pago por falta en asamblea';
                                const data = await apiCreateOtherIncomesTransaction({
                                  userId: attendee.user.id,
                                  description,
                                  amount,
                                  date: assemblyRun.startAt,
                                  scheduleRunId: assembly.lastRun!.id,
                                  tag: attendee.status === ParticipantStatusTypes.LATE ? OtherIncomesTags.LATE : OtherIncomesTags.ABSENCE,
                                });
                                const transactionId = data.id;
                                setPayments(prev => {
                                  const existing = prev[attendee.id];
                                  const newAmount = (existing ? existing.amount : 0) + amount;
                                  const newIds = existing ? [...existing.transactionIds, transactionId] : [transactionId];
                                  return { ...prev, [attendee.id]: {amount: newAmount, transactionIds: newIds} };
                                });
                                setOpenModal(null);
                              } catch (error) {
                                console.error('Error creating payment:', error);
                                // Optionally show toast error
                              }
                            }} className="w-full">
                              Confirmar Pago
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant={attendee.status === ParticipantStatusTypes.ATTENDED ? 'default' : 'outline'}
                        onClick={() => {
                          if (attendee.status === ParticipantStatusTypes.ATTENDED) return;
                          if (payments[attendee.id]?.amount > 0) {
                            setConfirmChange({id: attendee.id, status: ParticipantStatusTypes.ATTENDED});
                          } else {
                            handleStatusChange(attendee.id, ParticipantStatusTypes.ATTENDED);
                          }
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={attendee.status === ParticipantStatusTypes.LATE ? 'default' : 'outline'}
                        onClick={() => {
                          if (attendee.status === ParticipantStatusTypes.LATE) return;
                          if (payments[attendee.id]?.amount > 0) {
                            setConfirmChange({id: attendee.id, status: ParticipantStatusTypes.LATE});
                          } else {
                            handleStatusChange(attendee.id, ParticipantStatusTypes.LATE);
                          }
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={attendee.status === ParticipantStatusTypes.ABSENT ? 'default' : 'outline'}
                        onClick={() => {
                          if (attendee.status === ParticipantStatusTypes.ABSENT) return;
                          if (payments[attendee.id]?.amount > 0) {
                            setConfirmChange({id: attendee.id, status: ParticipantStatusTypes.ABSENT});
                          } else {
                            handleStatusChange(attendee.id, ParticipantStatusTypes.ABSENT);
                          }
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Dialog open={!!confirmChange} onOpenChange={() => setConfirmChange(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar cambio de estado</DialogTitle>
                  <DialogDescription>
                    El participante {assemblyRun?.participants.find(p => p.id === confirmChange?.id)?.user.name || ''} tiene un pago de ${payments[confirmChange?.id || '']?.amount || 0}. ¿Estás seguro de que deseas cambiar el estado a {translateParticipantStatus(confirmChange?.status || ParticipantStatusTypes.ATTENDED)}? Esto eliminará el pago.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => {
                      if (confirmChange) {
                        handleStatusChange(confirmChange.id, confirmChange.status);
                      }
                      setConfirmChange(null);
                    }}
                    className="flex-1"
                  >
                    Sí, cambiar estado
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmChange(null)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={!!confirmDeletePayment} onOpenChange={() => setConfirmDeletePayment(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar Pago</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que deseas eliminar el pago de {assemblyRun?.participants.find(p => p.id === confirmDeletePayment)?.user.name || ''}?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => {
                      if (confirmDeletePayment) {
                        handleDeletePayment(confirmDeletePayment);
                      }
                      setConfirmDeletePayment(null);
                    }}
                    className="flex-1"
                  >
                    Sí, eliminar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDeletePayment(null)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
} 