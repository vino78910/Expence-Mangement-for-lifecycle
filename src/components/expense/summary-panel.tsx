"use client";

import { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  isWithinInterval,
  parseISO,
  format,
} from "date-fns";
import { CalendarRange, CreditCard, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getGroupColor, PAYMENT_MODES } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import type { CategoryTotal, Expense, WeekBucket } from "@/lib/types";

interface SummaryPanelProps {
  monthExpenses: Expense[];
  allExpenses: Expense[];
  topCategories: CategoryTotal[];
}

export function SummaryPanel({ monthExpenses, topCategories }: SummaryPanelProps) {
  const weeks = useMemo<WeekBucket[]>(() => {
    const result: WeekBucket[] = [];
    const today = new Date();
    for (let i = 3; i >= 0; i--) {
      const ref = subWeeks(today, i);
      const start = startOfWeek(ref, { weekStartsOn: 1 });
      const end = endOfWeek(ref, { weekStartsOn: 1 });
      const inWeek = monthExpenses.filter((e) =>
        isWithinInterval(parseISO(e.date), { start, end })
      );
      const total = inWeek.reduce((s, e) => s + e.amount, 0);
      const catTotals = new Map<string, number>();
      for (const e of inWeek) {
        catTotals.set(e.category, (catTotals.get(e.category) ?? 0) + e.amount);
      }
      const topCategory =
        Array.from(catTotals.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
      result.push({
        label: i === 0 ? "This week" : i === 1 ? "Last week" : format(start, "'Week of' d MMM"),
        range: `${format(start, "d MMM")} - ${format(end > today ? today : end, "d MMM")}`,
        total,
        entries: inWeek.length,
        topCategory,
      });
    }
    return result;
  }, [monthExpenses]);

  const paymentBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of monthExpenses) {
      totals.set(e.paymentMode, (totals.get(e.paymentMode) ?? 0) + e.amount);
    }
    return PAYMENT_MODES.map((mode) => ({
      mode,
      amount: totals.get(mode) ?? 0,
    })).filter((p) => p.amount > 0);
  }, [monthExpenses]);

  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const weekThis = weeks[weeks.length - 1];
  const weekLast = weeks[weeks.length - 2];
  const weekChange =
    weekLast && weekLast.total > 0
      ? ((weekThis.total - weekLast.total) / weekLast.total) * 100
      : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CalendarRange className="h-4 w-4 text-primary" aria-hidden="true" />
              Week on week
            </CardTitle>
            <CardDescription className="text-xs">
              Compare this week with last week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">This week so far</p>
                <p className="text-2xl font-bold tracking-tight">{formatINR(weekThis?.total ?? 0)}</p>
              </div>
              {weekChange !== null && (
                <p
                  className={`text-sm font-semibold ${
                    weekChange > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {weekChange > 0 ? "+" : ""}
                  {Math.round(weekChange)}% vs last week
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Last week total: {formatINR(weekLast?.total ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
              Payment modes
            </CardTitle>
            <CardDescription className="text-xs">How you paid this month</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet this month.</p>
            ) : (
              <div className="space-y-2.5">
                {paymentBreakdown.map((p) => (
                  <div key={p.mode} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{p.mode}</span>
                      <span className="text-muted-foreground">
                        {formatINR(p.amount)} ·{" "}
                        {monthTotal > 0 ? Math.round((p.amount / monthTotal) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${monthTotal > 0 ? Math.max((p.amount / monthTotal) * 100, 2) : 2}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
            Weekly summary
          </CardTitle>
          <CardDescription className="text-xs">Last 4 weeks at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="scrollbar-thin overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead className="hidden sm:table-cell">Dates</TableHead>
                  <TableHead className="text-right">Entries</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden md:table-cell">Top category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeks.map((w) => (
                  <TableRow key={w.range}>
                    <TableCell className="text-xs font-medium sm:text-sm">{w.label}</TableCell>
                    <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground sm:table-cell">
                      {w.range}
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm">{w.entries}</TableCell>
                    <TableCell className="whitespace-nowrap text-right text-xs font-semibold sm:text-sm">
                      {formatINR(w.total)}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                      {w.topCategory}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base">Category summary - this month</CardTitle>
          <CardDescription className="text-xs">
            Every category ranked by spending share
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses yet this month.</p>
          ) : (
            <div className="scrollbar-thin overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCategories.map((c) => (
                    <TableRow key={c.category}>
                      <TableCell className="text-xs font-medium sm:text-sm">{c.category}</TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: getGroupColor(c.group) }}
                            aria-hidden="true"
                          />
                          {c.group}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs sm:text-sm">
                        {Math.round(c.pct)}%
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs font-semibold sm:text-sm">
                        {formatINR(c.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
