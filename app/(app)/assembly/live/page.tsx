'use client'

import { useAssembly } from "@/app/(app)/assembly/AssemblyContext";
import { useEffect, useState } from "react";
import { AttendanceTracker } from "./AttendanceTracker";
import Review from "./Review";
import Shares from "./Shares";
import Payments from "./Payments";
import Operations from "./Operations";
import Loans from "./Loans";
import Savings from "./Savings";
// import CashCount from "./CashCount";
import Docs from "./Docs";
import CelebrationOverlay from "./CelebrationOverlay";

export default function AssemblyStep() {


     const {  assemblyState } = useAssembly();
     const [celebrating, setCelebrating] = useState(false);

     // Mostrar celebración a pantalla completa al entrar al paso 7 (Resumen)
     useEffect(() => {
       if (assemblyState.currentStep === 7) {
         setCelebrating(true);
       }
     }, [assemblyState.currentStep]);

   return <div>
     <CelebrationOverlay open={celebrating} onClose={() => setCelebrating(false)} />
     {assemblyState.currentStep===1 && <AttendanceTracker/>}
     {assemblyState.currentStep===2 && <Shares />}
     {assemblyState.currentStep===3 && <Payments />}
     {assemblyState.currentStep===4 && <Savings />}
     {assemblyState.currentStep===5 && <Operations />}
     {assemblyState.currentStep===6 && <Loans />}
     {assemblyState.currentStep===7 && <Docs />}
   </div>;
}