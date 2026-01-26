"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Item = { label: string; value: number };

function topN(items: Item[], n = 5) {
  return [...items].sort((a, b) => b.value - a.value).slice(0, n);
}

function buildRanking(list: any[], getter: (row: any) => string | null | undefined): Item[] {
  const map = new Map<string, number>();

  for (const row of list) {
    const label = (getter(row) ?? "Sin dato").toString().trim() || "Sin dato";
    map.set(label, (map.get(label) ?? 0) + 1);
  }

  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
}

function Ranking({ title, items }: { title: string; items: Item[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos</p>
        ) : (
          items.map((i) => (
            <div key={i.label} className="grid grid-cols-[1fr_2fr_36px] items-center gap-3">
              <div className="text-sm text-muted-foreground truncate">{i.label}</div>

              <div className="h-6 rounded-md bg-muted overflow-hidden flex items-center">
                <div className="h-full bg-blue-600" style={{ width: `${(i.value / max) * 100}%` }} />
              </div>

              <div className="text-right text-sm font-semibold tabular-nums">{i.value}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function SummaryRankingCards({ focos }: { focos: any[] }) {
  const byStatus = React.useMemo(
    () => topN(buildRanking(focos, (f) => f.status_name ?? f.statusName ?? "Sin estado"), 5),
    [focos]
  );

  const byComuna = React.useMemo(
    () => topN(buildRanking(focos, (f) => f.comuna_name ?? f.comunaName ?? "Sin comuna"), 5),
    [focos]
  );

  const byAnalista = React.useMemo(
    () => topN(buildRanking(focos, (f) => f.analyst_name ?? f.analystName ?? "Sin analista"), 5),
    [focos]
  );

  const byFiscal = React.useMemo(
    () => topN(buildRanking(focos, (f) => f.assigned_to_name ?? f.assignedToName ?? "Sin fiscal"), 5),
    [focos]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3 mb-8">
      <Ranking title="Focos por Estado" items={byStatus} />
      <Ranking title="Focos por Comuna" items={byComuna} />
      <Ranking title="Focos por Analista" items={byAnalista} />
      <Ranking title="Focos por Fiscal" items={byFiscal} />
    </div>
  );
}
