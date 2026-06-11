"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { IUser } from "@/types/IUser";
import { AppContext } from "@/context/AppContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import apiClient from "@/config/apiClient";

const assemblyFormSchema = z.object({
  frequencyType: z.enum(["simple", "advanced"]),
  dayOfMonth: z.number().min(1).max(31).optional().nullable(),
  weekOccurrence: z.string().optional().nullable(),
  weekDay: z.string().optional().nullable(),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  place: z.string().max(160, "Máximo 160 caracteres").optional().nullable(),
});

type AssemblyFormValues = z.infer<typeof assemblyFormSchema>;

const numberMsg = { message: "Ingresa un número válido" };
const finesFormSchema = z.object({
  lateFineAmount: z.number(numberMsg).min(0, "No puede ser negativo"),
  absenceFineAmount: z.number(numberMsg).min(0, "No puede ser negativo"),
  consecutiveAbsencesLimit: z.number(numberMsg).int("Debe ser entero").min(1, "Mínimo 1"),
  consecutiveAbsencesFine: z.number(numberMsg).min(0, "No puede ser negativo"),
});

type FinesFormValues = z.infer<typeof finesFormSchema>;

type NumberInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: number | null | undefined;
  onChange: (n: number) => void;
  integer?: boolean;
};

function NumberInput({ value, onChange, integer, onBlur, ...rest }: NumberInputProps) {
  const toText = (v: number | null | undefined) =>
    v === null || v === undefined || (typeof v === "number" && Number.isNaN(v)) ? "" : String(v);
  const [text, setText] = useState<string>(toText(value));

  useEffect(() => {
    const current = text === "" || text === "." || text === "-" ? NaN : Number(text);
    const valIsEmpty = value === null || value === undefined || (typeof value === "number" && Number.isNaN(value));
    const curIsEmpty = Number.isNaN(current);
    if (valIsEmpty && curIsEmpty) return;
    if (current !== value) {
      setText(toText(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const pattern = integer ? /^\d*$/ : /^\d*\.?\d*$/;

  return (
    <Input
      {...rest}
      type="text"
      inputMode={integer ? "numeric" : "decimal"}
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "" || pattern.test(v)) {
          setText(v);
          if (v === "" || v === ".") {
            onChange(NaN);
          } else {
            const n = Number(v);
            if (!isNaN(n)) onChange(n);
          }
        }
      }}
      onBlur={onBlur}
    />
  );
}

const weekOccurrences = [
  { value: "first", label: "Primero" },
  { value: "second", label: "Segundo" },
  { value: "third", label: "Tercero" },
  { value: "fourth", label: "Cuarto" },
  { value: "last", label: "Último" },
  { value: "penultimate", label: "Penúltimo" },
  { value: "antepenultimate", label: "Antepenúltimo" },
];

const weekDays = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

export function AssemblyConfigForm({ onConfigSaved }: { onConfigSaved?: () => void }) {
  const { users } = useContext(AppContext);
  const form = useForm<AssemblyFormValues>({
    resolver: zodResolver(assemblyFormSchema),
    defaultValues: {
      frequencyType: "simple",
      dayOfMonth: 15,
      hour: 10,
      minute: 0,
      weekOccurrence: undefined,
      weekDay: undefined,
      place: "",
    },
    mode: "onChange",
  });

  const finesForm = useForm<FinesFormValues>({
    resolver: zodResolver(finesFormSchema),
    defaultValues: {
      lateFineAmount: 5,
      absenceFineAmount: 20,
      consecutiveAbsencesLimit: 3,
      consecutiveAbsencesFine: 50,
    },
    mode: "onChange",
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: IUser | null;
    action: "add" | "remove";
  }>({ open: false, user: null, action: "add" });

  const [currentParticipants, setCurrentParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingFines, setSavingFines] = useState(false);
  const [finesLoading, setFinesLoading] = useState(true);
  const [successDialog, setSuccessDialog] = useState(false);
  const [finesSuccessDialog, setFinesSuccessDialog] = useState(false);

  const loadConfig = async () => {
    try {
      const configResponse = await apiClient.get('/settings/assembly/config');
      if (configResponse.data) {
        form.reset(configResponse.data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const applyFinesToForm = (d: any) => {
    finesForm.reset({
      lateFineAmount: Number(d?.lateFineAmount ?? 5),
      absenceFineAmount: Number(d?.absenceFineAmount ?? 20),
      consecutiveAbsencesLimit: Number(d?.consecutiveAbsencesLimit ?? 3),
      consecutiveAbsencesFine: Number(d?.consecutiveAbsencesFine ?? 50),
    });
  };

  const loadFinesConfig = async () => {
    setFinesLoading(true);
    try {
      const res = await apiClient.get('/settings/fines');
      if (res.data) applyFinesToForm(res.data);
    } catch (error) {
      console.error('Error loading fines config:', error);
    } finally {
      setFinesLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      const participantsResponse = await apiClient.get('/settings/assembly');
      const participants = participantsResponse.data.participants.map((p: { userId: string }) => p.userId);
      setCurrentParticipants(participants);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadConfig(), loadParticipants(), loadFinesConfig()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleConfirm = async () => {
    if (!confirmDialog.user) return;

    try {
      setUpdating(confirmDialog.user.id);
      await apiClient.post(`/settings/participants/${confirmDialog.user.id}`, {
        action: confirmDialog.action,
      });

      if (confirmDialog.action === "add") {
        setCurrentParticipants([...currentParticipants, confirmDialog.user.id]);
      } else {
        setCurrentParticipants(currentParticipants.filter(id => id !== confirmDialog.user!.id));
      }

      toast({
        title: "Éxito",
        description: `Participante ${confirmDialog.action === "add" ? "agregado" : "removido"} exitosamente.`,
      });
    } catch (error) {
      console.error('Error updating participant:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el participante.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
      setConfirmDialog({ open: false, user: null, action: "add" });
    }
  };

  const handleCancel = () => {
    setConfirmDialog({ open: false, user: null, action: "add" });
  };

  const openConfirmDialog = (user: IUser, action: "add" | "remove") => {
    setConfirmDialog({ open: true, user, action });
  };

  async function onSubmit(data: AssemblyFormValues) {
    setSaving(true);
    try {
      await apiClient.post('/settings/assembly/config', data);
      await loadConfig();
      setSuccessDialog(true);
      onConfigSaved?.();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function onSubmitFines(data: FinesFormValues) {
    setSavingFines(true);
    try {
      const res = await apiClient.put('/settings/fines', data);
      applyFinesToForm(res.data ?? data);
      setFinesSuccessDialog(true);
      toast({
        title: "Multas actualizadas",
        description: "La configuración de multas se guardó correctamente.",
      });
    } catch (error) {
      console.error('Error saving fines:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de multas.",
        variant: "destructive",
      });
    } finally {
      setSavingFines(false);
    }
  }

  return (
    <Tabs defaultValue="frequency" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="frequency">Frecuencia</TabsTrigger>
        <TabsTrigger value="fines">Multas</TabsTrigger>
        <TabsTrigger value="participants">Participantes</TabsTrigger>
      </TabsList>
      <TabsContent value="frequency" className="mt-6 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="frequencyType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Frecuencia</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Mensual Simple</SelectItem>
                        <SelectItem value="advanced">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Selecciona si quieres una frecuencia simple mensual o configuración avanzada.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("frequencyType") === "simple" && (
              <FormField
                control={form.control}
                name="dayOfMonth"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Día del Mes</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el día" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Selecciona el día del mes para las asambleas mensuales.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

          {form.watch("frequencyType") === "advanced" && (
          <div className="space-y-4 p-4 border rounded-md">
            <FormField
              control={form.control}
              name="weekOccurrence"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Ocurrencia Semanal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ej: Primero, Último" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekOccurrences.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weekDay"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Día de la Semana</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ej: Sábado, Domingo" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        )}

        <FormField
          control={form.control}
          name="place"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Lugar de la asamblea</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Local comunal, Av. Los Andes 123"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormDescription>
                Se mostrará en el acta y en la próxima asamblea programada.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minute"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minutos</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => i % 5 === 0 && (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? "Guardando..." : "Guardar Configuración"}
        </Button>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="fines" className="mt-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configuración de Multas</CardTitle>
            <CardDescription>
              Define los montos que se cobran por tardanza, falta e inasistencias consecutivas.
              Estos valores se aplicarán automáticamente al registrar asistencia en la asamblea en vivo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {finesLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando configuración de multas...</span>
              </div>
            ) : (
            <Form {...finesForm}>
              <form onSubmit={finesForm.handleSubmit(onSubmitFines)} className="space-y-4">
                <FormField
                  control={finesForm.control}
                  name="lateFineAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto de multa por tardanza (S/)</FormLabel>
                      <FormControl>
                        <NumberInput
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormDescription>Se sugiere al cobrar tardanzas en el control de asistencia.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={finesForm.control}
                  name="absenceFineAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto de multa por falta (S/)</FormLabel>
                      <FormControl>
                        <NumberInput
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={finesForm.control}
                    name="consecutiveAbsencesLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faltas consecutivas</FormLabel>
                        <FormControl>
                          <NumberInput
                            integer
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        </FormControl>
                        <FormDescription>Cantidad a partir de la cual se aplica multa extra.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={finesForm.control}
                    name="consecutiveAbsencesFine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto multa consecutiva (S/)</FormLabel>
                        <FormControl>
                          <NumberInput
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={savingFines}>
                  {savingFines && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {savingFines ? "Guardando..." : "Guardar Multas"}
                </Button>
              </form>
            </Form>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="participants" className="mt-6 space-y-4">
        <div className="space-y-4">
          <div className="text-sm font-medium">Participantes de la Asamblea</div>
          <div className="text-sm text-muted-foreground">
            Selecciona los participantes de la asamblea.
          </div>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="text-sm text-muted-foreground">Cargando participantes...</div>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
              {users.map((user: IUser) => (
                <div key={user.id} className="flex items-center justify-between space-x-2">
                  <label
                    htmlFor={`participant-${user.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                  >
                    {user.name}, {user.lastname}
                  </label>
                  <Switch
                    id={`participant-${user.id}`}
                    checked={currentParticipants.includes(user.id)}
                    disabled={updating === user.id}
                    onCheckedChange={() => {
                      const isSelected = currentParticipants.includes(user.id);
                      openConfirmDialog(user, isSelected ? "remove" : "add");
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={confirmDialog.open} onOpenChange={() => setConfirmDialog({ open: false, user: null, action: "add" })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Acción</DialogTitle>
              <DialogDescription>
                {confirmDialog.user && confirmDialog.action === "add"
                  ? `¿Estás seguro de que quieres agregar a ${confirmDialog.user.name} (${confirmDialog.user.lastname}) como participante de la asamblea?`
                  : confirmDialog.user && confirmDialog.action === "remove"
                  ? `¿Estás seguro de que quieres remover a ${confirmDialog.user.name} (${confirmDialog.user.lastname}) de los participantes de la asamblea?`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleConfirm}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración Guardada</DialogTitle>
            <DialogDescription>
              La configuración de la asamblea ha sido actualizada exitosamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessDialog(false)}>
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={finesSuccessDialog} onOpenChange={setFinesSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Multas Guardadas</DialogTitle>
            <DialogDescription>
              La configuración de multas se guardó correctamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setFinesSuccessDialog(false)}>
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
