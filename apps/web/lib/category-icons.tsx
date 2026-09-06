import {
  Atom,
  Calculator,
  CalendarClock,
  CloudSun,
  Code2,
  FileText,
  FlaskConical,
  Folder,
  GraduationCap,
  Globe,
  HeartPulse,
  PartyPopper,
  PiggyBank,
  Receipt,
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
  "piggy-bank": PiggyBank,
  receipt: Receipt,
  atom: Atom,
  flask: FlaskConical,
  "graduation-cap": GraduationCap,
  "calendar-clock": CalendarClock,
  "cloud-sun": CloudSun,
  "party-popper": PartyPopper,
};

export function getCategoryIcon(icon: string): LucideIcon {
  return categoryIcons[icon] ?? Calculator;
}
