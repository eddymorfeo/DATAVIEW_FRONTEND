"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
  Cell,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChartRow = { year: string; total: number };

function toYearValue(row: any): number | null {
  const raw = row?.foco_year ?? row?.focoYear ?? row?.year ?? null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function buildByYear(focos: any[]): ChartRow[] {
  const map = new Map<number, number>();

  for (const f of focos ?? []) {
    const y = toYearValue(f);
    if (!y) continue;
    map.set(y, (map.get(y) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, total]) => ({ year: String(year), total }));
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <div className="text-xs text-muted-foreground">Año</div>
      <div className="text-sm font-semibold">{label}</div>

      <div className="mt-2 flex items-center justify-between gap-6">
        <span className="text-xs text-muted-foreground">Focos</span>
        <span className="text-sm font-semibold tabular-nums">{value}</span>
      </div>
    </div>
  );
}

export function FocosByYearBarChart({ focos }: { focos: any[] }) {
  const data = React.useMemo(() => buildByYear(focos), [focos]);

  const maxValue = React.useMemo(() => Math.max(1, ...data.map((d) => d.total)), [data]);

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Focos por Año</CardTitle>
      </CardHeader>

      <CardContent className="h-[320px]">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos para graficar</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 18, right: 12, left: 0, bottom: 8 }}>
              {/* grid suave */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              {/* ejes limpios */}
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={32}
                fontSize={12}
                domain={[0, maxValue]}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />

              {/* barras estilo “ranking” */}
              <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={44} >
                {/* valor sobre la barra */}
                <LabelList dataKey="total" position="top" className="fill-muted-foreground" fontSize={12} />

                {/* azul con leve variación por altura (se ve más pro) */}
                {data.map((entry, index) => {
                  const ratio = entry.total / maxValue;
                  // sin setear colores “random”; variación leve en opacidad del azul
                  const fill = `rgba(37, 99, 235, ${0.35 + 0.55 * ratio})`; // base blue-600
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
