import {
  Braces,
  Calendar,
  HandCoins,
  Home,
  Image,
  KeyRound,
  Percent,
  QrCode,
  Receipt,
  Ruler,
  Scale,
  Tag,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const toolIcons: Record<string, LucideIcon> = {
  "age-calculator": Calendar,
  "bmi-calculator": Scale,
  "mortgage-calculator": Home,
  "percentage-calculator": Percent,
  "tip-calculator": HandCoins,
  "discount-calculator": Tag,
  "sales-tax-calculator": Receipt,
  "image-converter": Image,
  "json-formatter": Braces,
  "password-generator": KeyRound,
  "unit-converter": Ruler,
  "qr-code-generator": QrCode,
};

export function getToolIcon(slug: string): LucideIcon {
  return toolIcons[slug] ?? Wrench;
}
