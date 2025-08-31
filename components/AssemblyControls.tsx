import {  Pause, Play, RotateCcw } from "lucide-react"

export const AssemblyControls = () => {
    const { assemblyState, handleStartAssembly, handlePause, handleResume, handleStop } = {
        assemblyState: {
            isActive: false,
        },
        handleStartAssembly: () => {},
        handlePause: () => {},
        handleResume: () => {},
        handleStop: () => {},
    }
    const isPaused = false;
    const elapsedTime = 0;
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return (
        <div className="flex items-center space-x-4">
        {/* Controles de Asamblea */}
        {!assemblyState.isActive ? (
          <button
            onClick={handleStartAssembly}
            className="flex items-center space-x-2 bg-primary text-primary-foreground py-1 px-2 rounded hover:bg-primary/90 transition-colors duration-200"
            title="Iniciar Asamblea"
          >
            <Play className="w-6 h-6" />
            <span className="font-semibold text-sm">Iniciar Asamblea</span>
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="text-sm font-mono font-bold text-foreground">
              {formatTime(elapsedTime)}
            </div>
            <div className="flex space-x-2">
              {!isPaused ? (
                <button
                  onClick={handlePause}
                  className="bg-secondary text-secondary-foreground py-1 px-2 rounded hover:bg-secondary/80 transition-colors duration-200"
                  title="Pausar"
                >
                  <Pause className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="bg-secondary text-secondary-foreground py-1 px-2 rounded hover:bg-secondary/80 transition-colors duration-200"
                  title="Reanudar"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleStop}
                className="bg-destructive text-destructive-foreground py-1 px-2 rounded hover:bg-destructive/90 transition-colors duration-200"
                title="Finalizar"
              >
                {/* <Square className="w-5 h-5" /> */}
                <span className="text-sm">Finalizar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
}