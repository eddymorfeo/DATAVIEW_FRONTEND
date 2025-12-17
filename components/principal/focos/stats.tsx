"use client";

export function Stats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {[ 
        "Focos por Estado",
        "Focos por Comuna",
        "Focos por Analista",
        "Focos por Fiscal",
      ].map((title) => (
        <div
          key={title}
          className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center text-center"
        >
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-muted-foreground">No hay datos</p>
        </div>
      ))}
    </div>
  );
}
