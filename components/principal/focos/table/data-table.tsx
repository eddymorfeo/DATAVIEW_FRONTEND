"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ColumnUiMeta = {
  thClass?: string;
  tdClass?: string;
};

type Props<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: any;
};

function getRowStatusId(rowOriginal: any) {
  return rowOriginal?.status_id ?? rowOriginal?.statusId ?? null;
}

function getRowStatusName(rowOriginal: any) {
  return rowOriginal?.status_name ?? rowOriginal?.statusName ?? null;
}

export function DataTable<TData, TValue>({ columns, data, meta }: Props<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    meta,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full space-y-3">
      {/* ✅ contenedor sin scroll horizontal */}
      <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
        <Table className="w-full table-fixed">
          <TableHeader className="bg-muted/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/60">
                {headerGroup.headers.map((header) => {
                  const ui = (header.column.columnDef.meta ?? {}) as ColumnUiMeta;

                  return (
                    <TableHead
                      key={header.id}
                      className={[
                        "whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                        ui.thClass ?? "",
                      ].join(" ")}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                // ✅ siempre leer meta desde table.options.meta (más confiable)
                const tableMeta = table.options.meta as any | undefined;
                const terminadoStatusId = tableMeta?.terminadoStatusId as string | null | undefined;

                const rowOriginal: any = row.original;
                const rowStatusId = getRowStatusId(rowOriginal);
                const rowStatusName = (getRowStatusName(rowOriginal) ?? "").toString().toLowerCase();

                const isTerminado =
                  Boolean(terminadoStatusId && rowStatusId && rowStatusId === terminadoStatusId) ||
                  rowStatusName === "terminado";

                return (
                  <TableRow
                    key={row.id}
                    className={[
                      "border-b transition-colors hover:bg-muted/40",
                      isTerminado ? "bg-emerald-50/70 dark:bg-emerald-950/25" : "",
                    ].join(" ")}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const ui = (cell.column.columnDef.meta ?? {}) as ColumnUiMeta;

                      return (
                        <TableCell
                          key={cell.id}
                          className={[
                            "align-middle",
                            // ✅ importante para truncate dentro de celdas fixed
                            "min-w-0",
                            ui.tdClass ?? "",
                          ].join(" ")}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación simple */}
      <div>


        <div className="flex items-center justify-between">
          <div>
            <div className="text-muted-foreground flex-1 text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Siguiente
            </Button>
          </div>

        </div>
      </div>

    </div>
  );
}
