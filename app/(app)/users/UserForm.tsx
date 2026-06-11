"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

import {
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  CheckCircle,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import apiClient from "@/config/apiClient";
import { IUser, IOrgRole } from "@/types/IUser";
import { apiGetOrgRoles } from "./orgRolesApi";

// valor centinela para "sin cargo" (Radix Select no admite value="")
const NO_ORG_ROLE = "none";

interface UserFormProps {
  user?: IUser;
  onSuccess?: () => void;
}

export const UserForm = ({ user, onSuccess }: UserFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgRoles, setOrgRoles] = useState<IOrgRole[]>([]);
  const isEditMode = !!user;

  useEffect(() => {
    apiGetOrgRoles()
      .then(setOrgRoles)
      .catch((e) => console.error("Error cargando cargos:", e));
  }, []);

  const formSchema = z.object({
    dni: z.string().min(8, {
      message: "DNI debe tener al menos 8 caracteres.",
    }),
    name: z.string().min(2, {
      message: "Nombre debe tener al menos 2 caracteres.",
    }),
    lastname: z.string().min(2, {
      message: "Apellido debe tener al menos 2 caracteres.",
    }),
    email: z
      .string()
      .email({
        message: "Ingrese un email válido.",
      })
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .min(9, {
        message: "Teléfono debe tener al menos 9 dígitos.",
      })
      .optional()
      .or(z.literal("")),
    orgRoleId: z.string().optional().or(z.literal("")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dni: user?.dni || "",
      name: user?.name || "",
      lastname: user?.lastname || "",
      email: user?.email || "",
      phone: user?.phone || "",
      orgRoleId: user?.orgRoleId || user?.orgRole?.id || "",
    },
  });

  // Reset form when user changes (for edit mode)
  useEffect(() => {
    if (user) {
      form.reset({
        dni: user.dni || "",
        name: user.name || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: user.phone || "",
        orgRoleId: user.orgRoleId || user.orgRole?.id || "",
      });
    }
  }, [user, form]);

  async function createPostUser(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post("/users", data);
      console.log("Respuesta del servidor:", res);
      if (res.status === 201) {
        onSuccess ? onSuccess() : window?.location.reload();
      } else {
        alert("Error al crear usuario");
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Error al crear usuario");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateUser(data: z.infer<typeof formSchema>) {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.put(`/users/${user.id}`, data);
      console.log("Respuesta del servidor:", res);
      if (res.status === 200) {
        onSuccess ? onSuccess() : window?.location.reload();
      } else {
        alert("Error al actualizar usuario");
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("Error al actualizar usuario");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    if (isEditMode) {
      updateUser(values);
    } else {
      createPostUser(values);
    }
  }

  const nextStep = async () => {
    if (currentStep === 1) {
      // Validar campos del paso 1
      const isValid = await form.trigger(["dni", "name", "lastname"]);
      if (isValid) {
        setCurrentStep(2);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-10 w-full max-w-sm mx-auto">
      <div className="flex items-center w-full">
        {/* Step 1 */}
        <div className="flex flex-col items-center relative flex-1">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
              currentStep >= 1
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {currentStep > 1 ? <CheckCircle size={22} /> : <User size={22} />}
          </div>
          <span className={`absolute -bottom-7 text-xs font-semibold whitespace-nowrap transition-colors ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
            Personal
          </span>
        </div>

        {/* Connector */}
        <div className="flex-auto h-0.5 bg-muted overflow-hidden mx-2">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out" 
              style={{ width: currentStep >= 2 ? '100%' : '0%' }}
            />
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center relative flex-1">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
              currentStep >= 2
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Mail size={22} />
          </div>
          <span className={`absolute -bottom-7 text-xs font-semibold whitespace-nowrap transition-colors ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
            Contacto
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="">
      <div className="max-w-2xl mx-auto">
        <div className="bg-background">
          {/* Header */}
          <div className="px-8 pt-8">
            <h1 className="text-2xl font-bold text-foreground text-center">
              {isEditMode 
                ? "Editar Usuario" 
                : currentStep === 1 
                  ? "Registro de Usuario" 
                  : "Información Adicional"}
            </h1>
            <p className="text-muted-foreground text-center text-sm mt-1">
              {isEditMode
                ? "Modifica los datos del usuario."
                : currentStep === 1
                  ? "Completa los datos personales del nuevo miembro."
                  : "Añade medios de contacto para el usuario."}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="px-8 pt-8">
            <StepIndicator />
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentStep !== 2) {
                    e.preventDefault();
                  }
                }}
                className="space-y-6"
              >
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                    <FormField
                      control={form.control}
                      name="dni"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            DNI
                          </FormLabel>
                          <FormControl>
                            <Input
                              cy-data="user-dni"
                              type="text"
                              placeholder="00000000"
                              className="h-12 rounded-xl border-border bg-background focus:ring-4 focus:ring-primary/10 transition-all"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            Documento de identidad del usuario
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-foreground">
                              Nombres
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                cy-data="user-name"
                                placeholder="Nombres"
                                className="h-12 theme-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-foreground">
                              Apellidos
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                cy-data="user-lastname"
                                placeholder="Apellidos"
                                className="h-12 theme-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-left-5 duration-300">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              cy-data="user-email"
                              placeholder="correo@ejemplo.com"
                              className="h-12 theme-input"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            Correo electrónico del usuario
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Teléfono
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              cy-data="user-phone"
                              placeholder="999 999 999"
                              className="h-12 theme-input"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            Número de teléfono del usuario
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="orgRoleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Cargo en la asociación
                          </FormLabel>
                          <Select
                            value={field.value ? field.value : NO_ORG_ROLE}
                            onValueChange={(v) =>
                              field.onChange(v === NO_ORG_ROLE ? "" : v)
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 theme-input">
                                <SelectValue placeholder="Sin cargo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NO_ORG_ROLE}>Sin cargo</SelectItem>
                              {orgRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs text-muted-foreground">
                            Presidente, Secretario, Tesorero, etc. (opcional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="bg-muted rounded-lg p-4 mt-6">
                    <h3 className="font-medium text-foreground mb-3">
                      Resumen de Información
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">DNI:</span>{" "}
                        {form.watch("dni")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nombres:</span>{" "}
                        {form.watch("name")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Apellidos:</span>{" "}
                        {form.watch("lastname")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        {form.watch("email")}
                      </div>
                    </div>
                  </div>
                )}
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-8 border-t border-border mt-10">
                  {currentStep === 1 ? (
                    <div />
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        prevStep();
                      }}
                      className="flex items-center space-x-2 px-8 py-6 rounded-xl border-border hover:bg-muted transition-all"
                    >
                      <ChevronLeft size={18} />
                      <span>Volver</span>
                    </Button>
                  )}

                  {currentStep === 1 ? (
                    <Button
                      type="button"
                      cy-data="next-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        nextStep();
                      }}
                      className="flex items-center space-x-2 px-10 py-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                    >
                      <span>Siguiente</span>
                      <ChevronRight size={18} />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      cy-data="save-btn"
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-10 py-6 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          <span>{isEditMode ? "Actualizar Usuario" : "Confirmar Registro"}</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
