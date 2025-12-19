"use client";

import { useEffect, useState } from "react";
import apiClient from "@/config/apiClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DepositsWithdrawalsData {
  month: string;
  year: number;
  deposits: number;
  withdrawals: number;
}

export function DepositsWithdrawalsChart() {
  const [data, setData] = useState<DepositsWithdrawalsData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/dashboard/deposits-vs-withdrawals?months=6');
        const chartData: DepositsWithdrawalsData[] = response.data;
        setData(chartData);
      } catch (error) {
        console.error('Error fetching deposits vs withdrawals data:', error);
        setData([]);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-card-foreground">{`Mes: ${label}`}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No hay datos de depósitos y retiros disponibles
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer height={200}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `S/.${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="deposits"
            name="Ingresos"
            fill="#10b981"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="withdrawals"
            name="Egresos"
            fill="#ef4444"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}