"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Download, Search, Trash2, Loader2, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getCategoryIcon } from "@/lib/category-icons";
import { GROUP_BADGE_CLASSES } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import type { Expense } from "@/lib/types";

export function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const e of expenses) set.add(e.date.slice(0, 7));
    return Array.from(set).sort().reverse();
  }, [expenses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses.filter((e) => {
      if (monthFilter !== "all" && !e.date.startsWith(monthFilter)) return false;
      if (!q) return true;
      return (
        (e.note ?? "").toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.group.toLowerCase().includes(q) ||
        e.paymentMode.toLowerCase().includes(q)
      );
    });
  }, [expenses, monthFilter, search]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete.");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Expense deleted" });
      setConfirmId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Could not delete expense",
        description: error.message,
        variant: "destructive",
      });
      setConfirmId(null);
    },
  });

  function exportCSV() {
    const header = "Date,Amount,Group,Category,Paid Via,Note";
    const rows = filtered.map((e) => {
      const note = `"${(e.note ?? "").replace(/"/g, '""')}"`;
      return `${e.date.slice(0, 10)},${e.amount},"${e.group}","${e.category}",${e.paymentMode},${note}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      monthFilter === "all" ? "expenses-all.csv" : `expenses-${monthFilter}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "CSV downloaded", description: "Open it in Excel or Google Sheets." });
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Table2 className="h-4 w-4" aria-hidden="true" />
              </span>
              All Expenses
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"} · total {formatINR(total)}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full sm:w-auto"
            onClick={exportCSV}
            disabled={filtered.length === 0}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Export CSV
          </Button>
        </div>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="h-10 w-full sm:w-44" aria-label="Filter by month">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All months</SelectItem>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {format(parseISO(`${m}-15`), "MMMM yyyy")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="text"
              placeholder="Search note or category..."
              className="h-10 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search expenses"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="font-medium">
              {expenses.length === 0 ? "No expenses yet" : "No matching expenses"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {expenses.length === 0
                ? "Add your first expense with the form above."
                : "Try a different month or clear the search."}
            </p>
          </div>
        ) : (
          <div className="scrollbar-thin max-h-96 overflow-y-auto rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur">
                <TableRow>
                  <TableHead className="min-w-[110px]">Date</TableHead>
                  <TableHead className="min-w-[140px]">Item / Note</TableHead>
                  <TableHead className="min-w-[130px]">Category</TableHead>
                  <TableHead className="hidden min-w-[90px] sm:table-cell">Paid via</TableHead>
                  <TableHead className="min-w-[90px] text-right">Amount</TableHead>
                  <TableHead className="w-[70px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => {
                  const Icon = getCategoryIcon(e.category);
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground sm:text-sm">
                        {format(parseISO(e.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs sm:text-sm" title={e.note ?? e.category}>
                        {e.note || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${GROUP_BADGE_CLASSES[e.group] ?? ""} gap-1.5 font-normal`}>
                          <Icon className="h-3 w-3" aria-hidden="true" />
                          {e.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground sm:table-cell sm:text-sm">
                        {e.paymentMode}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs font-semibold sm:text-sm">
                        {formatINR(e.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {confirmId === e.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => deleteExpense.mutate(e.id)}
                              disabled={deleteExpense.isPending}
                            >
                              {deleteExpense.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                              ) : (
                                "Yes"
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => setConfirmId(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => setConfirmId(e.id)}
                            aria-label={`Delete expense of ${formatINR(e.amount)} on ${e.category}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
