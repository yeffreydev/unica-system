'use client'

import { useAssembly } from "@/app/(app)/assembly/AssemblyContext";
import { AttendanceTracker } from "./AttendanceTracker";
import Review from "./Review";
import Shares from "./Shares";
import Payments from "./Payments";
import Operations from "./Operations";
import Loans from "./Loans";
import Savings from "./Savings";
// import CashCount from "./CashCount";
import Docs from "./Docs";

export default function AssemblyStep() {


     const {  assemblyState } = useAssembly();
   return <div>
     {assemblyState.currentStep===1 && <AttendanceTracker/>}
     {assemblyState.currentStep===2 && <Shares />}
     {assemblyState.currentStep===3 && <Payments />}
     {assemblyState.currentStep===4 && <Savings />}
     {assemblyState.currentStep===5 && <Operations />}
     {assemblyState.currentStep===6 && <Loans />}
     {assemblyState.currentStep===7 && <Docs />}
   </div>;
}