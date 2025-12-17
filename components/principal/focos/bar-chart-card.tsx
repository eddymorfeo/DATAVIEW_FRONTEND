"use client";

import { useEffect, useState } from "react";

type BarChartCardProps = {
  title: string;
  data: Record<string, number>;
};

const BAR_COLORS = [
  "bg-blue-900",
  "bg-blue-800",
  "bg-blue-700",
  "bg-blue-600",
  "bg-blue-500",
  "bg-blue-400",
  "bg-sky-600",
  "bg-sky-500",
  "bg-sky-400",
  "bg-indigo-600",
  "bg-indigo-500",
  "bg-indigo-400",
];

export function BarChartCard({ title, data }: BarChartCardProps) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-medium mb-2 text-center">{title}</h3>
        <p className="text-muted-foreground text-center">No hay datos</p>
      </div>
    );
  }

  const maxValue = Math.max(...entries.map(([, value]) => value));

  return (
    <div
      key={JSON.stringify(data)}
      className="rounded-xl border bg-card p-6 animate-in fade-in duration-300"
    >
      <h3 className="text-lg font-medium mb-4 text-center">{title}</h3>

      <div className="space-y-3">
        {entries.map(([label, value], index) => {
          const width = (value / maxValue) * 100;

          return (
            <div
              key={label}
              className="flex items-center gap-3 animate-in slide-in-from-left fade-in duration-500"
            >
              <span className="w-40 text-sm text-muted-foreground truncate">
                {label}
              </span>

              <div className="flex-1 bg-muted rounded-md h-6 overflow-hidden">
                <div
                  className={`
                    h-6 flex items-center justify-end pr-2
                    text-xs text-white font-medium
                    transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${BAR_COLORS[index % BAR_COLORS.length]}
                  `}
                  style={{ width: `${width}%` }}
                >
                  {value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
