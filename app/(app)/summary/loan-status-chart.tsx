"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface LoanStatusData {
  status: string;
  count: number;
  percentage: number;
}

interface LoanStatusChartProps {
  data: LoanStatusData[];
}

// Tonos de marca qipi (familia teal/cyan de las variables --chart-1..5).
const COLORS: Record<string, string> = {
  APPROVED: "hsl(var(--chart-2))",
  PENDING: "hsl(var(--chart-4))",
  REJECTED: "hsl(var(--muted-foreground))",
  PAID: "hsl(var(--chart-1))",
};

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Aprobados",
  PENDING: "Pendientes",
  REJECTED: "Rechazados",
  PAID: "Pagados",
};

export function LoanStatusChart({ data }: LoanStatusChartProps) {
  const chartData = (data ?? []).map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    percentage: item.percentage,
    status: item.status,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
        No hay préstamos registrados
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.status] || "#6b7280"} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as { name: string; value: number; percentage: number };
              return (
                <div className="bg-card border rounded-md p-2 shadow-md text-xs">
                  <div className="font-medium">{d.name}</div>
                  <div className="text-primary">{d.value} préstamos</div>
                  <div className="text-muted-foreground">{d.percentage}% del total</div>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="circle"
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
