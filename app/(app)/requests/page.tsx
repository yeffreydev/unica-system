import { CheckCircle, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const requestsData = [
  {
    id: 1,
    title: "Solicitud de Ingresos",
    description: "Es un documento para solicitar el ingreso a la asociación.",
    link: "/requests/income-application-form",
    viewLink: "/requests/view/income-applications",
  },
  {
    id: 2,
    title: "Solicitud de Prestamo",
    description: "Es un documento para solicitar un prestamo a la asociación.",
    link: "/requests/loan-application-form",
    viewLink: "/requests/view/loan-applications",
  },
];

export default function RequestsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-left">
          Formularios Disponibles
        </h1>
        <div className="flex flex-col gap-5">
          {requestsData.map((item) => (
            <Card
              key={item.id}
              className="group relative overflow-hidden border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white"
            >
              <CardHeader className="flex flex-row items-center space-x-4 p-6">
                <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                <CardTitle className="text-lg font-semibold text-foreground">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 p-6 pt-0 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-between">
                <Button
                  asChild
                  cy-data="open-form"
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  <Link
                    href={item.link}
                    className="flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Llenar Formulario
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Link
                    href={item.viewLink}
                    className="flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Solicitudes
                  </Link>
                </Button>
              </CardFooter>
              <div className="absolute inset-0 pointer-events-none border-2 border-indigo-100 rounded-lg group-hover:border-indigo-300 transition-colors duration-300" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
