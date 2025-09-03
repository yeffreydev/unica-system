"use client";

import { useState } from "react";
import { Users, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Attendee {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'late';
  time?: string;
}

interface AttendanceTrackerProps {
  onAttendanceUpdate?: (attendees: Attendee[]) => void;
}

export function AttendanceTracker({ onAttendanceUpdate }: AttendanceTrackerProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: '1', name: 'Juan Pérez', status: 'present' },
    { id: '2', name: 'María García', status: 'present' },
    { id: '3', name: 'Carlos López', status: 'absent' },
    { id: '4', name: 'Ana Rodríguez', status: 'late' },
    { id: '5', name: 'Luis Martínez', status: 'present' },
  ]);
  const [newAttendee, setNewAttendee] = useState('');

  const handleStatusChange = (id: string, status: 'present' | 'absent' | 'late') => {
    const updatedAttendees = attendees.map(attendee => 
      attendee.id === id 
        ? { ...attendee, status, time: status === 'present' || status === 'late' ? new Date().toLocaleTimeString() : undefined }
        : attendee
    );
    setAttendees(updatedAttendees);
    onAttendanceUpdate?.(updatedAttendees);
  };

  const handleAddAttendee = () => {
    if (newAttendee.trim()) {
      const newAttendeeObj: Attendee = {
        id: Date.now().toString(),
        name: newAttendee.trim(),
        status: 'present',
        time: new Date().toLocaleTimeString()
      };
      const updatedAttendees = [...attendees, newAttendeeObj];
      setAttendees(updatedAttendees);
      setNewAttendee('');
      onAttendanceUpdate?.(updatedAttendees);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'absent': return <XCircle className="w-4 h-4" />;
      case 'late': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const presentCount = attendees.filter(a => a.status === 'present').length;
  const absentCount = attendees.filter(a => a.status === 'absent').length;
  const lateCount = attendees.filter(a => a.status === 'late').length;
  const totalCount = attendees.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Users className="w-5 h-5" />
          <span>Control de Asistencia</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{presentCount}</div>
            <div className="text-xs text-green-600 dark:text-green-400">Presentes</div>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{lateCount}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Tardanzas</div>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">{absentCount}</div>
            <div className="text-xs text-red-600 dark:text-red-400">Ausentes</div>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalCount}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total</div>
          </div>
        </div>

        {/* Add new attendee */}
        <div className="flex space-x-2">
          <Input
            placeholder="Agregar asistente..."
            value={newAttendee}
            onChange={(e) => setNewAttendee(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddAttendee()}
          />
          <Button onClick={handleAddAttendee} size="sm" className="flex items-center space-x-1">
            <UserPlus className="w-4 h-4" />
            <span>Agregar</span>
          </Button>
        </div>

        {/* Attendees list */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {attendees.map((attendee) => (
            <div key={attendee.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex-1">
                <div className="font-medium text-foreground">{attendee.name}</div>
                {attendee.time && (
                  <div className="text-xs text-muted-foreground">Hora: {attendee.time}</div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(attendee.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(attendee.status)}
                    <span className="capitalize">{attendee.status}</span>
                  </div>
                </Badge>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant={attendee.status === 'present' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(attendee.id, 'present')}
                    className="h-8 w-8 p-0"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={attendee.status === 'late' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(attendee.id, 'late')}
                    className="h-8 w-8 p-0"
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={attendee.status === 'absent' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(attendee.id, 'absent')}
                    className="h-8 w-8 p-0"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 