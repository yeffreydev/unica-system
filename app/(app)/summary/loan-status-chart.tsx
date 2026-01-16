"use client";

import { useEffect, useState } from "react";
import apiClient from "@/config/apiClient";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface LoanStatusData {
  status: string;
  count: number;
  percentage: number;
}

interface ChartData {
  name: string;
  value: number;
  percentage: number;
  status: string;
  [key: string]: string | number;
}

const COLORS = {
  APPROVED: '#10b981', // green
  PENDING: '#f59e0b',  // amber
  REJECTED: '#ef4444', // red
  PAID: '#3b82f6',     // blue
};

const STATUS_LABELS = {
  APPROVED: 'Aprobados',
  PENDING: 'Pendientes',
  REJECTED: 'Rechazados',
  PAID: 'Pagados',
};

export function LoanStatusChart() {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchLoanStatusData = async () => {
      try {
        const response = await apiClient.get('/dashboard/loan-status-distribution');
        const statusData: LoanStatusData[] = response.data;

        // Transform data for the chart
        const chartData = statusData.map(item => ({
          name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
          value: item.count,
          percentage: item.percentage,
          status: item.status,
        }));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching loan status data:', error);
        setData([]);
      }
    };

    fetchLoanStatusData();
  }, []);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percentage: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-card-foreground">
            {data.name}
          </p>
          <p className="text-sm text-primary">
            {`Cantidad: ${data.value}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`${data.percentage}% del total`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No hay datos de préstamos disponibles
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => `${props.name} ${props.percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.status as keyof typeof COLORS] || '#6b7280'}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}