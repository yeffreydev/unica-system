"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useContext, useState } from "react";
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
import { Input } from "@/components/ui/input";
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

const assemblyFormSchema = z.object({
  frequencyType: z.enum(["simple", "advanced"], {
    required_error: "Selecciona un tipo de frecuencia.",
  }),
  dayOfMonth: z.coerce.number().min(1).max(31).optional(),
  weekOccurrence: z.string().optional(),
  weekDay: z.string().optional(),
  hour: z.coerce.number().min(0).max(23),
  minute: z.coerce.number().min(0).max(59),
  participants: z.array(z.string()).optional(),
});

type AssemblyFormValues = z.infer<typeof assemblyFormSchema>;

const defaultValues: Partial<AssemblyFormValues> = {
  frequencyType: "simple",
  dayOfMonth: 15,
  hour: 10,
  minute: 0,
  participants: [],
};

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

export function AssemblyConfigForm() {
  const { users } = useContext(AppContext);
  const form = useForm<AssemblyFormValues>({
    resolver: zodResolver(assemblyFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: IUser | null;
    action: "add" | "remove";
  }>({ open: false, user: null, action: "add" });

  const handleConfirm = () => {
    if (confirmDialog.user && confirmDialog.action === "add") {
      form.setValue("participants", [...selectedParticipants, confirmDialog.user.id]);
    } else if (confirmDialog.user && confirmDialog.action === "remove") {
      form.setValue("participants", selectedParticipants.filter(id => id !== confirmDialog.user!.id));
    }
    setConfirmDialog({ open: false, user: null, action: "add" });
  };

  const handleCancel = () => {
    setConfirmDialog({ open: false, user: null, action: "add" });
  };

  const openConfirmDialog = (user: IUser, action: "add" | "remove") => {
    setConfirmDialog({ open: true, user, action });
  };

  function onSubmit(data: AssemblyFormValues) {
    // Here you would send the data to your backend API
    console.log("Assembly config submitted:", data);
    toast({
      title: "Configuración guardada",
      description: "La configuración de la asamblea ha sido actualizada exitosamente.",
    });
  }

  const selectedParticipants = form.watch("participants") || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="frequency" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="frequency">Frecuencia</TabsTrigger>
            <TabsTrigger value="participants">Participantes</TabsTrigger>
          </TabsList>
          <TabsContent value="frequency" className="mt-6 space-y-8">
            {/* Frequency Type */}
            <FormField
              control={form.control}
              name="frequencyType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Frecuencia</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1-31"
                        min={1}
                        max={31}
                        {...field}
                        value={field.value ? field.value.toString() : ""}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value) : undefined;
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
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
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
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
</TabsContent>

<TabsContent value="participants" className="mt-6 space-y-4">
  {/* Participants List */}
  <div className="space-y-4">
    <FormLabel>Participantes de la Asamblea</FormLabel>
    <FormDescription>
      Selecciona los participantes de la asamblea.
    </FormDescription>
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
            checked={selectedParticipants.includes(user.id)}
            onCheckedChange={() => {
              const isSelected = selectedParticipants.includes(user.id);
              openConfirmDialog(user, isSelected ? "remove" : "add");
            }}
          />
        </div>
      ))}
    </div>
  </div>
  <FormMessage>{form.formState.errors.participants?.message}</FormMessage>

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
</Tabs>

<Button type="submit">Guardar Configuración</Button>
    </form>
    </Form>
  );
}