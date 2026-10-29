"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Lightbulb, Sparkles, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR, formatINRCompact } from "@/lib/format";
import type { CategoryTotal, Expense } from "@/lib/types";

interface TipsPanelProps {
  monthExpenses: Expense[];
  monthTotal: number;
  budget: number;
  monthLabel: string;
  topCategories: CategoryTotal[];
}

export function TipsPanel({
  monthExpenses,
  monthTotal,
  budget,
  monthLabel,
  topCategories,
}: TipsPanelProps) {
  const [tips, setTips] = useState<string[] | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const avgPerDay = useMemo(() => {
    if (monthExpenses.length === 0) return 0;
    const days = new Set(monthExpenses.map((e) => e.date.slice(0, 10)));
    return monthTotal / Math.max(days.size, 1);
  }, [monthExpenses, monthTotal]);

  const biggest = useMemo(() => {
    if (monthExpenses.length === 0) return null;
    return monthExpenses.reduce((max, e) => (e.amount > max.amount ? e : max), monthExpenses[0]);
  }, [monthExpenses]);

  const generateTips = useMutation({
    mutationFn: async () => {
      const summary = {
        month: monthLabel,
        currency: "INR",
        totalSpent: Math.round(monthTotal * 100) / 100,
        monthlyBudget: budget > 0 ? budget : "not set",
        budgetLeft: budget > 0 ? Math.round((budget - monthTotal) * 100) / 100 : undefined,
        numberOfEntries: monthExpenses.length,
        averagePerActiveDay: Math.round(avgPerDay * 100) / 100,
        spendingByGroup: topCategoriesByGroup(),
        topCategories: topCategories.slice(0, 6).map((c) => ({
          category: c.category,
          group: c.group,
          amount: Math.round(c.amount * 100) / 100,
          sharePct: Math.round(c.pct),
        })),
        biggestSingleExpense: biggest
          ? {
              amount: biggest.amount,
              category: biggest.category,
              note: biggest.note ?? "",
              date: format(parseISO(biggest.date), "d MMM yyyy"),
            }
          : null,
      };

      function topCategoriesByGroup() {
        const totals: Record<string, number> = {};
        for (const e of monthExpenses) {
          totals[e.group] = Math.round(((totals[e.group] ?? 0) + e.amount) * 100) / 100;
        }
        return totals;
      }

      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not get tips right now.");
      return data as { tips: string[]; source: string };
    },
    onSuccess: (data) => {
      setTips(data.tips);
      setSource(data.source);
    },
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
          </span>
          AI Savings Tips
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Personal tips based on your {monthLabel} spending
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="text-[11px] text-muted-foreground">Month total</p>
            <p className="text-sm font-bold sm:text-base">{formatINRCompact(monthTotal)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-[11px] text-muted-foreground">Avg / active day</p>
            <p className="text-sm font-bold sm:text-base">{formatINRCompact(avgPerDay)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-[11px] text-muted-foreground">Entries</p>
            <p className="text-sm font-bold sm:text-base">{monthExpenses.length}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-[11px] text-muted-foreground">Budget</p>
            <p className="text-sm font-bold sm:text-base">
              {budget > 0 ? formatINRCompact(budget) : "Not set"}
            </p>
          </div>
        </div>

        <Button
          className="w-full h-11 font-semibold"
          onClick={() => generateTips.mutate()}
          disabled={generateTips.isPending || monthExpenses.length === 0}
        >
          {generateTips.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Thinking about your spending...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              {tips ? "Get new tips" : "Get my savings tips"}
            </>
          )}
        </Button>

        {monthExpenses.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Add a few expenses first, then the AI can study your pattern and help you save.
          </p>
        )}

        {generateTips.isPending && (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {generateTips.isError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Could not get tips right now. Please try again in a moment.
          </p>
        )}

        {tips && !generateTips.isPending && (
          <ol className="space-y-2.5">
            {tips.map((tip, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-lg border bg-card p-3 text-sm leading-relaxed"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ol>
        )}

        {tips && source === "fallback" && (
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            These are general tips (AI service was unavailable). Try again later for
            personalized ones.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
