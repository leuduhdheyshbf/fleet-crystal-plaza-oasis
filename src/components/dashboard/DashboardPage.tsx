import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity as ActivityIcon,
  ArrowRight,
  Plus,
  Table2,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/store";
import { formatRelative } from "@/lib/data/format";
import { MEMBERS_TABLE_ID } from "@/types/workspace";
import { TABLE_ICONS } from "@/lib/table-icons";

export function DashboardPage() {
  const tables = useWorkspace((s) => s.tables);
  const rows = useWorkspace((s) => s.rows);
  const activity = useWorkspace((s) => s.activity);
  const members = rows[MEMBERS_TABLE_ID] ?? [];

  const weekSeries = useMemo(() => {
    const dayKey = (ts: number) => {
      const d = new Date(ts);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return {
        key: dayKey(d.getTime()),
        label: d.toLocaleDateString("pt-BR", { weekday: "short" }),
        count: 0,
      };
    });
    for (const row of members) {
      const key = dayKey(row.createdAt);
      const hit = days.find((d) => d.key === key);
      if (hit) hit.count += 1;
    }
    return days;
  }, [members]);

  const ageSeries = useMemo(() => {
    const buckets = [
      { label: "<18", count: 0 },
      { label: "18–21", count: 0 },
      { label: "22–25", count: 0 },
      { label: "26+", count: 0 },
    ];
    for (const row of members) {
      const age = Number(row.cells.idade);
      if (!Number.isFinite(age)) continue;
      if (age < 18) buckets[0].count += 1;
      else if (age <= 21) buckets[1].count += 1;
      else if (age <= 25) buckets[2].count += 1;
      else buckets[3].count += 1;
    }
    return buckets;
  }, [members]);

  const recentMembers = [...members]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const totalRows = Object.values(rows).reduce((n, list) => n + list.length, 0);

  return (
    <div className="stagger-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">Visão geral</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Operação da equipe em um único workspace.
          </p>
        </div>
        <Button asChild>
          <Link to="/members">
            <Plus /> Novo membro
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total de membros"
          value={members.length}
          hint="cadastro principal"
          icon={Users}
        />
        <StatCard
          label="Cadastrados recentemente"
          value={members.filter((m) => Date.now() - m.createdAt < 7 * 86400000).length}
          hint="últimos 7 dias"
          icon={ActivityIcon}
        />
        <StatCard
          label="Total de tabelas"
          value={tables.length}
          hint={`${totalRows} registros no workspace`}
          icon={Table2}
        />
        <StatCard
          label="Atividade recente"
          value={activity.length}
          hint="eventos registrados"
          icon={ActivityIcon}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="rounded-xl bg-card p-5 shadow-card xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Novos membros</p>
              <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-primary)"
                  fill="url(#fillMembers)"
                  strokeWidth={2}
                  name="Membros"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-card p-5 shadow-card xl:col-span-2">
          <p className="text-sm font-medium">Distribuição de idade</p>
          <p className="text-xs text-muted-foreground">Membros ativos</p>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} name="Membros" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Membros recentes</h3>
            <Link to="/members" className="inline-flex items-center gap-1 text-xs text-primary">
              Ver todos <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <ul className="space-y-2">
            {recentMembers.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{String(row.cells.nome ?? "—")}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {String(row.cells.nick ?? "")}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(row.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Atividade</h3>
            <Badge tone="primary">{activity.length}</Badge>
          </div>
          <ul className="space-y-3">
            {activity.slice(0, 6).map((item) => (
              <li key={item.id} className="flex gap-3">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(item.at)}</p>
                </div>
              </li>
            ))}
            {activity.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma atividade ainda.</p>
            )}
          </ul>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Tabelas</h3>
          <Link to="/tables" className="inline-flex items-center gap-1 text-xs text-primary">
            Gerenciar <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tables.slice(0, 8).map((t) => {
            const Ico = TABLE_ICONS[t.icon];
            const count = rows[t.id]?.length ?? 0;
            return (
              <Link
                key={t.id}
                to={t.id === MEMBERS_TABLE_ID ? "/members" : "/tables/$tableId"}
                params={t.id === MEMBERS_TABLE_ID ? undefined : { tableId: t.id }}
                className="rounded-xl bg-card p-4 shadow-card transition-[box-shadow] duration-150 hover:shadow-card-hover"
              >
                <Ico className="size-4 text-primary" />
                <p className="mt-3 text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {count} registro{count === 1 ? "" : "s"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
