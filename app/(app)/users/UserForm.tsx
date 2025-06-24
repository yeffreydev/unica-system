"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

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
import apiClient from "@/config/apiClient";

export const UserForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dni: "",
      name: "",
      lastname: "",
      email: "",
      phone: "",
    },
  });

  async function createPostUser(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post("/users", data);
      console.log("Respuesta del servidor:", res);
      if (res.status === 201) {
        if (window) window.location.reload();
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    createPostUser(values);
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
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 1
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {currentStep > 1 ? <CheckCircle size={20} /> : <User size={20} />}
        </div>
        <div
          className={`h-1 w-16 ${
            currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 2
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          <Mail size={20} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white">
          {/* Header */}
          <div className=" ">
            <p className="text-blue-800 text-center mt-2">
              {currentStep === 1
                ? "Información Personal"
                : "Información de Contacto"}
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
                className="space-y-6"
              >
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                    <FormField
                      control={form.control}
                      name="dni"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            DNI
                          </FormLabel>
                          <FormControl>
                            <Input
                              cy-data="user-dni"
                              type="text"
                              placeholder="Ingrese el DNI"
                              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
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
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Nombres
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                cy-data="user-name"
                                placeholder="Nombres"
                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Apellidos
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                cy-data="user-lastname"
                                placeholder="Apellidos"
                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              cy-data="user-email"
                              placeholder="correo@ejemplo.com"
                              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
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
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Teléfono
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              cy-data="user-phone"
                              placeholder="999 999 999"
                              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Número de teléfono del usuario
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-6">
                    <h3 className="font-medium text-gray-800 mb-3">
                      Resumen de Información
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">DNI:</span>{" "}
                        {form.watch("dni")}
                      </div>
                      <div>
                        <span className="text-gray-600">Nombres:</span>{" "}
                        {form.watch("name")}
                      </div>
                      <div>
                        <span className="text-gray-600">Apellidos:</span>{" "}
                        {form.watch("lastname")}
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>{" "}
                        {form.watch("email")}
                      </div>
                    </div>
                  </div>
                )}
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  {currentStep === 1 ? (
                    <div></div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex items-center space-x-2 px-6 py-3"
                    >
                      <ChevronLeft size={16} />
                      <span>Anterior</span>
                    </Button>
                  )}

                  {currentStep === 1 ? (
                    <Button
                      type="button"
                      cy-data="next-btn"
                      onClick={nextStep}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700"
                    >
                      <span>Siguiente</span>
                      <ChevronRight size={16} />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      cy-data="save-btn"
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          <span>Guardar Usuario</span>
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
