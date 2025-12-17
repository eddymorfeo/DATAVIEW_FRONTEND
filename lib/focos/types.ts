export type FocosFilters = {
  search: string;
  comuna: string;
  estado: string;
  analista: string;
  fiscal: string;
};

export type Foco = {
  numeroFoco: string;
  anioFoco: string;
  texto: string;
  descripcion: string;
  fecha: string;
  estadoFoco: string;
  comuna: string;
  analista: string;
  asignadoA: string;
  completada: boolean;
  ordenInvestigar: boolean;
  instruccionParticular: boolean;
  diligencias: boolean;
  reunionPolicial: boolean;
  informes: boolean;
  procedimientos: boolean;
};

export type FocoSubprocesoKey =
  | "ordenInvestigar"
  | "instruccionParticular"
  | "diligencias"
  | "reunionPolicial"
  | "informes"
  | "procedimientos";