"use client";
import React, { useRef } from 'react';
import 'katex/dist/katex.min.css';
import {InlineMath,BlockMath,} from 'react-katex';




import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, FileText, ListChecks, Users } from "lucide-react";


const ActaKatexPdf: React.FC = () => {

  // String LaTeX: recuerda usar doble barra \\ en vez de \
  const latex = `
  \\begin{aligned}
  &\\textbf{1.\\ Multas} \\\\
  &\\quad \\textbf{Gino Aza\\~nay D\\'avila}: \\text{S/ } 5.00 \\text{ por inasistencia.} \\\\
  &\\quad \\textbf{Total recaudado}: \\text{S/ } 5.00. \\\\[6pt]

  &\\textbf{2.\\ Compra de acciones} \\\\
  &\\quad \\textbf{Jos\\'e Chi\\'on Ayay} \\text{ compr\\'o } 10 \\text{ acciones.} \\\\
  &\\quad \\textbf{Total recaudado}: \\text{S/ } 100.00. \\\\[6pt]

  &\\textbf{3.\\ Recuperaci\\'on de pr\\'estamos} \\\\
  &\\quad
  \\begin{array}{lccc}
  \\hline
  \\text{Socio} & \\text{Inter\\'es (S/)} & \\text{Capital (S/)} & \\text{Cuota Total (S/)}\\\\
  \\hline
  \\text{Jos\\'e Chi\\'on Ayay} & 0.30 & 28.20 & 28.50 \\\\
  \\text{Jos\\'e Chi\\'on Ayay} & 1.10 & 50.00 & 51.10 \\\\
  \\hline
  \\textbf{Totales} & \\textbf{1.40} & \\textbf{78.20} & \\textbf{79.60} \\\\
  \\hline
  \\end{array} \\\\
  &\\quad \\textbf{Total recaudado por recuperaci\\'on de pr\\'estamos: S/ 79.60}. \\\\[6pt]

  &\\textbf{4.\\ Otorgamiento de nuevos pr\\'estamos} \\\\
  &\\quad \\textbf{Jos\\'e Chi\\'on Ayay} \\text{ solicita un pr\\'estamo por S/ 60.00 a 9 meses,} \\\\
  &\\quad \\text{modalidad de cuota a rebajar al 1\\% de inter\\'es.} \\\\[6pt]

  &\\textbf{5.\\ Acuerdos finales} \\\\
  &\\quad \\text{Se dio por finalizada la reuni\\'on a las 22:13 del mismo d\\'ia.} \\\\
  &\\quad \\text{Todos los presentes firmaron en se\\~nal de conformidad.}
  \\end{aligned}
  `;

  return (
<BlockMath math={latex} />
  );
};



export default function Review() {
  const agendaItems: { duration: string; title: string; detail: string }[] = [
    { duration: "10:00", title: "Aporte de Acciones", detail: "Verificación de quórum y saludo de bienvenida." },
    { duration: "07:10", title: "Lectura de acta anterior", detail: "Resumen y aprobación del acta previa." },
    { duration: "07:25", title: "Agenda del día", detail: "Presentación de puntos a tratar: ahorros, créditos, social y varios." },
    { duration: "07:35", title: "Aportes y compras de acciones", detail: "Registro de compras y actualización de capital social." },
    { duration: "07:50", title: "Ahorros e intereses", detail: "Recepción de depósitos y actualización de saldos." },
    { duration: "08:10", title: "Solicitudes de crédito", detail: "Evaluación rápida y acuerdos de aprobación." },
    { duration: "08:35", title: "Acuerdos y cierre", detail: "Revisión de acuerdos, firma y cierre oficial." },
  ];

  return (
    <div className='flex flex-col gap-5'>
       <Card className="shadow-sm border border-gray-300 bg-white">
        <CardHeader className="">
        <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 text-primary shadow-sm">
               <ListChecks className="w-5 h-5" />
           </div>
           <div>
              <CardTitle className="text-lg font-semibold font-serif">Agenda detallada</CardTitle>
              <CardDescription className="text-sm font-serif">Guía cronológica de la sesión</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Duración</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agendaItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.duration.split(':')[0]} minutos</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.detail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        </Card>
         <Card className="shadow-sm border border-gray-300 bg-white">
        <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 text-primary shadow-sm">
               <ListChecks className="w-5 h-5" />
           </div>
           <div>
              <CardTitle className="text-lg font-semibold font-serif">Lectura Acta Anterior</CardTitle>
              <CardDescription className="text-sm font-serif"> Registro oficial de acuerdos y decisiones</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
      <div className="bg-[#fffdfa] border border-gray-300">
        <ActaKatexPdf />
      </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow" onClick={() => window.print?.()}>
              <FileText className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button className="shadow-sm hover:shadow-md transition-shadow" onClick={() => console.log("Descargar acta (simulado)")}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Descargar acta
            </Button>
          </div>
 
        </CardContent>
  
         
        </Card>
       
    </div>
  )
}


