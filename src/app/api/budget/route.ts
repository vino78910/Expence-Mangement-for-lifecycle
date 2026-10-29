import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function isValidMonth(month: string): boolean {
  return /^\d{4}-\d{2}$/.test(month);
}

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month") ?? "";
  if (!isValidMonth(month)) {
    return NextResponse.json(
      { error: "A month (YYYY-MM) is required." },
      { status: 400 }
    );
  }
  try {
    const budget = await db.budget.findUnique({ where: { month } });
    return NextResponse.json({ month, amount: budget?.amount ?? 0 });
  } catch (error) {
    console.error("GET /api/budget failed:", error);
    return NextResponse.json(
      { error: "Could not load the budget." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const month = String(body.month ?? "");
    const amount = Number(body.amount);

    if (!isValidMonth(month)) {
      return NextResponse.json(
        { error: "A valid month (YYYY-MM) is required." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(amount) || amount < 0 || amount > 99_999_999) {
      return NextResponse.json(
        { error: "Please enter a valid budget amount." },
        { status: 400 }
      );
    }

    const budget = await db.budget.upsert({
      where: { month },
      update: { amount },
      create: { month, amount },
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error("PUT /api/budget failed:", error);
    return NextResponse.json(
      { error: "Could not save the budget." },
      { status: 500 }
    );
  }
}
