"use client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/config/apiClient";


import {  useState } from "react";
import { transformPartnersProfits } from "./utils";
import { DividendsTable } from "./Table";
import { IProfitsResponse } from "./types";

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const generateMonthOptions = () => {
  const options = [];
  const startYear = 2024;
  const startMonth = 0; // January
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  for (let year = startYear; year <= currentYear; year++) {
    const startM = year === startYear ? startMonth : 0;
    const endM = year === currentYear ? currentMonth : 11;
    for (let month = startM; month <= endM; month++) {
      options.push({ value: `${year}-${month}`, label: `${months[month]} ${year}` });
    }
  }
  return options;
};



export default function DividendsPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const oneYearAgo = new Date(currentDate);
  oneYearAgo.setFullYear(currentYear - 1);
  const startYear = oneYearAgo.getFullYear();
  const startMon = oneYearAgo.getMonth();
  const defaultStartMonth = `${startYear}-${startMon}`;
  const [startMonth, setStartMonth] = useState(defaultStartMonth);
  const monthOptions = generateMonthOptions();

  // Calculate end month automatically (12 months after start)
  const calculateEndMonth = (start: string) => {
    const [year, month] = start.split('-').map(Number);
    const startDate = new Date(year, month, 1);
    startDate.setMonth(startDate.getMonth() + 12);
    return `${startDate.getFullYear()}-${startDate.getMonth()}`;
  };

  const endMonth = calculateEndMonth(startMonth);

  const [dividendsData, setDividendsData] = useState<IProfitsResponse>({
    partners: [],
    incomes: { interests: {}, others: {}, },
    expenses: { payouts: {}, others: {} },
    shares: {}
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchProfits = async () => {
    setIsLoading(true);
    const [startYear, startMon] = startMonth.split('-').map(Number);
    const [endYear, endMon] = endMonth.split('-').map(Number);
    const startOfDate = new Date(startYear, startMon, 1).toISOString();
    const endOfDate = new Date(endYear, endMon + 1, 0, 23, 59, 59).toISOString();
    try {
      const res = await apiClient.get(`/profits?startOfDate=${startOfDate}&endOfDate=${endOfDate}`);
      if (res.data) {
        setDividendsData(res.data)
      }
    } catch (error) {
      console.error('Error fetching profits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMonthChange = (value: string) => {
    setStartMonth(value);
  };

  const [isStepsModalOpen, setIsStepsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)


  const transformedData = transformPartnersProfits(dividendsData,startMonth,endMonth);
 

  return (
    <div className="relative flex flex-col p-4 max-w-full">
      <Card className="mb-4">
         <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Distribución de utilidades &quot;Aki Nace&quot;
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Visualiza y gestiona la distribución de dividendos entre socios según el período seleccionado
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setIsStepsModalOpen(true)}
              className="shrink-0"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
                />
              </svg>
              Ver Pasos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex gap-2 flex-1">
              <Select value={startMonth} onValueChange={handleStartMonthChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Mes inicio" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Período: 12 meses</span>
                <span>•</span>
                <span>Hasta: {(() => {
                  const [year, month] = endMonth.split('-').map(Number);
                  return `${months[month]} ${year}`;
                })()}</span>
              </div>
            </div>
            <Button onClick={fetchProfits}>Aplicar filtros</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          
          <div className="overflow-x-auto">
            <DividendsTable startMonth={startMonth} endMonth={endMonth} data={transformedData.data} isLoading={isLoading} />
          </div>
        </CardContent>
      </Card>

      {/* Modal de Pasos */}
      {isStepsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Pasos del Proceso de Dividendos</h2>
              <button
                onClick={() => {
                  setIsStepsModalOpen(false)
                  setCurrentStep(1)
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Navegación de Pasos */}
            <div className="flex border-b">
              {[1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => setCurrentStep(step)}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    currentStep === step
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Paso {step}
                </button>
              ))}
            </div>

            {/* Contenido de los Pasos */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              {currentStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Paso 1: Se calcula las utilidades</h3>
                  {isLoading ? (
                    <div className="flex flex-col gap-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto flex flex-col gap-4">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2 text-left">U. bruta (intereses)</th>
                            <th className="border p-2 text-right">Otros Ingresos</th>
                            <th className="border p-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>

                            <tr  className="hover:bg-muted/50">
                            <td className="border p-2 text-right">
                                S/ {transformedData.dividends.interests.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="border p-2 text-right">
                                S/ {transformedData.dividends.othersIncomes.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </td>
                           <td className="border p-2 text-right">
                                S/ {transformedData.dividends.totalIncomes.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </td>

                            </tr>
                        </tbody>
                      </table>
                      <div>
                        <span>Menos</span>
                      </div>
                       <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2 text-left">Gastos e intereses pagados.</th>
                            <th className="border p-2 text-right">Otros gastos</th>
                            <th className="border p-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>

                            <tr  className="hover:bg-muted/50">
                            <td className="border p-2 text-right">
                                S/ {transformedData.dividends.totalPayouts.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="border p-2 text-right">
                                S/ {transformedData.dividends.otherExpenses.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </td>
                           <td className="border p-2 text-right">
                                S/ {transformedData.dividends.totalExpenses.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </td>

                            </tr>
                        </tbody>
                      </table>

                       <div>
                        <span>Utilidad Neta.</span>
                        <span className="border font-semibold"> S/ {transformedData.dividends.netProfit.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
                       </div>
                      <div>
                        <span>Menos</span>
                      </div>
                      <div>
                         <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2 text-left">Reserva Legal.</th>
                            <th className="border p-2 text-right">Reserva Social</th>
                            <th className="border p-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>

                            <tr  className="hover:bg-muted/50">
                            <td className="border p-2 text-right">
                                S/ {transformedData.dividends.legalFunds.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="border p-2 text-right">
                                S/ {transformedData.dividends.socialFunds.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </td>
                           <td className="border p-2 text-right">
                                S/ {(transformedData.dividends.legalFunds + transformedData.dividends.socialFunds).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </td>

                            </tr>


                        </tbody>
                      </table>
                      </div>

                       <div>
                        <span>Utilidad Distribuida.</span>
                        <span className="border font-semibold"> S/ {transformedData.dividends.profits.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
                       </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Paso 2: Distribución por Socio</h3>
                  {isLoading ? (
                    <div className="flex flex-col gap-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2 text-left">Meses</th>
                            <th className="border p-2 text-right">Total Mensual de Acciones</th>
                            <th className="border p-2 text-right">Meses Trabajados</th>
                            <th className="border p-2 text-left">Accion-mes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transformedData.shareWorks && typeof transformedData.shareWorks === "object"
                            ? Object.entries(transformedData.shareWorks).map(([month, row]) => (
                              <tr key={month} className="hover:bg-muted/50">
                              <td className="border p-2">{month}</td>
                              <td className="border p-2 text-right">{row.totalShares}</td>
                              <td className="border p-2 text-right">{row.works}</td>
                              <td className="border p-2 text-right">{row.shareWorks}</td>
                              </tr>
                            ))
                            : null}
                          <tr className="font-bold bg-muted">
                            <td className="border p-2">Total</td>
                            <td className="border p-2 text-right">
                            {Object.values(transformedData.shareWorks || {}).reduce((sum, row) => sum + (row.totalShares || 0), 0)}
                            </td>
                            <td className="border p-2 text-right"></td>
                            <td className="border p-2 text-right">
                            {Object.values(transformedData.shareWorks || {}).reduce((sum, row) => sum + (row.shareWorks || 0), 0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  {/* <h3 className="text-lg font-semibold mb-4">PASO 3:   Se divide la Utilidad Distribuible .</h3> */}
                  {isLoading ? (
                    <div className="py-4 flex flex-col gap-4">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : (
                    <div className="py-4 flex flex-col gap-4">
                     <div>
                      <span>PASO 3:   Se divide la Utilidad Distribuible .</span> <span className="border p-1 font-semibold">S/. {transformedData.dividends.profits.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span> <span>entre el total de acciones mensuales</span><span className="border p-1 font-semibold">
                        {Object.values(transformedData.shareWorks || {}).reduce((sum, row) => sum + (row.shareWorks || 0), 0)}
                      </span>
                       <span>=</span> <span>
                        { (transformedData.dividends.profits / (Object.values(transformedData.shareWorks || {}).reduce((sum, row) => sum + (row.shareWorks || 0), 0) || 1)).toLocaleString("es-PE", { minimumFractionDigits: 2 }) }
                       </span>
                     </div>
                     <div>
                      PASO 4:   Se multiplica esta utilidad  por el Nº de meses que ha &quot;trabajado&quot; cada acción.  Los resultados son las diferentes utilidades de una acción en un año
                     </div>
                     <div>
                      utilidad de una accion en un Mes = <span className="border font-semibold p-1">
                        { (transformedData.dividends.profits / (Object.values(transformedData.shareWorks || {}).reduce((sum, row) => sum + (row.shareWorks || 0), 0) || 1)).toLocaleString("es-PE", { minimumFractionDigits: 2 }) }
                      </span>
                     </div>
                     <div>
                      <span>Utilidad de una acción en un año</span>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                          <tr className="text-sm bg-muted">
                            {Object.keys(transformedData.monthlyProfits || {}).map(month => {
                            const [mm, yyyy] = month.split("-");
                            const monthIdx = parseInt(mm, 10) - 1;
                            const monthLabel = months[monthIdx] ? months[monthIdx].slice(0, 3) : mm;
                            return (
                              <th key={month} className="border p-2 text-left">
                              {monthLabel}-{yyyy}
                              </th>
                            );
                            })}
                          </tr>
                          </thead>
                          <tbody>
                          <tr>
                            {Object.values(transformedData.monthlyProfits || {}).map((data, idx) => (
                            <td key={idx} className="border p-2 text-right">
                              {data.profit.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                            </td>
                            ))}
                          </tr>
                          </tbody>
                        </table>
                      </div>
                     </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-between p-4 border-t">
              {currentStep === 3 ? (
                <>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 border rounded-md hover:bg-muted"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => {
                      setIsStepsModalOpen(false)
                      setCurrentStep(1)
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Paso {currentStep} de 3
                  </span>
                  <button
                    onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                    disabled={currentStep === 3}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                  >
                    Siguiente
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
