import { ClipboardCheck, FileCheck, FileText, PiggyBank, TrendingUp, Users, type LucideIcon } from "lucide-react";

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
    title: "Agenda y Acta",
    description: "",
    icon: FileText,
    details: [
      "Presentar agenda del día",
      "Leer acta anterior",
      "Aprobar acta anterior"
    ]
  },
  {
    id: 3,
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
    id: 4,
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
  //    {
  //   id: 6,
  //   title: "Arqueo de Caja con el socio responsable",
  //   description: "Arqueo de caja con el socio responsable",
  //   icon: Flag,
  //   details: [
  //     "Arqueo de caja",
  //   ]
  // },

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
  // {
  //   id: 7,
  //   title: "Llamado de Lista y Terminar Reunión",
  //   description: "Finalizar asamblea con acta de todo lo realizado",
  //   icon: Flag,
  //   details: [
  //     "Hacer llamado final de lista",
  //     "Redactar acta de la reunión",
  //     "Cerrar sesión oficialmente"
  //   ]
  // }
];