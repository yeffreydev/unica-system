"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/config/apiClient";

interface Field {
  id: number;
  label: string;
  type: string;
  order: number;
}

interface FieldValue {
  fieldId: number;
  field: Field;
  value?: string;
  values?: string[];
}

interface FormSubmission {
  id: number;
  formId: number;
  userId?: number;
  createdAt: string;
  values: FieldValue[];
}

interface Form {
  id: number;
  title: string;
  fields: Field[];
}

const LoanApplicationsDashboard = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const formId = 1; // Replace with actual form ID or make dynamic

  // Fetch form and submissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch form to get field definitions
        const formResponse = await apiClient.get(`/forms/${formId}`);
        setForm(formResponse.data);

        // Fetch submissions
        const submissionsResponse = await apiClient.get(
          `/forms/${formId}/submissions`
        );
        setSubmissions(submissionsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load submissions. Please try again.");
      }
    };

    fetchData();
  }, []);

  // Helper to format field value
  const formatFieldValue = (fieldValue: FieldValue): string => {
    const { field, value, values } = fieldValue;
    if (values && values.length > 0) {
      return values.join(", ");
    }
    if (value) {
      if (field.type === "date") {
        return new Date(value).toLocaleDateString();
      }
      if (field.type === "number") {
        const num = parseFloat(value);
        return isNaN(num)
          ? value
          : num >= 1000
          ? `$${num.toLocaleString()}`
          : num.toString();
      }
      return value;
    }
    return "N/A";
  };

  // Helper to get field value by field ID
  const getFieldValue = (
    submission: FormSubmission,
    fieldId: number
  ): FieldValue | undefined => {
    return submission.values.find((fv) => fv.fieldId === fieldId);
  };

  // Filter submissions based on search term
  const filteredSubmissions = submissions.filter((submission) => {
    return submission.values.some((fv) => {
      const value = formatFieldValue(fv).toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    });
  });

  // Select key fields for table (e.g., first few fields or configure as needed)
  const tableFields =
    form?.fields.sort((a, b) => a.order - b.order).slice(0, 4) || []; // Show up to 4 fields in table

  const handleViewDetails = (submission: FormSubmission): void => {
    setSelectedSubmission(submission);
    setIsDialogOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <Card className="max-w-6xl mx-auto">
          <CardContent>
            <p className="text-red-500 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Solicitudes de Préstamo</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <Input
              placeholder="Buscar en todas las respuestas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                {tableFields.map((field) => (
                  <TableHead key={field.id}>{field.label}</TableHead>
                ))}
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  {tableFields.map((field) => {
                    const fieldValue = getFieldValue(submission, field.id);
                    return (
                      <TableCell key={field.id}>
                        {fieldValue ? formatFieldValue(fieldValue) : "N/A"}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(submission)}
                      className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                    >
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for Submission Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud</DialogTitle>
          </DialogHeader>
          {selectedSubmission && form && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {form.fields
                .sort((a, b) => a.order - b.order)
                .map((field) => {
                  const fieldValue = getFieldValue(
                    selectedSubmission,
                    field.id
                  );
                  return (
                    <div key={field.id} className="space-y-1">
                      <Label className="font-semibold text-gray-700">
                        {field.label}
                      </Label>
                      <p className="text-gray-900">
                        {fieldValue ? formatFieldValue(fieldValue) : "N/A"}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanApplicationsDashboard;
