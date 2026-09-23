import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarDays,
  Dumbbell,
  Flag,
  Layers,
  Shield,
  Star,
  Table2,
  Trophy,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import type { TableIconName } from "@/types/workspace";

export const TABLE_ICONS: Record<TableIconName, LucideIcon> = {
  users: Users,
  "user-plus": UserPlus,
  shield: Shield,
  trophy: Trophy,
  dumbbell: Dumbbell,
  alert: AlertTriangle,
  calendar: CalendarDays,
  wallet: Wallet,
  table: Table2,
  star: Star,
  flag: Flag,
  layers: Layers,
};

export const TABLE_ICON_OPTIONS: { name: TableIconName; label: string }[] = [
  { name: "users", label: "Pessoas" },
  { name: "user-plus", label: "Recrutamento" },
  { name: "shield", label: "Staff" },
  { name: "trophy", label: "Torneio" },
  { name: "dumbbell", label: "Treino" },
  { name: "alert", label: "Alerta" },
  { name: "calendar", label: "Evento" },
  { name: "wallet", label: "Financeiro" },
  { name: "table", label: "Tabela" },
  { name: "star", label: "Destaque" },
  { name: "flag", label: "Meta" },
  { name: "layers", label: "Camadas" },
];
