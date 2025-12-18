"use client";

import { Foco, FocosFilters, FocoSubprocesoKey } from "@/lib/focos/types";
import { useMemo, useState } from "react";
import { Pencil, Trash2, CheckCircle, Save, X } from "lucide-react";
import Swal from "sweetalert2";
import { comunas } from "@/lib/focos/comunas";
import { estadosFocos } from "@/lib/focos/estados-focos";
import { analistas } from "@/lib/focos/analistas";
import { fiscales } from "@/lib/focos/fiscales";

type Props = {
  filters: FocosFilters;
  focos: Foco[];
  setFocos: React.Dispatch<React.SetStateAction<Foco[]>>;
};

const SUBPROCESOS: FocoSubprocesoKey[] = [
  "ordenInvestigar",
  "instruccionParticular",
  "diligencias",
  "reunionPolicial",
  "informes",
  "procedimientos",
];

export function Tables({ filters, focos, setFocos }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Foco | null>(null);

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
     DELETE
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
     EDIT INLINE
  ================================= */
  function startEdit(index: number, foco: Foco) {
    setEditingIndex(index);
    setEditDraft({ ...foco });
  }

  function cancelEdit() {
    setEditingIndex(null);
    setEditDraft(null);
  }

  function saveEdit() {
    if (editingIndex === null || !editDraft) return;

    setFocos((prev) => {
      const updated = [...prev];
      updated[editingIndex] = editDraft;
      localStorage.setItem("focos", JSON.stringify(updated));
      return updated;
    });

    setEditingIndex(null);
    setEditDraft(null);
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
                <th key={h} className="px-4 py-3 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {focosFiltrados.map((foco, index) => {
              const progreso = calcularProgreso(foco);
              const isEditing = editingIndex === index;

              return (
                <tr
                  key={`${foco.numeroFoco}-${foco.anioFoco}`}
                  className="border-b"
                >
                  {/* FOCO */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={editDraft?.numeroFoco || ""}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft!,
                              numeroFoco: e.target.value,
                            })
                          }
                        />
                        <textarea
                          rows={2}
                          className="border rounded px-2 py-1 w-full"
                          value={editDraft?.texto || ""}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft!,
                              texto: e.target.value,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <div className="font-medium">
                          [{foco.numeroFoco}-{foco.anioFoco}] {foco.texto}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ingresado: {foco.fecha}
                        </div>
                      </>
                    )}
                  </td>

                  {/* COMUNA */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={editDraft?.comuna}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft!,
                            comuna: e.target.value,
                          })
                        }
                      >
                        {comunas.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      foco.comuna
                    )}
                  </td>

                  {/* ESTADO */}
                  <td className="px-4 py-3 lowercase">
                    {isEditing ? (
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={editDraft?.estadoFoco}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft!,
                            estadoFoco: e.target.value,
                          })
                        }
                      >
                        {estadosFocos.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    ) : (
                      foco.estadoFoco
                    )}
                  </td>

                  {/* ANALISTA */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={editDraft?.analista}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft!,
                            analista: e.target.value,
                          })
                        }
                      >
                        {analistas.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    ) : (
                      foco.analista
                    )}
                  </td>

                  {/* FISCAL */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={editDraft?.asignadoA}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft!,
                            asignadoA: e.target.value,
                          })
                        }
                      >
                        {fiscales.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    ) : (
                      foco.asignadoA
                    )}
                  </td>

                  {/* SUBPROCESOS */}
                  {SUBPROCESOS.map((k) => (
                    <td key={k} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isEditing ? editDraft![k] : foco[k]}
                        onChange={() =>
                          isEditing
                            ? setEditDraft({
                                ...editDraft!,
                                [k]: !editDraft![k],
                              })
                            : toggleSubproceso(index, k)
                        }
                      />
                    </td>
                  ))}

                  {/* PROGRESO */}
                  <td className="px-4 py-3 text-center">{progreso}%</td>

                  {/* ACCIONES */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="text-green-600"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          {progreso === 100 && (
                            <button
                              onClick={() => handleTerminar(index)}
                              className="text-green-600"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(index, foco)}
                            className="text-muted-foreground"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-3 text-sm text-muted-foreground text-center">
          {completos} de {total} focos activos con 100% de progreso ({porcentaje}%)
        </div>
      </div>
    </section>
  );
}
