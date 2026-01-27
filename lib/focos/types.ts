export type Foco = {
  id: string;
  foco_number: number;
  foco_year: number;
  title: string;
  description: string | null;
  comuna_id: string;
  status_id: string;
  analyst_id: string | null;
  assigned_to_id: string | null;
  foco_date: string;
  is_completed: boolean;
  orden_investigar: boolean;
  instruccion_particular: boolean;
  diligencias: boolean;
  reunion_policial: boolean;
  informes: boolean;
  procedimientos: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  comuna_name?: string | null;
  status_name?: string | null;
  analyst_name?: string | null;
  assigned_to_name?: string | null;
};

export type Homicide = {
  id: string;
  ruc: string;
  date: string; // ISO
  full_name: string | null;
  rut: string | null;
  address: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  weapon_id: string;
  comuna_id: string;
  case_status_id: string;
  weapon_name?: string | null;
  comuna_name?: string | null;
  case_status_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PagedResult<T> = {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type WeaponItem = { id: string; name: string; is_active: boolean };
export type CaseStatusItem = { id: string; name: string; is_active: boolean };
export type ComunaItem = { id: string; name: string; is_active: boolean };
