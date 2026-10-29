"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { IndianRupee, Moon, Sun, RefreshCcw, TriangleAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryCards } from "@/components/expense/summary-cards";
import { AddExpenseForm } from "@/components/expense/add-expense-form";
import { BudgetCard } from "@/components/expense/budget-card";
import { ChartsPanel } from "@/components/expense/charts-panel";
import { ExpenseTable } from "@/components/expense/expense-table";
import { SummaryPanel } from "@/components/expense/summary-panel";
import { TipsPanel } from "@/components/expense/tips-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { BudgetInfo, CategoryTotal, Expense } from "@/lib/types";

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();

  const expensesQuery = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load expenses.");
      return data;
    },
  });

  const monthKey = format(new Date(), "yyyy-MM");
  const monthLabel = format(new Date(), "MMMM yyyy");

  const budgetQuery = useQuery<BudgetInfo>({
    queryKey: ["budget", monthKey],
    queryFn: async () => {
      const res = await fetch(`/api/budget?month=${monthKey}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load budget.");
      return data;
    },
  });

  const expenses = useMemo(() => expensesQuery.data ?? [], [expensesQuery.data]);
  const budget = budgetQuery.data?.amount ?? 0;

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.slice(0, 7) === monthKey),
    [expenses, monthKey]
  );

  const todayTotal = useMemo(
    () =>
      expenses
        .filter((e) => isSameDay(parseISO(e.date), todayStart))
        .reduce((s, e) => s + e.amount, 0),
    [expenses, todayStart]
  );

  const weekTotal = useMemo(
    () =>
      expenses
        .filter((e) =>
          isWithinInterval(parseISO(e.date), { start: weekStart, end: now })
        )
        .reduce((s, e) => s + e.amount, 0),
    [expenses, weekStart, now]
  );

  const monthTotal = useMemo(
    () => monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses]
  );

  const topCategories = useMemo<CategoryTotal[]>(() => {
    const totals = new Map<string, { amount: number; group: string }>();
    for (const e of monthExpenses) {
      const prev = totals.get(e.category);
      totals.set(e.category, {
        amount: (prev?.amount ?? 0) + e.amount,
        group: e.group,
      });
    }
    return Array.from(totals.entries())
      .map(([category, v]) => ({
        category,
        group: v.group,
        amount: v.amount,
        pct: monthTotal > 0 ? (v.amount / monthTotal) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthExpenses, monthTotal]);

  const budgetLeft = budget > 0 ? budget - monthTotal : null;
  const budgetPct = budget > 0 ? (monthTotal / budget) * 100 : 0;
  const showWarning = budget > 0 && budgetPct >= 80;
  const isOver = budget > 0 && budgetPct >= 100;

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50/70 via-background to-background dark:from-emerald-950/20">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:h-10 sm:w-10">
              <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-base font-bold leading-tight tracking-tight sm:text-lg">
                Daily Expense Tracker
              </h1>
              <p className="text-[11px] text-muted-foreground sm:text-xs">
                Log every rupee, build better habits
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
            <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
        {showWarning && (
          <Alert
            variant={isOver ? "destructive" : "default"}
            className={
              isOver
                ? ""
                : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400"
            }
          >
            <TriangleAlert className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>
              {isOver ? "You crossed your monthly budget" : "Budget alert - 80% used"}
            </AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              {isOver
                ? `You have spent ${format(Math.min(budgetPct, 999), ".0f")}% of your ${monthLabel} budget. Check the Expenses tab to see where it went.`
                : `You have used ${Math.round(budgetPct)}% of your ${monthLabel} budget. Plan the rest of the month carefully.`}
            </AlertDescription>
          </Alert>
        )}

        {expensesQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl sm:h-28" />
            ))}
          </div>
        ) : expensesQuery.isError ? (
          <Card className="border-destructive/40">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="font-medium">Could not load your expenses</p>
              <p className="text-sm text-muted-foreground">
                Something went wrong. Please try again.
              </p>
              <Button variant="outline" size="sm" onClick={() => expensesQuery.refetch()}>
                <RefreshCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <SummaryCards
            today={todayTotal}
            week={weekTotal}
            month={monthTotal}
            budgetLeft={budgetLeft}
            monthLabel={monthLabel}
          />
        )}

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <AddExpenseForm />
          </div>
          <div className="lg:col-span-3">
            <BudgetCard
              monthSpent={monthTotal}
              budget={budget}
              budgetLoading={budgetQuery.isLoading}
            />
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg p-1 sm:grid-cols-4">
            <TabsTrigger value="overview" className="py-2 text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="expenses" className="py-2 text-xs sm:text-sm">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="summary" className="py-2 text-xs sm:text-sm">
              Summary
            </TabsTrigger>
            <TabsTrigger value="tips" className="py-2 text-xs sm:text-sm">
              AI Tips
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4 sm:mt-6">
            <ChartsPanel monthExpenses={monthExpenses} topCategories={topCategories} />
          </TabsContent>
          <TabsContent value="expenses" className="mt-4 sm:mt-6">
            <ExpenseTable expenses={expenses} />
          </TabsContent>
          <TabsContent value="summary" className="mt-4 sm:mt-6">
            <SummaryPanel
              monthExpenses={monthExpenses}
              allExpenses={expenses}
              topCategories={topCategories}
            />
          </TabsContent>
          <TabsContent value="tips" className="mt-4 sm:mt-6">
            <TipsPanel
              monthExpenses={monthExpenses}
              monthTotal={monthTotal}
              budget={budget}
              monthLabel={monthLabel}
              topCategories={topCategories}
            />
          </TabsContent>
        </Tabs>
      </main>

      <footer
        className="mt-auto border-t bg-background/80 py-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <p className="text-center text-xs text-muted-foreground">
          Daily Expense Tracker - your data stays saved on this device
        </p>
      </footer>
    </div>
  );
}
