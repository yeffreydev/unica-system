import { ClipboardCheck, FileCheck, FileText, Flag, PiggyBank, TrendingUp, Users, type LucideIcon } from "lucide-react";

export interface  IAssemblyStep {
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
      title: "Inicio de Reunión y Llamado de Lista",
      description: "Iniciar la asamblea y verificar la asistencia de los miembros",
      icon: Users,
      details: [
        "Verificar quórum mínimo",
        "Registrar asistencia de miembros",
        "Confirmar inicio de sesión"
      ]
    },
    {
      id: 2,
      title: "Revisar Agenda y Lectura del Acta Anterior",
      description: "Presentar agenda actual y revisar acta de la reunión anterior",
      icon: FileText,
      details: [
        "Presentar agenda del día",
        "Leer acta anterior",
        "Aprobar acta anterior"
      ]
    },
    {
      id: 3,
      title: "Aporte de Compra de Acciones",
      description: "Procesar compras de acciones por parte de los miembros",
      icon: TrendingUp,
      details: [
        "Registrar compras de acciones",
        "Actualizar capital social",
        "Emitir certificados"
      ]
    },
    {
      id: 4,
      title: "Recolectar Ahorros e Intereses",
      description: "Recibir depósitos de ahorro de los miembros",
      icon: PiggyBank,
      details: [
        "Recibir depósitos",
        "Actualizar saldos",
        "Emitir comprobantes"
      ]
    },
    
    {
      id: 5,
      title: "Aplicación a Créditos y Evaluación",
      description: "Procesar solicitudes de crédito y evaluar candidatos",
      icon: ClipboardCheck,
      details: [
        "Revisar solicitudes",
        "Evaluar capacidad de pago",
        "Tomar decisiones de aprobación"
      ]
    },
    {
      id: 6,
      title: "Decisiones y Proceso de Documentación",
      description: "Documentar decisiones tomadas y acuerdos alcanzados",
      icon: FileCheck,
      details: [
        "Documentar acuerdos",
        "Firmar documentos",
        "Archivar expedientes"
      ]
    },
    {
      id: 7,
      title: "Llamado de Lista y Terminar Reunión",
      description: "Finalizar asamblea con acta de todo lo realizado",
      icon: Flag,
      details: [
        "Hacer llamado final de lista",
        "Redactar acta de la reunión",
        "Cerrar sesión oficialmente"
      ]
    }
  ];