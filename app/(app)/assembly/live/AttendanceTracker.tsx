"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGetAssemblyRun, apiUpdateParticipantStatusInAssemblyRun } from "../api";
import { useAssembly } from "../AssemblyContext";
import { IAssemblyScheduleRun, ParticipantStatusTypes } from "../types";
import { translateParticipantStatus } from "../utils";


export function AttendanceTracker() {
  const { assembly } = useAssembly();
  const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
 
  useEffect(() => {
    //get assembly run
    (async () => {
      if (!assembly?.lastRun) return;
      const data = await apiGetAssemblyRun(assembly.lastRun.id);
      console.log({ data });
      setAssemblyRun(data);
    })();
  }, [assembly?.lastRun]);

  if (!assembly) {
   return null;
  }
  if (!assembly.lastRun) {
    return <div className="p-4">No hay una asamblea en curso.</div>;
  }

  const handleStatusChange = async (participantId: string, status: ParticipantStatusTypes) => {
    try {
      //fetch to patch endpoint
    if (!assembly.lastRun?.id) return;
    const data = await apiUpdateParticipantStatusInAssemblyRun( participantId, status);
    if (!data || data.count === 0) {
      throw new Error('No se pudo actualizar el estado del participante');
    }

    const updatedAttendees = assemblyRun?.participants.map(attendee => 

      attendee.id === participantId
        ? { ...attendee, status, time: status === ParticipantStatusTypes.ATTENDED || status === ParticipantStatusTypes.LATE ? new Date().toLocaleTimeString() : undefined }
        : attendee
    );
    setAssemblyRun(prev => prev ? { ...prev, participants: updatedAttendees || [] } : prev);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  
  };

 

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'registered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'MISSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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

  const presentCount = assemblyRun?.participants.filter(a => a.status === ParticipantStatusTypes.ATTENDED).length || 0;
  const absentCount = assemblyRun?.participants.filter(a => a.status === ParticipantStatusTypes.ABSENT).length || 0;
  const lateCount = assemblyRun?.participants.filter(a => a.status === ParticipantStatusTypes.LATE).length || 0;
  const totalCount = assemblyRun?.participants.length || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Users className="w-5 h-5" />
          <span>Control de Asistencia</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!assemblyRun ? (
          <>
            {/* Loading Statistics */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <Skeleton className="h-6 w-8 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                <Skeleton className="h-6 w-8 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                <Skeleton className="h-6 w-8 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                <Skeleton className="h-6 w-8 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>

            {/* Loading Attendees List */}
            <div className="space-y-2 max-h-128 overflow-y-auto">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex space-x-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
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

            {/* Add new attendee
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
            </div> */}

            {/* Attendees list */}
            <div className="space-y-2 max-h-128 overflow-y-auto">
              {assemblyRun?.participants.map((attendee) => (
                <div key={attendee.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{attendee.user.name}</div>
                    {/* {attendee.time && (
                      <div className="text-xs text-muted-foreground">Hora: {attendee.time}</div>
                    )} */}

                      <div className="text-xs text-muted-foreground">{attendee.user.lastname}</div>


                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(attendee.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(attendee.status)}
                        <span className="capitalize">{translateParticipantStatus(attendee.status)}</span>
                      </div>
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant={attendee.status === ParticipantStatusTypes.ATTENDED ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(attendee.id, ParticipantStatusTypes.ATTENDED)}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={attendee.status === ParticipantStatusTypes.LATE ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(attendee.id, ParticipantStatusTypes.LATE)}
                        className="h-8 w-8 p-0"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={attendee.status === ParticipantStatusTypes.ABSENT ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(attendee.id, ParticipantStatusTypes.ABSENT)}
                        className="h-8 w-8 p-0"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 