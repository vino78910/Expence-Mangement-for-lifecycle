"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Loader2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_GROUPS, GROUP_ORDER, PAYMENT_MODES } from "@/lib/constants";

export function AddExpenseForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [group, setGroup] = useState<string>(GROUP_ORDER[0]);
  const [category, setCategory] = useState<string>(CATEGORY_GROUPS[GROUP_ORDER[0]][0]);
  const [paymentMode, setPaymentMode] = useState<string>("UPI");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");

  const addExpense = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          group,
          category,
          paymentMode,
          note: note.trim() || null,
          date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save the expense.");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Expense added",
        description: `${category} was saved successfully.`,
      });
      setAmount("");
      setNote("");
    },
    onError: (error: Error) => {
      toast({
        title: "Could not add expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function handleGroupChange(value: string) {
    setGroup(value);
    setCategory(CATEGORY_GROUPS[value][0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(amount);
    if (!amount || !Number.isFinite(num) || num <= 0) {
      toast({
        title: "Please enter an amount",
        description: "The amount must be a number greater than 0.",
        variant: "destructive",
      });
      return;
    }
    addExpense.mutate();
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
          Add Today&apos;s Expense
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Log what you spent. It takes less than 10 seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="pl-9 h-11"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                className="h-11"
                value={date}
                max={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Group</Label>
              <Select value={group} onValueChange={handleGroupChange}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_ORDER.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(CATEGORY_GROUPS[group] ?? []).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Paid via</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                type="text"
                placeholder="e.g. lunch with friend"
                className="h-11"
                maxLength={200}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold"
            disabled={addExpense.isPending}
          >
            {addExpense.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Add Expense
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
