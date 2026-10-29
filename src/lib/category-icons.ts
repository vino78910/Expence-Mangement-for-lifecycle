import {
  ShoppingBasket,
  Home,
  Zap,
  Bus,
  UtensilsCrossed,
  ShoppingBag,
  Clapperboard,
  Palette,
  Pill,
  Stethoscope,
  Dumbbell,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Repeat,
  Plane,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Essentials
  "Food & Groceries": ShoppingBasket,
  Rent: Home,
  "Bills & Utilities": Zap,
  Transport: Bus,
  // Lifestyle
  "Eating Out": UtensilsCrossed,
  Shopping: ShoppingBag,
  Entertainment: Clapperboard,
  Hobbies: Palette,
  // Health
  Medicines: Pill,
  "Doctor Visit": Stethoscope,
  "Gym & Fitness": Dumbbell,
  Insurance: ShieldCheck,
  // Education / Work
  Courses: GraduationCap,
  Books: BookOpen,
  Subscriptions: Repeat,
  "Work Travel": Plane,
};

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? LayoutGrid;
}
