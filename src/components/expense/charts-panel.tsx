"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { subDays, format, isSameDay, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getGroupColor } from "@/lib/constants";
import { formatINR, formatINRCompact } from "@/lib/format";
import type { CategoryTotal, Expense } from "@/lib/types";

interface ChartsPanelProps {
  monthExpenses: Expense[];
  topCategories: CategoryTotal[];
}

export function ChartsPanel({ monthExpenses, topCategories }: ChartsPanelProps) {
  const byGroup = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of monthExpenses) {
      totals.set(e.group, (totals.get(e.group) ?? 0) + e.amount);
    }
    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value, color: getGroupColor(name) }))
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses]);

  const dailyTrend = useMemo(() => {
    const days: { day: string; amount: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      const total = monthExpenses
        .filter((e) => isSameDay(parseISO(e.date), d))
        .reduce((sum, e) => sum + e.amount, 0);
      days.push({ day: format(d, "d MMM"), amount: Math.round(total * 100) / 100 });
    }
    return days;
  }, [monthExpenses]);

  const totalMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);

  if (monthExpenses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="font-medium">Nothing to show yet this month</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first expense and charts will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">Where your money goes</CardTitle>
            <CardDescription className="text-xs">Share by group, this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byGroup}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {byGroup.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatINR(value), "Spent"]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
              {byGroup.map((g) => (
                <div key={g.name} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: g.color }}
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">{g.name}</span>
                  <span className="font-medium">{formatINRCompact(g.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">Daily trend</CardTitle>
            <CardDescription className="text-xs">Last 14 days of spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrend} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
                  <Tooltip
                    formatter={(value: number) => [formatINR(value), "Spent"]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: "currentColor", opacity: 0.06 }}
                  />
                  <Bar dataKey="amount" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base">Top categories this month</CardTitle>
          <CardDescription className="text-xs">
            Your biggest spending categories out of {formatINR(totalMonth)} total
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topCategories.slice(0, 6).map((c) => (
            <div key={c.category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{c.category}</span>
                <span className="text-muted-foreground">
                  {formatINR(c.amount)} · {Math.round(c.pct)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(c.pct, 2)}%`,
                    backgroundColor: getGroupColor(c.group),
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
