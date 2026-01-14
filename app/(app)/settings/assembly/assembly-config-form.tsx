"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useContext, useEffect, useState } from "react";
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
  frequencyType: z.enum(["simple", "advanced"], {
    required_error: "Selecciona un tipo de frecuencia.",
  }),
  dayOfMonth: z.coerce.number().min(1).max(31).optional().nullable(),
  weekOccurrence: z.string().optional().nullable(),
  weekDay: z.string().optional().nullable(),
  hour: z.coerce.number().min(0).max(23),
  minute: z.coerce.number().min(0).max(59),
});

type AssemblyFormValues = z.infer<typeof assemblyFormSchema>;

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
  const [successDialog, setSuccessDialog] = useState(false);

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

  const loadParticipants = async () => {
    try {
      const participantsResponse = await apiClient.get('/settings/assembly');
      const participants = participantsResponse.data.participants.map((p: { userId: string }) => p.userId);
      setCurrentParticipants(participants);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadConfig(), loadParticipants()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleConfirm = async () => {
    console.log('Confirming action:', confirmDialog);
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
    console.log('Form submitted with data:', data);
    setSaving(true);
    try {
      console.log('Submitting config data:', data);
      await apiClient.post('/settings/assembly/config', data);
      await loadConfig(); // Reload config to reflect changes
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

  return (
    <Tabs defaultValue="frequency" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="frequency">Frecuencia</TabsTrigger>
        <TabsTrigger value="participants">Participantes</TabsTrigger>
      </TabsList>
      <TabsContent value="frequency" className="mt-6 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Frequency Type */}
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

            {/* Day of Month for Simple Monthly */}
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

          {/* Advanced Frequency Options - Conditional */}
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

        {/* Time Configuration */}
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
          {saving ? "Guardando..." : "Guardar Configuración"}
        </Button>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="participants" className="mt-6 space-y-4">
        {/* Participants List */}
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

        {/* Confirmation Dialog */}
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

      {/* Success Dialog */}
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
    </Tabs>
  );
}