import { ClipboardCheck, FileCheck, FileText, PiggyBank, TrendingUp, Users, Wallet, type LucideIcon } from "lucide-react";

export interface IAssemblyStep {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  details?: string[];
  status?: 'pending' | 'active' | 'completed';
}
export const assemblySteps: IAssemblyStep[] = [
  {
    id: 1,
    title: "Lista",
    description: "",
    icon: Users,
    details: [
      "Verificar quórum mínimo",
      "Registrar asistencia de miembros",
      "Confirmar inicio de sesión"
    ]
  },
  {
    id: 2,
    title: "Acciones",
    description: "",
    icon: TrendingUp,
    details: [
      "Registrar compras de acciones",
      "Actualizar capital social",
      "Emitir certificados"
    ]
  },
  {
    id: 3,
    title: "Intereses",
    description: "",
    icon: PiggyBank,
    details: [
      "Recibir pagos de intereses",
      "Actualizar saldos de intereses",
      "Emitir comprobantes de pago"
    ]
  },
  {
    id: 4,
    title: "Ahorristas",
    description: "",
    icon: Wallet,
    details: [
      "Registrar nuevos ahorros",
      "Pagar intereses a ahorristas",
      "Actualizar saldos de ahorros"
    ]
  },
  {
    id: 5,
    title: "Operaciones",
    description: "",
    icon: TrendingUp,
    details: [
      "Registrar ingresos (depósitos, fondos, otros)",
      "Registrar egresos (retiros, gastos administrativos, pagos, fondos sociales, otros)",
      "Actualizar balances"
    ]
  },
  {
    id: 6,
    title: "Créditos",
    description: "",
    icon: ClipboardCheck,
    details: [
      "Revisar solicitudes",
      "Evaluar capacidad de pago",
      "Tomar decisiones de aprobación"
    ]
  },
  {
    id: 7,
    title: "Resumen",
    description: "",
    icon: FileCheck,
    details: [
      "Documentar acuerdos",
      "Firmar documentos",
      "Archivar expedientes"
    ]
  },
];