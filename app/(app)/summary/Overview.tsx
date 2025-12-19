"use client";

import { useEffect, useState } from "react";
import apiClient from "@/config/apiClient";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface InterestData {
  month: string;
  year: number;
  total: number;
}

export function Overview() {
  const [data, setData] = useState<Array<{ name: string; total: number }>>([]);

  useEffect(() => {
    const fetchInterestData = async () => {
      try {
        const response = await apiClient.get('/dashboard/interest-by-month?months=12');
        const interestData: InterestData[] = response.data;

        // Transform data for the chart - take last 12 months and format for display
        const chartData = interestData
          .slice(0, 12)
          .reverse() // Reverse to show chronological order
          .map(item => ({
            name: item.month.substring(0, 3), // Abbreviate month name
            total: item.total,
          }));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching interest data:', error);
        // Fallback to empty data
        setData([]);
      }
    };

    fetchInterestData();
  }, []);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-card-foreground">{`Mes: ${label}`}</p>
          <p className="text-sm text-primary">
            {`Intereses: ${formatCurrency(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer height={250}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
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
          <Bar
            dataKey="total"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary hover:fill-primary/80 transition-colors"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
