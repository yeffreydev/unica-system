"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssembly } from "@/context/AssemblyContext";

interface AssemblyTimerProps {
  stepName: string;
}

export function AssemblyTimer({ stepName }: AssemblyTimerProps) {
  const { assemblyState, updateTotalTime } = useAssembly();
  const [isRunning, setIsRunning] = useState(false);
  const [localTime, setLocalTime] = useState(assemblyState.totalTime);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setLocalTime((prevTime) => {
          const newTime = prevTime + 1;
          updateTotalTime(newTime);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, updateTotalTime]);

  // Sync with global state
  useEffect(() => {
    setLocalTime(assemblyState.totalTime);
  }, [assemblyState.totalTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setLocalTime(0);
    updateTotalTime(0);
  };

  const getStepDuration = () => {
    if (!assemblyState.stepStartTime) return 0;
    return Math.floor((Date.now() - assemblyState.stepStartTime) / 1000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Clock className="w-5 h-5" />
          <span>Timer - {stepName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-foreground mb-2">
            {formatTime(localTime)}
          </div>
          <div className="text-sm text-muted-foreground">
            Tiempo total de la asamblea
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Iniciar</span>
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline" className="flex items-center space-x-2">
              <Pause className="w-4 h-4" />
              <span>Pausar</span>
            </Button>
          )}
          
          <Button onClick={handleReset} variant="outline" className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar</span>
          </Button>
        </div>

        {assemblyState.stepStartTime && (
          <div className="text-center text-sm text-muted-foreground">
            Tiempo en este paso: {formatTime(getStepDuration())}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 