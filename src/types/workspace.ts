export type ColumnType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "phone"
  | "email";

export type ViewMode = "grid" | "list" | "kanban";

export type FilterOperator =
  | "eq"
  | "neq"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "empty"
  | "notEmpty";

export interface ColumnDef {
  id: string;
  name: string;
  type: ColumnType;
  required?: boolean;
  options?: string[];
}

export interface TableDef {
  id: string;
  name: string;
  description: string;
  icon: TableIconName;
  columns: ColumnDef[];
  createdAt: number;
  updatedAt: number;
  kanbanColumnId?: string;
}

export type TableIconName =
  | "users"
  | "user-plus"
  | "shield"
  | "trophy"
  | "dumbbell"
  | "alert"
  | "calendar"
  | "wallet"
  | "table"
  | "star"
  | "flag"
  | "layers";

export type CellValue = string | number | boolean | null;

export interface Row {
  id: string;
  tableId: string;
  cells: Record<string, CellValue>;
  createdAt: number;
  updatedAt: number;
}

export type ActivityType =
  | "create"
  | "update"
  | "delete"
  | "import"
  | "export"
  | "table_create"
  | "table_update"
  | "table_delete"
  | "duplicate"
  | "sync";

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  tableId?: string;
  at: number;
}

export interface FilterRule {
  id: string;
  columnId: string;
  operator: FilterOperator;
  value: string;
}

export interface Profile {
  name: string;
  role: string;
}

export interface WorkspaceSnapshot {
  version: 1;
  tables: TableDef[];
  rows: Record<string, Row[]>;
  activity: Activity[];
  profile: Profile;
  views: Record<string, ViewMode>;
  locked: boolean;
}

export const COLUMN_TYPE_LABELS: Record<ColumnType, string> = {
  text: "Texto",
  number: "Número",
  date: "Data",
  boolean: "Booleano",
  select: "Seleção",
  phone: "Telefone",
  email: "E-mail",
};

export const FILTER_OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: "é igual a",
  neq: "é diferente de",
  contains: "contém",
  startsWith: "começa com",
  endsWith: "termina com",
  gt: "maior que",
  gte: "maior ou igual a",
  lt: "menor que",
  lte: "menor ou igual a",
  empty: "está vazio",
  notEmpty: "não está vazio",
};

export const MEMBERS_TABLE_ID = "tbl_members";
