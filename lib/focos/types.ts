/**
 * Shape real del backend (GET /focos)
 * + agregamos *_name para mostrar nombres en la tabla
 */
export type Foco = {
  // NO se muestra, pero existe
  id: string;

  foco_number: number;
  foco_year: number;

  title: string;
  description: string | null;

  comuna_id: string;
  status_id: string;

  analyst_id: string | null;
  assigned_to_id: string | null;

  foco_date: string; // NO mostrar
  is_completed: boolean; // NO mostrar

  orden_investigar: boolean;
  instruccion_particular: boolean;
  diligencias: boolean;
  reunion_policial: boolean;
  informes: boolean;
  procedimientos: boolean;

  created_by: string | null; // NO mostrar
  created_at: string; // NO mostrar
  updated_at: string; // NO mostrar

  // ✅ Campos calculados por JOIN (para mostrar nombres)
  comuna_name?: string | null;
  status_name?: string | null;
  analyst_name?: string | null;
  assigned_to_name?: string | null;
};
