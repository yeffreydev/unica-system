"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'important';
  date: string;
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Próxima Asamblea General',
    content: 'La asamblea general está programada para el próximo viernes 15 de diciembre a las 7:00 PM.',
    type: 'important',
    date: '2025-12-15',
  },
  {
    id: '2',
    title: 'Nuevo período de depósitos',
    content: 'Se ha abierto el período para depósitos del mes de diciembre. Recuerde realizar sus aportes antes del día 20.',
    type: 'info',
    date: '2025-12-01',
  },
  {
    id: '3',
    title: 'Mantenimiento del sistema',
    content: 'El sistema estará en mantenimiento este sábado de 2:00 AM a 4:00 AM. Disculpe las molestias.',
    type: 'warning',
    date: '2025-12-07',
  },
  {
    id: '4',
    title: 'Felicitaciones',
    content: '¡Felicitaciones a todos los socios por alcanzar la meta de capital social este trimestre!',
    type: 'success',
    date: '2025-11-30',
  },
];

export function DashboardNotes() {
  const getIcon = (type: Note['type']) => {
    switch (type) {
      case 'important':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  const getBadgeVariant = (type: Note['type']) => {
    switch (type) {
      case 'important':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      case 'info':
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      {mockNotes.map((note) => (
        <div key={note.id} className="flex items-start gap-2 p-2 rounded-md border bg-card/30 hover:bg-card/50 transition-colors">
          <div className="mt-0.5 flex-shrink-0">
            {getIcon(note.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium truncate">{note.title}</h4>
              <Badge variant={getBadgeVariant(note.type)} className="text-xs px-1 py-0 h-4">
                {note.type === 'important' ? 'Imp' :
                 note.type === 'warning' ? 'Adv' :
                 note.type === 'success' ? 'Ok' : 'Info'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
            <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-1">
              <Calendar className="h-2.5 w-2.5" />
              {formatDate(note.date)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}