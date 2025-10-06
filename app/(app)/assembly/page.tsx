"use client";

import { useAssembly } from "@/app/(app)/assembly/AssemblyContext";
import { assemblySteps } from "./steps";
import { useEffect, useMemo, useState } from "react";
// import { AssemblyStartBanner } from "./components/AssemblyStartBanner";
import { AssemblyProgressBanner } from "./components/AssemblyProgressBanner";
import { NextAssemblyCard } from "./components/NextAssemblyCard";
import { HistoricalSummary } from "./components/HistoricalSummary";
import { ScheduleRunStatusesTypes } from "./types";


export default function Assembly() {
   const {
     assemblyState,
     assembly,
     startAssembly,
   } = useAssembly();

   const [elapsed, setElapsed] = useState("00:00:00");
  //  const [waitingElapsed, setWaitingElapsed] = useState("00:00:00");
   const totalSteps = assemblySteps.length;
   const currentStepMeta = useMemo(() => assemblySteps.find(s => s.id === assemblyState.currentStep), [assemblyState.currentStep]);

   // Próxima asamblea (puedes conectar esto a tu backend luego)
   const upcomingDate = useMemo(() => new Date("2025-09-15T19:00:00"), []);

   const upcomingData = useMemo(() => {
     if (!assembly) return null;
     const now = new Date();
     const msUntil = Math.max(new Date(assembly.nextRun).getTime() - now.getTime(), 0);
     const daysUntil = Math.floor(msUntil / (1000 * 60 * 60 * 24));
     const hoursUntil = Math.floor(msUntil / (1000 * 60 * 60)) % 24;
     const upcomingDateLabel = new Date(assembly.nextRun).toLocaleDateString("es-PE", {
       weekday: "long",
       day: "2-digit",
       month: "long",
       year: "numeric",
     });
     const upcomingTimeLabel = new Date(assembly.nextRun).toLocaleTimeString("es-PE", {
       hour: "2-digit",
       minute: "2-digit",
     });
     return { msUntil, daysUntil, hoursUntil, upcomingDateLabel, upcomingTimeLabel };
   }, [assembly]);

   useEffect(() => {
     if (!assemblyState.isActive || !assemblyState.stepStartTime) return;
     const tick = () => {
       const ms = Date.now() - (assemblyState.stepStartTime || Date.now());
       const h = Math.floor(ms / 3600000).toString().padStart(2, "0");
       const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, "0");
       const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
       setElapsed(`${h}:${m}:${s}`);
     };
     tick();
     const id = setInterval(tick, 1000);
     return () => clearInterval(id);
   }, [assemblyState.isActive, assemblyState.stepStartTime]);

   // Tiempo transcurrido SIN iniciar cuando ya es hora
   useEffect(() => {
     if (assemblyState.isActive) return;
     const tick = () => {
       const diff = Date.now() - upcomingDate.getTime();
       if (diff >= 0) {
        //  const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
        //  const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
        //  const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
        //  setWaitingElapsed(`${h}:${m}:${s}`);
       }
     };
     tick();
     const id = setInterval(tick, 1000);
     return () => clearInterval(id);
   }, [assemblyState.isActive, upcomingDate]);

   if (!assembly) {
    return null;
   }
   
   if (!upcomingData) {
     return null;
   }

   const {  daysUntil, hoursUntil, upcomingDateLabel, upcomingTimeLabel } = upcomingData;

  // Simple historical data mock for the summary section
  type PastAssembly = {
    date: string;
    attendees: number;
    durationMin: number;
    approvedItems: number;
    savings: number; // total savings collected
    purchases: number; // total shares purchases
  };

  const pastAssemblies: PastAssembly[] = [
    { date: "2024-06-10", attendees: 38, durationMin: 90, approvedItems: 11, savings: 13250, purchases: 2800 },
    { date: "2024-07-15", attendees: 42, durationMin: 105, approvedItems: 14, savings: 15800, purchases: 3600 },
    { date: "2024-08-20", attendees: 40, durationMin: 98, approvedItems: 12, savings: 14950, purchases: 3250 }
  ];

  const totalAssemblies = pastAssemblies.length;
  const avgAttendees = Math.round(pastAssemblies.reduce((a, b) => a + b.attendees, 0) / Math.max(totalAssemblies, 1));
  const avgDuration = Math.round(pastAssemblies.reduce((a, b) => a + b.durationMin, 0) / Math.max(totalAssemblies, 1));
  const totalSavings = pastAssemblies.reduce((a, b) => a + b.savings, 0);
  const totalPurchases = pastAssemblies.reduce((a, b) => a + b.purchases, 0);

  // const progress = Math.round((assemblyState.currentStep / 8) * 100);

  const handleStartAssembly = () => {
    startAssembly();
  };

    return (
      <div className="px-2 md:px-4 lg:px-6 xl:px-8 2xl:px-10 py-8 flex flex-col gap-4">
        {/* {
          // if (!assemblyState.isActive && msUntil === 0
          Date.now() > new Date(assembly.nextRun).getTime() && (
            <AssemblyStartBanner
              waitingElapsed={waitingElapsed}
              upcomingDateLabel={upcomingDateLabel}
              upcomingTimeLabel={upcomingTimeLabel}
              handleStartAssembly={handleStartAssembly}
            />
          )
        } */}


        {
          // if (!assemblyState.isActive)
          assembly.lastRun?.status === ScheduleRunStatusesTypes.IN_PROGRESS && (
            <AssemblyProgressBanner
              assemblyState={assemblyState}
              elapsed={elapsed}
              totalSteps={totalSteps}
              currentStepMeta={currentStepMeta}
            />
          )
        }

{/* @todo validar bien  */}
      {!assembly.lastRun && <NextAssemblyCard
        upcomingDateLabel={upcomingDateLabel}
        upcomingTimeLabel={upcomingTimeLabel}
        daysUntil={daysUntil}
        hoursUntil={hoursUntil}
        handleStartAssembly={handleStartAssembly}
      />}
      

  {/* Historical Summary */}
       <HistoricalSummary 
        totalAssemblies={totalAssemblies}
        avgAttendees={avgAttendees}
        avgDuration={avgDuration}
        totalSavings={totalSavings}
        totalPurchases={totalPurchases}
        pastAssemblies={pastAssemblies}
       />
      </div>
    );
  

}
