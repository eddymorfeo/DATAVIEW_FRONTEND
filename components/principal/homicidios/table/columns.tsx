"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Homicide } from "@/lib/focos/types";

export function homicideColumns(args: { onDelete: (id: string) => void }): ColumnDef<Homicide>[] {
    return [
        { accessorKey: "ruc", header: "RUC" },
        { accessorKey: "full_name", header: "VÍCTIMA", cell: ({ row }) => row.original.full_name ?? "-" },
        { accessorKey: "rut", header: "RUT VÍCTIMA", cell: ({ row }) => row.original.rut ?? "-" },
        {
            accessorKey: "date",
            header: "FECHA",
            cell: ({ row }) => {
                const iso = row.original.date;
                const d = iso ? new Date(iso) : null;
                return d ? d.toISOString().slice(0, 10) : "-";
            },
        },
        { accessorKey: "weapon_name", header: "ARMA", cell: ({ row }) => row.original.weapon_name ?? "-" },
        { accessorKey: "comuna_name", header: "COMUNA", cell: ({ row }) => row.original.comuna_name ?? "-" },
        { accessorKey: "case_status_name", header: "ESTADO", cell: ({ row }) => row.original.case_status_name ?? "-" },
        {
            id: "actions",
            header: "ACCIONES",
            cell: ({ row }) => {
                const id = row.original.id;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost"
                            size="icon"
                            title="Editar"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30" disabled>
                            <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            title="Eliminar"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => args.onDelete(id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];
}
