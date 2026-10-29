import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const expenses = await db.expense.findMany({
      orderBy: [{ date: "desc" }],
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("GET /api/expenses failed:", error);
    return NextResponse.json(
      { error: "Could not load expenses. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid amount greater than 0." },
        { status: 400 }
      );
    }

    const group = String(body.group ?? "").trim();
    const category = String(body.category ?? "").trim();
    const paymentMode = String(body.paymentMode ?? "").trim();
    if (!group || !category || !paymentMode) {
      return NextResponse.json(
        { error: "Category and payment mode are required." },
        { status: 400 }
      );
    }

    const note = body.note ? String(body.note).trim().slice(0, 200) : null;

    let date = new Date();
    if (body.date) {
      const parsed = new Date(String(body.date));
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "The date you entered is not valid." },
          { status: 400 }
        );
      }
      date = parsed;
    }

    const expense = await db.expense.create({
      data: { amount, group, category, paymentMode, note, date },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses failed:", error);
    return NextResponse.json(
      { error: "Could not save the expense. Please try again." },
      { status: 500 }
    );
  }
}
