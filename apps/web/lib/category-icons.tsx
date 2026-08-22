import {
  Calculator,
  Code2,
  FileText,
  Folder,
  Globe,
  HeartPulse,
  RefreshCw,
  Sigma,
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
  sigma: Sigma,
  "heart-pulse": HeartPulse,
  globe: Globe,
};

export function getCategoryIcon(icon: string): LucideIcon {
  return categoryIcons[icon] ?? Calculator;
}
