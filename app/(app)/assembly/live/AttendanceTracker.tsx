"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, DollarSign, UserPlus, Trash2, Search, Clock, CircleDot, Banknote, AlertTriangle, Loader2 } from "lucide-react";
import { sileo } from "sileo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiGetAssemblyRun, apiUpdateParticipantStatusInAssemblyRun, apiCreateOtherIncomesTransaction, apiGetOtherIncomesByScheduleRun, apiDeleteOtherIncomesTransactionAssembly, apiUpdateParticipantInAssemblyRun, apiGetFinesConfig, IFinesConfig } from "../api";
import { useAssembly } from "../AssemblyContext";
import { IAssemblyScheduleRun, ParticipantStatusTypes } from "../types";
import { translateParticipantStatus } from "../utils";
import { ComboBoxUsers } from "@/components/combobox/ComboboxUsers";
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import { IUser } from "@/types/IUser";
import { OtherIncomesTags } from "@/constants";
import { IOtherIncome } from "../../incomes/others/types";

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  attended: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  absent: {
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  late: {
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  registered: {
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    icon: <CircleDot className="w-3.5 h-3.5" />,
  },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.registered;
}

export function AttendanceTracker() {
  const { assembly } = useAssembly();
  const { users } = useContext(AppContext);
  const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  const [payments, setPayments] = useState<Record<string, { amount: number; transactionIds: string[] }>>({});
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [confirmChange, setConfirmChange] = useState<{ id: string; status: ParticipantStatusTypes } | null>(null);
  const [confirmDeletePayment, setConfirmDeletePayment] = useState<string | null>(null);
  const [confirmRemoveParticipant, setConfirmRemoveParticipant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fines, setFines] = useState<IFinesConfig>({
    lateFineAmount: 5,
    absenceFineAmount: 20,
    consecutiveAbsencesLimit: 3,
    consecutiveAbsencesFine: 50,
  });
  const [payingId, setPayingId] = useState<string | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await apiGetFinesConfig();
        if (cfg) setFines(cfg);
      } catch (error) {
        console.error("Error fetching fines config:", error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!assembly?.lastRun) return;
      const data = await apiGetAssemblyRun(assembly.lastRun.id);
      setAssemblyRun(data);

      if (data.id) {
        try {
          const otherIncomes = await apiGetOtherIncomesByScheduleRun(data.id);
          const userData: Record<string, { amount: number; transactionIds: string[] }> = {};
          otherIncomes.forEach((income: IOtherIncome) => {
            const uid = income.userId || "";
            if (!userData[uid]) {
              userData[uid] = { amount: 0, transactionIds: [] };
            }
            userData[uid].amount += income.amount;
            userData[uid].transactionIds.push(income.id);
          });
          const newPayments: Record<string, { amount: number; transactionIds: string[] }> = {};
          data.participants.forEach((attendee) => {
            if (!attendee.user?.id) return;
            const userDataEntry = userData[attendee.user.id];
            if (userDataEntry) {
              newPayments[attendee.id] = userDataEntry;
            }
          });
          setPayments(newPayments);
        } catch (error) {
          console.error("Error fetching other incomes:", error);
        }
      }
    })();
  }, [assembly?.lastRun]);

  if (!assembly) return null;
  if (!assembly.lastRun) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 text-center text-muted-foreground">
          No hay una asamblea en curso.
        </CardContent>
      </Card>
    );
  }

  const handleStatusChange = async (participantId: string, status: ParticipantStatusTypes) => {
    if (updatingStatusId) return;
    const participant = assemblyRun?.participants.find((p) => p.id === participantId);
    setUpdatingStatusId(participantId);
    try {
      const paymentData = payments[participantId];
      if (paymentData?.amount > 0 && paymentData.transactionIds.length > 0) {
        for (const transactionId of paymentData.transactionIds) {
          await apiDeleteOtherIncomesTransactionAssembly(transactionId);
        }
      }

      if (!assembly.lastRun?.id) return;
      const data = await apiUpdateParticipantStatusInAssemblyRun(participantId, status);
      if (!data || data.count === 0) {
        throw new Error("No se pudo actualizar el estado");
      }

      const updatedAttendees =
        assemblyRun?.participants?.map((attendee) =>
          attendee.id === participantId
            ? { ...attendee, status, time: status === ParticipantStatusTypes.ATTENDED || status === ParticipantStatusTypes.LATE ? new Date().toLocaleTimeString() : undefined }
            : attendee
        ) || [];
      setAssemblyRun((prev) => (prev ? { ...prev, participants: updatedAttendees } : prev));
      setPayments((prev) => ({ ...prev, [participantId]: { amount: 0, transactionIds: [] } }));

      sileo.success({
        title: "Estado actualizado",
        description: `${participant?.user?.name} ${participant?.user?.lastname} marcado como ${translateParticipantStatus(status).toLowerCase()}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      sileo.error({
        title: "Error",
        description: "No se pudo actualizar el estado del participante.",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeletePayment = async (participantId: string) => {
    if (deletingPaymentId) return;
    const participant = assemblyRun?.participants.find((p) => p.id === participantId);
    setDeletingPaymentId(participantId);
    try {
      const paymentData = payments[participantId];
      if (paymentData?.transactionIds.length > 0) {
        for (const transactionId of paymentData.transactionIds) {
          await apiDeleteOtherIncomesTransactionAssembly(transactionId);
        }
      }
      setPayments((prev) => ({ ...prev, [participantId]: { amount: 0, transactionIds: [] } }));
      setConfirmDeletePayment(null);
      sileo.success({
        title: "Pago eliminado",
        description: `Se eliminó el pago de ${participant?.user?.name}.`,
      });
    } catch (error) {
      console.error("Error deleting payment:", error);
      sileo.error({ title: "Error", description: "No se pudo eliminar el pago." });
    } finally {
      setDeletingPaymentId(null);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const participant = assemblyRun?.participants.find((p) => p.id === participantId);
      if (!participant || !assemblyRun?.id || !participant.user?.id) return;

      await apiUpdateParticipantInAssemblyRun(assemblyRun.id, {
        userId: participant.user.id,
        action: "remove",
      });
      const updatedData = await apiGetAssemblyRun(assemblyRun.id);
      setAssemblyRun(updatedData);
      setConfirmRemoveParticipant(null);
      sileo.success({
        title: "Participante eliminado",
        description: `${participant.user.name} fue removido de la asamblea.`,
      });
    } catch (error) {
      console.error("Error removing participant:", error);
      sileo.error({
        title: "Error",
        description: "No se puede eliminar. El participante puede tener pagos registrados.",
      });
    }
  };

  const handleAddAttendee = async () => {
    if (!selectedUser || !assemblyRun?.id) return;
    try {
      await apiUpdateParticipantInAssemblyRun(assemblyRun.id, {
        userId: selectedUser.id,
        action: "add",
      });
      const updatedData = await apiGetAssemblyRun(assemblyRun.id);
      setAssemblyRun(updatedData);
      sileo.success({
        title: "Participante agregado",
        description: `${selectedUser.name} ${selectedUser.lastname} fue agregado a la asamblea.`,
      });
      setSelectedUser(null);
      setOpenAddModal(false);
    } catch (error) {
      console.error("Error adding participant:", error);
      sileo.error({ title: "Error", description: "No se pudo agregar el participante." });
    }
  };

  const handlePayment = async (attendee: IAssemblyScheduleRun["participants"][0]) => {
    if (!attendee.user?.id) return;
    if (payingId) return;
    setPayingId(attendee.id);
    try {
      const description = attendee.status === ParticipantStatusTypes.LATE ? "Pago por tardanza en asamblea" : "Pago por falta en asamblea";
      const data = await apiCreateOtherIncomesTransaction({
        userId: attendee.user.id,
        description,
        amount,
        date: assemblyRun!.startAt,
        scheduleRunId: assembly.lastRun!.id,
        tag: attendee.status === ParticipantStatusTypes.LATE ? OtherIncomesTags.LATE : OtherIncomesTags.ABSENCE,
      });
      const transactionId = data.id;
      setPayments((prev) => {
        const existing = prev[attendee.id];
        const newAmount = (existing ? existing.amount : 0) + amount;
        const newIds = existing ? [...existing.transactionIds, transactionId] : [transactionId];
        return { ...prev, [attendee.id]: { amount: newAmount, transactionIds: newIds } };
      });
      setOpenModal(null);
      sileo.success({
        title: "Pago registrado",
        description: `S/ ${amount.toFixed(2)} cobrado a ${attendee.user.name}.`,
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      sileo.error({ title: "Error", description: "No se pudo registrar el pago. Revisa tu conexión e intenta de nuevo." });
    } finally {
      setPayingId(null);
    }
  };

  const suggestedFineFor = (attendee: IAssemblyScheduleRun["participants"][0]) => {
    if (attendee.status === ParticipantStatusTypes.LATE) return fines.lateFineAmount;
    if (attendee.status === ParticipantStatusTypes.ABSENT) {
      const consecutive = (attendee.consecutiveAbsencesCount ?? 0) + 1;
      if (consecutive >= fines.consecutiveAbsencesLimit) return fines.consecutiveAbsencesFine;
      return fines.absenceFineAmount;
    }
    return 0;
  };

  const availableUsers =
    users?.filter((user) => !assemblyRun?.participants?.some((participant) => participant.user?.id === user.id)) || [];

  const presentCount = assemblyRun?.participants?.filter((a) => a.status === ParticipantStatusTypes.ATTENDED).length || 0;
  const absentCount = assemblyRun?.participants?.filter((a) => a.status === ParticipantStatusTypes.ABSENT).length || 0;
  const lateCount = assemblyRun?.participants?.filter((a) => a.status === ParticipantStatusTypes.LATE).length || 0;
  const totalCount = assemblyRun?.participants?.length || 0;
  const quorumPercent = totalCount > 0 ? ((presentCount + lateCount) / totalCount) * 100 : 0;
  const totalCollected = Object.values(payments).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Card className="w-full overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-base font-semibold">Control de Asistencia</CardTitle>
          <Button onClick={() => setOpenAddModal(true)} size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
            <UserPlus className="w-3.5 h-3.5" />
            Agregar
          </Button>
        </div>

        {/* Stats Row - Compact */}
        {assemblyRun && (
          <div className="space-y-3 pb-4">
            {/* Quorum bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${quorumPercent >= 50 ? "bg-emerald-500" : "bg-red-500"}`}
                    style={{ width: `${Math.min(quorumPercent, 100)}%` }}
                  />
                </div>
              </div>
              <span className={`text-sm font-bold tabular-nums ${quorumPercent >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {quorumPercent.toFixed(0)}%
              </span>
            </div>

            {/* Counters inline */}
            <div className="flex items-center gap-2 flex-wrap">
              <CounterPill count={presentCount} label="Presentes" dotColor="bg-emerald-500" />
              <CounterPill count={lateCount} label="Tardanzas" dotColor="bg-amber-500" />
              <CounterPill count={absentCount} label="Ausentes" dotColor="bg-red-500" />
              <div className="h-4 w-px bg-border mx-1" />
              <span className="text-xs text-muted-foreground">{presentCount + lateCount}/{totalCount}</span>
              {totalCollected > 0 && (
                <>
                  <div className="h-4 w-px bg-border mx-1" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">S/ {totalCollected.toFixed(2)}</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      {/* Add Participant Dialog */}
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal} modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Participantes</DialogTitle>
            <DialogDescription>Lista de participantes actuales y opción para agregar nuevos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {assemblyRun?.participants?.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {participant.user?.name?.[0]}
                      {participant.user?.lastname?.[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {participant.user?.name} {participant.user?.lastname}
                      </div>
                      <div className="text-xs text-muted-foreground">{translateParticipantStatus(participant.status)}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmRemoveParticipant(participant.id)}
                    disabled={payments[participant.id]?.amount > 0}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-sm">Agregar Nuevo Participante</h4>
              <ComboBoxUsers users={availableUsers} controller={{ userSelected: selectedUser, setUserSelected: setSelectedUser }} />
              <Button onClick={handleAddAttendee} className="w-full" disabled={!selectedUser}>
                Agregar Participante
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CardContent className="p-0">
        {!assemblyRun ? (
          <div className="px-5 pb-5 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="px-5 pt-1 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-muted/30 border-0 focus-visible:ring-1 text-sm"
                />
              </div>
            </div>

            {/* Attendees List */}
            <div className="px-5 pb-5 space-y-1.5 max-h-[500px] overflow-y-auto">
              {assemblyRun?.participants
                ?.filter((attendee) => {
                  if (!searchQuery.trim()) return true;
                  const fullName = `${attendee.user?.name ?? ""} ${attendee.user?.lastname ?? ""}`.toLowerCase();
                  return fullName.includes(searchQuery.toLowerCase());
                })
                .map((attendee) => {
                  const config = getStatusConfig(attendee.status);
                  const hasPaid = payments[attendee.id]?.amount > 0;
                  const rowBg =
                    attendee.status === ParticipantStatusTypes.ATTENDED
                      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900"
                      : attendee.status === ParticipantStatusTypes.LATE
                      ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900"
                      : attendee.status === ParticipantStatusTypes.ABSENT
                      ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900"
                      : "bg-card";
                  const consecutive = attendee.consecutiveAbsencesCount ?? 0;
                  const consecutiveAtRisk = consecutive >= fines.consecutiveAbsencesLimit - 1 && consecutive > 0;
                  return (
                    <div key={attendee.id} className={`group flex items-center gap-3 p-3 rounded-xl border hover:shadow-sm transition-all ${rowBg}`}>
                      {/* Avatar */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {attendee.user?.name?.[0]}
                        {attendee.user?.lastname?.[0]}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {attendee.user?.name} {attendee.user?.lastname}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 gap-1 font-medium border ${config.color}`}>
                            {config.icon}
                            {translateParticipantStatus(attendee.status)}
                          </Badge>
                          {(attendee.absencesCount ?? 0) > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              Total faltas: {attendee.absencesCount}
                            </span>
                          )}
                          {consecutive > 0 && (
                            <span className={`text-[10px] flex items-center gap-0.5 ${consecutiveAtRisk ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                              {consecutiveAtRisk && <AlertTriangle className="w-2.5 h-2.5" />}
                              Consecutivas: {consecutive}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Payment Badge */}
                      {hasPaid && (
                        <button
                          onClick={() => setConfirmDeletePayment(attendee.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/60 transition-colors"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          S/ {payments[attendee.id].amount.toFixed(2)}
                        </button>
                      )}

                      {/* Fine Button */}
                      {(attendee.status === ParticipantStatusTypes.LATE || attendee.status === ParticipantStatusTypes.ABSENT) && (
                        <Dialog open={openModal === attendee.id} onOpenChange={(open) => setOpenModal(open ? attendee.id : null)}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 shrink-0"
                              onClick={() => {
                                setAmount(suggestedFineFor(attendee));
                                setOpenModal(attendee.id);
                              }}
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Cobrar {attendee.status === ParticipantStatusTypes.LATE ? "Tardanza" : "Falta"}
                              </DialogTitle>
                              <DialogDescription>
                                Registrar cobro para {attendee.user?.name} {attendee.user?.lastname}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                              {attendee.status === ParticipantStatusTypes.ABSENT && ((attendee.consecutiveAbsencesCount ?? 0) + 1) >= fines.consecutiveAbsencesLimit && (
                                <div className="flex items-start gap-2 p-2.5 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span>
                                    Este socio ha acumulado {(attendee.consecutiveAbsencesCount ?? 0) + 1} faltas consecutivas. Se sugiere aplicar la multa por faltas consecutivas (S/ {fines.consecutiveAbsencesFine.toFixed(2)}).
                                  </span>
                                </div>
                              )}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Monto (S/)</label>
                                <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} disabled={payingId === attendee.id} />
                                <p className="text-[11px] text-muted-foreground">
                                  Sugerencia según configuración: S/ {suggestedFineFor(attendee).toFixed(2)}
                                </p>
                              </div>
                              <Button onClick={() => handlePayment(attendee)} className="w-full" disabled={payingId === attendee.id}>
                                {payingId === attendee.id ? (
                                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registrando...</>
                                ) : (
                                  "Confirmar Cobro"
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Status Buttons */}
                      <div className="flex gap-1 shrink-0">
                        <StatusButton
                          active={attendee.status === ParticipantStatusTypes.ATTENDED}
                          disabled={updatingStatusId === attendee.id}
                          activeColor="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                          onClick={() => {
                            if (attendee.status === ParticipantStatusTypes.ATTENDED) return;
                            if (payments[attendee.id]?.amount > 0) {
                              setConfirmChange({ id: attendee.id, status: ParticipantStatusTypes.ATTENDED });
                            } else {
                              handleStatusChange(attendee.id, ParticipantStatusTypes.ATTENDED);
                            }
                          }}
                        >
                          {updatingStatusId === attendee.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </StatusButton>
                        <StatusButton
                          active={attendee.status === ParticipantStatusTypes.LATE}
                          disabled={updatingStatusId === attendee.id}
                          activeColor="bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                          onClick={() => {
                            if (attendee.status === ParticipantStatusTypes.LATE) return;
                            if (payments[attendee.id]?.amount > 0) {
                              setConfirmChange({ id: attendee.id, status: ParticipantStatusTypes.LATE });
                            } else {
                              handleStatusChange(attendee.id, ParticipantStatusTypes.LATE);
                            }
                          }}
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </StatusButton>
                        <StatusButton
                          active={attendee.status === ParticipantStatusTypes.ABSENT}
                          disabled={updatingStatusId === attendee.id}
                          activeColor="bg-red-600 hover:bg-red-700 text-white border-red-600"
                          onClick={() => {
                            if (attendee.status === ParticipantStatusTypes.ABSENT) return;
                            if (payments[attendee.id]?.amount > 0) {
                              setConfirmChange({ id: attendee.id, status: ParticipantStatusTypes.ABSENT });
                            } else {
                              handleStatusChange(attendee.id, ParticipantStatusTypes.ABSENT);
                            }
                          }}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </StatusButton>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Confirm Status Change Dialog */}
            <Dialog open={!!confirmChange} onOpenChange={() => setConfirmChange(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar cambio de estado</DialogTitle>
                  <DialogDescription>
                    <strong>{assemblyRun?.participants.find((p) => p.id === confirmChange?.id)?.user?.name}</strong> tiene un pago de{" "}
                    <strong>S/ {payments[confirmChange?.id || ""]?.amount || 0}</strong>. Al cambiar el estado a{" "}
                    <strong>{translateParticipantStatus(confirmChange?.status || ParticipantStatusTypes.ATTENDED).toLowerCase()}</strong>, se eliminará el pago.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      if (confirmChange) handleStatusChange(confirmChange.id, confirmChange.status);
                      setConfirmChange(null);
                    }}
                    className="flex-1"
                  >
                    Sí, cambiar
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmChange(null)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Confirm Delete Payment Dialog */}
            <Dialog open={!!confirmDeletePayment} onOpenChange={() => setConfirmDeletePayment(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar Pago</DialogTitle>
                  <DialogDescription>
                    ¿Eliminar el pago de <strong>{assemblyRun?.participants.find((p) => p.id === confirmDeletePayment)?.user?.name}</strong>? Esta acción no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirmDeletePayment) handleDeletePayment(confirmDeletePayment);
                    }}
                    className="flex-1"
                    disabled={!!deletingPaymentId}
                  >
                    {deletingPaymentId ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Eliminando...</>) : "Eliminar Pago"}
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmDeletePayment(null)} className="flex-1" disabled={!!deletingPaymentId}>
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Confirm Remove Participant Dialog */}
            <Dialog open={!!confirmRemoveParticipant} onOpenChange={() => setConfirmRemoveParticipant(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar Participante</DialogTitle>
                  <DialogDescription>
                    ¿Eliminar a <strong>{assemblyRun?.participants.find((p) => p.id === confirmRemoveParticipant)?.user?.name}</strong> de la asamblea? Esta acción no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirmRemoveParticipant) handleRemoveParticipant(confirmRemoveParticipant);
                    }}
                    className="flex-1"
                  >
                    Eliminar
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmRemoveParticipant(null)} className="flex-1">
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

function CounterPill({ count, label, dotColor }: { count: number; label: string; dotColor: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className="font-semibold tabular-nums">{count}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function StatusButton({ active, activeColor, onClick, children, disabled }: { active: boolean; activeColor: string; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
        active ? activeColor : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/50"
      }`}
    >
      {children}
    </button>
  );
}
