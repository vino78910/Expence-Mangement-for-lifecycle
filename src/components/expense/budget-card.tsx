"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { PiggyBank, Loader2, Pencil, Check, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { formatINR, formatINRCompact } from "@/lib/format";

interface BudgetCardProps {
  monthSpent: number;
  budget: number;
  budgetLoading: boolean;
}

export function BudgetCard({ monthSpent, budget, budgetLoading }: BudgetCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const monthKey = format(new Date(), "yyyy-MM");
  const monthLabel = format(new Date(), "MMMM yyyy");

  const [editing, setEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  function startEditing() {
    setBudgetInput(budget > 0 ? String(budget) : "");
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  const saveBudget = useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: monthKey, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save budget.");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget", monthKey] });
      setEditing(false);
      toast({ title: "Budget saved", description: `Your ${monthLabel} budget is set.` });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not save budget",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pct = budget > 0 ? Math.min((monthSpent / budget) * 100, 100) : 0;
  const left = budget > 0 ? budget - monthSpent : null;
  const isWarning = budget > 0 && pct >= 80 && pct < 100;
  const isOver = budget > 0 && pct >= 100;

  const barColorClass = isOver
    ? "[&>div]:bg-rose-500"
    : isWarning
      ? "[&>div]:bg-amber-500"
      : "[&>div]:bg-emerald-500";

  function handleSave() {
    const num = Number(budgetInput);
    if (!budgetInput || !Number.isFinite(num) || num < 0) {
      toast({
        title: "Please enter a valid budget",
        description: "The budget must be a number of 0 or more.",
        variant: "destructive",
      });
      return;
    }
    saveBudget.mutate(num);
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PiggyBank className="h-4 w-4" aria-hidden="true" />
              </span>
              Monthly Budget
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {monthLabel} - get alerted when you cross 80%
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0"
            onClick={() => (editing ? cancelEditing() : startEditing())}
          >
            {editing ? (
              "Cancel"
            ) : (
              <>
                <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {budget > 0 ? "Change" : "Set"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgetLoading ? (
          <div className="space-y-3">
            <div className="h-8 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : editing ? (
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="e.g. 15000"
              className="h-11"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              aria-label="Monthly budget amount in rupees"
            />
            <Button
              className="h-11 shrink-0"
              onClick={handleSave}
              disabled={saveBudget.isPending}
            >
              {saveBudget.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="ml-1.5 hidden sm:inline">Save</span>
            </Button>
          </div>
        ) : budget <= 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No budget set yet. Tap <span className="font-medium text-foreground">Set</span> above
              to add your monthly limit (e.g. 15000).
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
              <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                {formatINR(monthSpent)}
                <span className="ml-1.5 text-sm font-medium text-muted-foreground sm:text-base">
                  of {formatINR(budget)}
                </span>
              </p>
              <p
                className={`text-sm font-semibold ${
                  isOver
                    ? "text-rose-600 dark:text-rose-400"
                    : isWarning
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {Math.floor(pct)}% used
              </p>
            </div>
            <Progress
              value={pct}
              className={`h-3 ${barColorClass}`}
              aria-label={`${Math.floor(pct)} percent of monthly budget used`}
            />
            <p className="text-sm text-muted-foreground">
              {left !== null && left >= 0
                ? `${formatINRCompact(left)} left for the rest of ${format(new Date(), "MMMM")}.`
                : `You are ${formatINRCompact(Math.abs(left ?? 0))} over your budget.`}
            </p>
          </div>
        )}

        {budget > 0 && (isWarning || isOver) && (
          <Alert
            variant={isOver ? "destructive" : "default"}
            className={
              isWarning
                ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400"
                : ""
            }
          >
            <TriangleAlert className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>{isOver ? "Budget crossed!" : "Careful - almost there!"}</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              {isOver
                ? `You have spent ${Math.floor(pct)}% of your ${monthLabel} budget. Try to pause non-essential spending.`
                : `You have used ${Math.floor(pct)}% of your ${monthLabel} budget. Slow down a little to stay on track.`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
