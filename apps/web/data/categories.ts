export type Category = {
  slug: string;
  title: string;
  description: string;
  icon: string;
};

export const categories: Category[] = [
  {
    slug: "financial-calculators",
    title: "Financial Calculators",
    description: "Loans, mortgages, retirement, and other long-term personal finance planning tools.",
    icon: "piggy-bank",
  },
  {
    slug: "business-finance",
    title: "Business & Everyday Finance",
    description: "Tips, discounts, sales tax, invoicing, and other everyday and small-business money math.",
    icon: "receipt",
  },
  {
    slug: "financial-markets",
    title: "Financial Markets",
    description: "Live data and neutral, educational tools for crypto, forex, and commodities.",
    icon: "trending-up",
  },
  {
    slug: "math",
    title: "Math",
    description: "Pure math calculators for arithmetic, algebra, statistics, and linear algebra.",
    icon: "sigma",
  },
  {
    slug: "physics",
    title: "Physics",
    description: "Motion, force, energy, and electrical calculators for physics problems.",
    icon: "atom",
  },
  {
    slug: "chemistry",
    title: "Chemistry",
    description: "Solve equations, concentrations, and molar quantities for chemistry problems.",
    icon: "flask",
  },
  {
    slug: "converters",
    title: "Converters",
    description: "Convert units, currencies, files and measurements.",
    icon: "refresh",
  },
  {
    slug: "developer-tools",
    title: "Developer Tools",
    description: "Utilities for developers.",
    icon: "code",
  },
  {
    slug: "file-tools",
    title: "File Tools",
    description: "Compress and convert files.",
    icon: "folder",
  },
  {
    slug: "text-tools",
    title: "Text Tools",
    description: "Edit and transform text.",
    icon: "text",
  },
  {
    slug: "student-productivity",
    title: "Student & Productivity",
    description: "Schedules, study sessions, citations, and grades for students and focused work.",
    icon: "graduation-cap",
  },
  {
    slug: "health-fitness",
    title: "Health & Fitness",
    description: "Track your BMI, calorie needs, and other personal health metrics.",
    icon: "heart-pulse",
  },
  {
    slug: "date-time",
    title: "Date & Time",
    description: "Ages, dates, and time zones across the world.",
    icon: "calendar-clock",
  },
  {
    slug: "weather",
    title: "Weather",
    description: "Current conditions and forecasts for cities around the world.",
    icon: "cloud-sun",
  },
  {
    slug: "website-tools",
    title: "Website Tools",
    description: "Embeddable widgets and utilities for website owners and creators.",
    icon: "globe",
  },
];
