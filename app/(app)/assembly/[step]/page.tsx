'use client'

import { useAssembly } from "@/context/AssemblyContext";
import { AttendanceTracker } from "../components/AttendanceTracker";

export default function AssemblyStep() {
    const { updateAttendees } = useAssembly();
  return <div>
 contenido xd
          <AttendanceTracker onAttendanceUpdate={updateAttendees} />
     
  </div>;
}