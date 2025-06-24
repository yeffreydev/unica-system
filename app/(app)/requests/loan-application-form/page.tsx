"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/config/apiClient";

interface IField {
  id: number;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  order: number;
}

interface IForm {
  id: number;
  name: string;
  description: string;
  fields: IField[];
}

const LoanApplicationForm = () => {
  const [form, setForm] = useState<IForm | null>(null);
  const [formData, setFormData] = useState<Record<number, string | string[]>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch form data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get("/forms/key/loan-application");
        const data = res.data;
        console.log("Form data:", data);
        setForm(data);
        // Initialize formData
        const initialData: Record<number, string | string[]> = {};
        data.fields.forEach((field: IField) => {
          initialData[field.id] = field.type === "checkbox" ? [] : "";
        });
        setFormData(initialData);
      } catch (err) {
        console.error("Error fetching form:", err);
        setError("Failed to load form. Please try again.");
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (
    fieldId: number,
    value: string,
    isCheckbox: boolean = false
  ) => {
    setFormData((prev) => {
      if (isCheckbox) {
        const currentValues = (prev[fieldId] as string[]) || [];
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [fieldId]: currentValues.filter((v) => v !== value),
          };
        } else {
          return { ...prev, [fieldId]: [...currentValues, value] };
        }
      }
      return { ...prev, [fieldId]: value };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const fieldValues = Object.entries(formData).map(([fieldId, value]) => ({
        fieldId: parseInt(fieldId),
        value: Array.isArray(value) ? undefined : value,
        values: Array.isArray(value) ? value : undefined,
      }));

      const submissionData = {
        userId: null, // Replace with actual user ID if authenticated
        fieldValues,
      };

      await apiClient.post(`/forms/${form.id}/submissions`, submissionData);
      alert("Form submitted successfully!");
      // Reset form
      const resetData: Record<number, string | string[]> = {};
      form.fields.forEach((field) => {
        resetData[field.id] = field.type === "checkbox" ? [] : "";
      });
      setFormData(resetData);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent>
            <p className="text-red-500 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent>
            <p className="text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Formulario de Solicitud de Préstamo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields
              .sort((a, b) => a.order - b.order)
              .map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={`field-${field.id}`}>
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>

                  {["text", "email", "date", "number"].includes(field.type) ? (
                    <Input
                      id={`field-${field.id}`}
                      type={field.type}
                      required={field.required}
                      cy-data={`form-${field.type}`}
                      placeholder={field.placeholder}
                      min={field.minValue}
                      max={field.maxValue}
                      minLength={field.minLength}
                      maxLength={field.maxLength}
                      pattern={field.pattern}
                      value={(formData[field.id] as string) || ""}
                      onChange={(e) =>
                        handleInputChange(field.id, e.target.value)
                      }
                    />
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={`field-${field.id}`}
                      required={field.required}
                      placeholder={field.placeholder}
                      rows={4}
                      value={(formData[field.id] as string) || ""}
                      onChange={(e) =>
                        handleInputChange(field.id, e.target.value)
                      }
                    />
                  ) : field.type === "select" && field.options ? (
                    <Select
                      required={field.required}
                      value={(formData[field.id] as string) || ""}
                      onValueChange={(value) =>
                        handleInputChange(field.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={field.placeholder || "Seleccione"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "checkbox" && field.options ? (
                    <div className="space-y-2">
                      {field.options.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <Checkbox
                            id={`field-${field.id}-${opt}`}
                            checked={(formData[field.id] as string[])?.includes(
                              opt
                            )}
                            onCheckedChange={() =>
                              handleInputChange(field.id, opt, true)
                            }
                          />
                          <Label
                            htmlFor={`field-${field.id}-${opt}`}
                            className="text-sm"
                          >
                            {opt}
                          </Label>
                        </div>
                      ))}
                      {field.required &&
                        (formData[field.id] as string[]).length === 0 && (
                          <p className="text-red-500 text-sm">
                            This field is required
                          </p>
                        )}
                    </div>
                  ) : field.type === "tel" ? (
                    <Input
                      id={`field-${field.id}`}
                      type="tel"
                      required={field.required}
                      placeholder={field.placeholder}
                      pattern={field.pattern}
                      value={(formData[field.id] as string) || ""}
                      onChange={(e) =>
                        handleInputChange(field.id, e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-red-500 text-sm">
                      Unsupported field type
                    </p>
                  )}
                </div>
              ))}

            <div className="text-center">
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Enviar Solicitud"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanApplicationForm;
