"use client";

export function Tables() {
  const columns = [
    "Foco",
    "Comuna",
    "Estado",
    "Analista",
    "Fiscal",
    "Orden de Investigar",
    "Instrucción Particular",
    "Diligencias",
    "Reunión Policial",
    "Informes",
    "Procedimientos",
    "Progreso",
    "Acciones",
  ];

  return (
    <div className="space-y-12">

      {/* ============================== */}
      {/*   TABLA: FOCOS ACTIVOS         */}
      {/* ============================== */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-center text-foreground">
          Focos Activos
        </h2>

        <div className="rounded-xl border bg-card p-4">
          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-foreground border-b">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 text-left font-medium whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-4 text-muted-foreground"
                  >
                    No hay focos activos.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/*   TABLA: FOCOS TERMINADOS      */}
      {/* ============================== */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-center text-foreground">
          Focos Terminados
        </h2>

        <div className="rounded-xl border bg-card p-4">
          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-foreground border-b">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 text-left font-medium whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-4 text-muted-foreground"
                  >
                    No hay focos terminados.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
