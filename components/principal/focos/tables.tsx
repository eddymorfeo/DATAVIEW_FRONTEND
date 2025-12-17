"use client";

import { Foco, FocosFilters, FocoSubprocesoKey } from "@/lib/focos/types";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { AddFocosForm } from "@/components/principal/focos/add-focos-form";
import Swal from "sweetalert2";

type Props = {
  filters: FocosFilters;
};

const SUBPROCESOS: FocoSubprocesoKey[] = [
  "ordenInvestigar",
  "instruccionParticular",
  "diligencias",
  "reunionPolicial",
  "informes",
  "procedimientos",
];

export function Tables({ filters }: Props) {
  const [focos, setFocos] = useState<Foco[]>([]);
  const [editingFoco, setEditingFoco] = useState<Foco | null>(null);

  /* ================================
     LOAD
  ================================= */
  useEffect(() => {
    const data: Foco[] = JSON.parse(localStorage.getItem("focos") || "[]");
    setFocos(data);
  }, []);

  /* ================================
     FILTROS
  ================================= */
  const focosFiltrados = useMemo(() => {
    return focos.filter((foco) => {
      if (foco.completada) return false;

      if (
        filters.search &&
        !`${foco.numeroFoco}-${foco.anioFoco} ${foco.texto}`
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      )
        return false;

      if (filters.comuna !== "todos" && foco.comuna !== filters.comuna)
        return false;

      if (filters.estado !== "todos" && foco.estadoFoco !== filters.estado)
        return false;

      if (filters.analista !== "todos" && foco.analista !== filters.analista)
        return false;

      if (filters.fiscal !== "todos" && foco.asignadoA !== filters.fiscal)
        return false;

      return true;
    });
  }, [focos, filters]);

  /* ================================
     PROGRESO
  ================================= */
  function calcularProgreso(foco: Foco): number {
    const completos = SUBPROCESOS.filter((k) => foco[k]).length;
    return Math.round((completos / SUBPROCESOS.length) * 100);
  }

  /* ================================
     TOGGLE SUBPROCESO
  ================================= */
  function toggleSubproceso(index: number, key: FocoSubprocesoKey) {
    setFocos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: !updated[index][key] };
      localStorage.setItem("focos", JSON.stringify(updated));
      return updated;
    });
  }

  /* ================================
     DELETE (SweetAlert)
  ================================= */
  function handleDelete(index: number) {
    Swal.fire({
      title: "¿Eliminar foco?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    }).then((result) => {
      if (result.isConfirmed) {
        setFocos((prev) => {
          const updated = prev.filter((_, i) => i !== index);
          localStorage.setItem("focos", JSON.stringify(updated));
          return updated;
        });
      }
    });
  }

  /* ================================
     TERMINAR FOCO
  ================================= */
  function handleTerminar(index: number) {
    Swal.fire({
      title: "¿Terminar foco?",
      text: "El foco se moverá a Terminados",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, terminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        setFocos((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], completada: true };
          localStorage.setItem("focos", JSON.stringify(updated));
          return updated;
        });
      }
    });
  }

  /* ================================
     RESUMEN
  ================================= */
  const total = focosFiltrados.length;
  const completos = focosFiltrados.filter(
    (f) => calcularProgreso(f) === 100
  ).length;
  const porcentaje = total ? Math.round((completos / total) * 100) : 0;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 text-center">Focos Activos</h2>

      <div className="rounded-xl border bg-card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {[
                "Foco",
                "Comuna",
                "Estado",
                "Analista",
                "Fiscal",
                "Orden",
                "Instrucción",
                "Diligencias",
                "Reunión",
                "Informes",
                "Procedimientos",
                "Progreso",
                "Acciones",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {focosFiltrados.map((foco) => {
              const index = focos.indexOf(foco);
              const progreso = calcularProgreso(foco);
              const radius = 16;
              const circumference = 2 * Math.PI * radius;
              const offset =
                circumference - (progreso / 100) * circumference;

              return (
                <tr key={`${foco.numeroFoco}-${foco.anioFoco}`} className="border-b">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      [{foco.numeroFoco}-{foco.anioFoco}] {foco.texto}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ingresado: {foco.fecha}
                    </div>
                  </td>

                  <td className="px-4 py-3">{foco.comuna}</td>
                  <td className="px-4 py-3 lowercase">{foco.estadoFoco}</td>
                  <td className="px-4 py-3">{foco.analista}</td>
                  <td className="px-4 py-3">{foco.asignadoA}</td>

                  {SUBPROCESOS.map((k) => (
                    <td key={k} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={foco[k]}
                        onChange={() => toggleSubproceso(index, k)}
                      />
                    </td>
                  ))}

                  {/* PROGRESO SVG */}
                  <td className="px-4 py-3">
                    <svg width="44" height="44">
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        stroke="#2563eb"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 22 22)"
                        className="transition-all duration-500"
                      />
                      <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {progreso}%
                      </text>
                    </svg>
                  </td>

                  {/* ACCIONES */}
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-center">
                      {progreso === 100 && (
                        <button
                          onClick={() => handleTerminar(index)}
                          title="Terminar foco"
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => setEditingFoco(foco)}
                        title="Editar foco"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(index)}
                        title="Eliminar foco"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-3 text-sm text-muted-foreground">
          {completos} de {total} focos activos con 100% de progreso ({porcentaje}
          %)
        </div>
      </div>
    </section>
  );
}
