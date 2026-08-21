import {
  Calculator,
  Code2,
  FileText,
  Folder,
  RefreshCw,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  calculator: Calculator,
  refresh: RefreshCw,
  code: Code2,
  text: FileText,
  folder: Folder,
  "trending-up": TrendingUp,
};

export function getCategoryIcon(icon: string): LucideIcon {
  return categoryIcons[icon] ?? Calculator;
}
