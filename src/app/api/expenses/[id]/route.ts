import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const existing = await db.expense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "This expense was already deleted." },
        { status: 404 }
      );
    }
    await db.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] failed:", error);
    return NextResponse.json(
      { error: "Could not delete the expense. Please try again." },
      { status: 500 }
    );
  }
}
