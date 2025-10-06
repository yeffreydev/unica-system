"use client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const defaultEndMonth = `${currentYear}-${currentMonth}`;
  const [startMonth, setStartMonth] = useState(defaultStartMonth);
  const [endMonth, setEndMonth] = useState(defaultEndMonth);
  const monthOptions = generateMonthOptions();

  const [dividendsData, setDividendsData] = useState<IProfitsResponse>({
    partners: [],
    incomes: { interests: {}, others: {}, },
    expenses: { payouts: {}, others: {} },
    shares: {}
  });

  const fetchProfits = async () => {
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
    }
  };

  const handleStartMonthChange = (value: string) => {
    setStartMonth(value);
  };

  const handleEndMonthChange = (value: string) => {
    setEndMonth(value);
  };

  return (
    <div className="relative flex flex-col p-4 max-w-full">
      <Card className="mb-4">
         <CardHeader>
          <CardTitle>Distribuición de utilidades &quot;Aki Nace&quot;</CardTitle>
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
              <Select value={endMonth} onValueChange={handleEndMonthChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Mes fin" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchProfits}>Aplicar filtros</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          
          <div className="overflow-x-auto">
            <DividendsTable startMonth={startMonth} endMonth={endMonth} data={transformPartnersProfits(dividendsData,startMonth,endMonth)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
