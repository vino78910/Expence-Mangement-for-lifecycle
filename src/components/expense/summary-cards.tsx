"use client";

import { CalendarDays, CalendarRange, Wallet, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatINRCompact } from "@/lib/format";

interface SummaryCardsProps {
  today: number;
  week: number;
  month: number;
  budgetLeft: number | null;
  monthLabel: string;
}

export function SummaryCards({
  today,
  week,
  month,
  budgetLeft,
  monthLabel,
}: SummaryCardsProps) {
  const cards = [
    {
      label: "Today",
      value: today,
      icon: CalendarDays,
      sub: "spent so far today",
      iconClass:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    },
    {
      label: "This Week",
      value: week,
      icon: CalendarRange,
      sub: "Mon to today",
      iconClass:
        "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    },
    {
      label: monthLabel,
      value: month,
      icon: Wallet,
      sub: "total this month",
      iconClass:
        "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
    },
    {
      label: "Budget Left",
      value: budgetLeft ?? 0,
      icon: PiggyBank,
      sub: budgetLeft === null ? "set your budget below" : "for the rest of the month",
      iconClass:
        "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {card.label}
                </p>
                <p className="mt-1 truncate text-lg font-bold tracking-tight sm:text-2xl">
                  {card.sub === "set your budget below" && budgetLeft === null
                    ? "--"
                    : formatINRCompact(card.value)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                  {card.sub}
                </p>
              </div>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${card.iconClass}`}
              >
                <card.icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
