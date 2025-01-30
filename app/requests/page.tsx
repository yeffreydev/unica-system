import { CheckCircle } from "lucide-react";
import Container from "../ui/Container";

export default function RequestsPage() {
  return (
    <Container>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array(4)
          .fill("")
          .map((_, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 rounded-md border p-4"
            >
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Solicitud de Ingresos
                </p>
                <p className="text-sm text-muted-foreground">
                  Es un documento para solicitar el ingreso a la asociación.
                </p>
              </div>
            </div>
          ))}
      </div>
    </Container>
  );
}
