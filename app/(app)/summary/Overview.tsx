"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface InterestData {
  month: string;
  year: number;
  total: number;
}

interface OverviewProps {
  data: InterestData[];
}

const MONTH_INDEX: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function Overview({ data }: OverviewProps) {
  const chartData = [...(data ?? [])]
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const am = MONTH_INDEX[a.month.toLowerCase()] ?? 0;
      const bm = MONTH_INDEX[b.month.toLowerCase()] ?? 0;
      return am - bm;
    })
    .map((item) => ({
      name: item.month.substring(0, 3),
      total: item.total,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
        Aún no hay intereses registrados
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer height={220}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" vertical={false} />
          <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `S/${Math.round(v / 1000)}k`}
            width={40}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-card border rounded-md p-2 shadow-md text-xs">
                  <div className="font-medium capitalize">{label}</div>
                  <div className="text-primary">{formatCurrency(payload[0].value as number)}</div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#interestGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
