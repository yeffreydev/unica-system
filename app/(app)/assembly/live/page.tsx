'use client'

import { useAssembly } from "@/app/(app)/assembly/AssemblyContext";
import { AttendanceTracker } from "./AttendanceTracker";
import Review from "./Review";
import Shares from "./Shares";
import Interests from "./Interests";
import Loans from "./Loans";
// import CashCount from "./CashCount";
import Docs from "./Docs";

export default function AssemblyStep() {


    const {  assemblyState } = useAssembly();
  return <div>
    {assemblyState.currentStep===1 && <AttendanceTracker/>}
    {assemblyState.currentStep===2 && <Review />}
    {assemblyState.currentStep===3 && <Shares />}
    {assemblyState.currentStep===4 && <Interests />}
    {assemblyState.currentStep===5 && <Loans />}
    {/* {assemblyState.currentStep===6 && <CashCount />} */}
    {assemblyState.currentStep===6 && <Docs />}
    {/* {assemblyState.currentStep===7 && <Closing />} */}
  </div>;
}