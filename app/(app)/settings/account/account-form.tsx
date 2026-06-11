"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import apiClient from "@/config/apiClient";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const accountSchema = z
  .object({
    newDni: z.string().trim().min(4, "DNI inválido").max(20, "Máximo 20 caracteres"),
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z.string().optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine((d) => !d.newPassword || d.newPassword.length >= 6, {
    message: "La nueva contraseña debe tener al menos 6 caracteres",
    path: ["newPassword"],
  })
  .refine((d) => (d.newPassword || "") === (d.confirmPassword || ""), {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type AccountFormValues = z.infer<typeof accountSchema>;

function PasswordInput({
  value,
  onChange,
  onBlur,
  name,
  placeholder,
}: {
  value: string;
  onChange: (...args: any[]) => void;
  onBlur: () => void;
  name: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
        placeholder={placeholder}
        autoComplete="off"
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
        aria-label={show ? "Ocultar" : "Mostrar"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function AccountForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentDni, setCurrentDni] = useState<string>("");

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      newDni: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/auth/account");
        const dni = res.data?.dni ?? "";
        setCurrentDni(dni);
        form.reset({ newDni: dni, currentPassword: "", newPassword: "", confirmPassword: "" });
      } catch (error) {
        console.error("Error loading account:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la cuenta de acceso.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(data: AccountFormValues) {
    const dniChanged = data.newDni.trim() !== currentDni;
    const passwordChanged = !!data.newPassword?.trim();

    if (!dniChanged && !passwordChanged) {
      toast({
        title: "Sin cambios",
        description: "Modifica el DNI o ingresa una nueva contraseña para guardar.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.put("/auth/credentials", {
        currentPassword: data.currentPassword,
        newDni: dniChanged ? data.newDni.trim() : undefined,
        newPassword: passwordChanged ? data.newPassword!.trim() : undefined,
      });

      const nextDni = res.data?.dni ?? data.newDni.trim();
      setCurrentDni(nextDni);
      form.reset({ newDni: nextDni, currentPassword: "", newPassword: "", confirmPassword: "" });

      const parts: string[] = [];
      if (res.data?.dniChanged) parts.push(`Nuevo DNI de acceso: ${nextDni}`);
      if (res.data?.passwordChanged) parts.push("Contraseña actualizada");

      toast({
        title: "Credenciales actualizadas",
        description: parts.join(" · ") || "Los cambios se guardaron correctamente.",
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "No se pudieron actualizar las credenciales. Verifica tu contraseña actual.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span className="text-sm">Cargando cuenta de acceso...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Credenciales de ingreso
        </CardTitle>
        <CardDescription>
          Estas credenciales se usan para iniciar sesión en la plataforma. El DNI funciona como nombre de usuario.
          Necesitas tu contraseña actual para confirmar los cambios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="newDni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI de acceso (usuario)</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="00000000"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    DNI actual: <span className="font-medium text-foreground">{currentDni || "—"}</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-5 space-y-5">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña actual</FormLabel>
                    <FormControl>
                      <PasswordInput
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        placeholder="Tu contraseña actual"
                      />
                    </FormControl>
                    <FormDescription>Requerida para confirmar cualquier cambio.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva contraseña</FormLabel>
                      <FormControl>
                        <PasswordInput
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          placeholder="Dejar en blanco para no cambiar"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar nueva contraseña</FormLabel>
                      <FormControl>
                        <PasswordInput
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          placeholder="Repite la nueva contraseña"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
