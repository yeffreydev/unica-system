"use client";

import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DepositsWithdrawalsData {
  month: string;
  year: number;
  deposits: number;
  withdrawals: number;
}

interface Props {
  data: DepositsWithdrawalsData[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DepositsWithdrawalsChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
        Sin datos de ingresos y egresos
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {/* Gradientes en familia Aqui Nace: chart-1 (primary profundo) y
                chart-4 (variante clara). Mantiene contraste sin salir de marca. */}
            <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="witGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" vertical={false} />
          <XAxis dataKey="month" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888"
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
                <div className="bg-card border rounded-md p-2 shadow-md text-xs space-y-1">
                  <div className="font-medium capitalize">{label}</div>
                  {payload.map((p) => (
                    <div key={p.dataKey as string} style={{ color: p.color }}>
                      {p.name}: {formatCurrency(p.value as number)}
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          <Area
            type="monotone"
            dataKey="deposits"
            name="Ingresos"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill="url(#depGrad)"
          />
          <Area
            type="monotone"
            dataKey="withdrawals"
            name="Egresos"
            stroke="hsl(var(--chart-4))"
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="url(#witGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
