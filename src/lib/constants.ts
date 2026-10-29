export const CATEGORY_GROUPS: Record<string, string[]> = {
  Essentials: ["Food & Groceries", "Rent", "Bills & Utilities", "Transport"],
  Lifestyle: ["Eating Out", "Shopping", "Entertainment", "Hobbies"],
  Health: ["Medicines", "Doctor Visit", "Gym & Fitness", "Insurance"],
  "Education/Work": ["Courses", "Books", "Subscriptions", "Work Travel"],
};

export const GROUP_ORDER = Object.keys(CATEGORY_GROUPS);

export const GROUP_COLORS: Record<string, string> = {
  Essentials: "#059669",
  Lifestyle: "#d97706",
  Health: "#e11d48",
  "Education/Work": "#7c3aed",
};

export const GROUP_BADGE_CLASSES: Record<string, string> = {
  Essentials:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Lifestyle:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Health: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  "Education/Work":
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

export const PAYMENT_MODES = ["Cash", "UPI", "Card", "Other"];

export const ALL_CATEGORIES: string[] = Object.values(CATEGORY_GROUPS).flat();

export function getGroupOfCategory(category: string): string {
  for (const [group, cats] of Object.entries(CATEGORY_GROUPS)) {
    if (cats.includes(category)) return group;
  }
  return "Essentials";
}

export function getGroupColor(group: string): string {
  return GROUP_COLORS[group] ?? "#059669";
}
