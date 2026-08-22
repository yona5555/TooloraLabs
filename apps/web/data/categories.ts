export type Category = {
  slug: string;
  title: string;
  description: string;
  icon: string;
};

export const categories: Category[] = [
  {
    slug: "calculators",
    title: "Calculators",
    description: "Math, finance, health and engineering calculators.",
    icon: "calculator",
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
    slug: "text-tools",
    title: "Text Tools",
    description: "Edit and transform text.",
    icon: "text",
  },
  {
    slug: "file-tools",
    title: "File Tools",
    description: "Compress and convert files.",
    icon: "folder",
  },
  {
    slug: "financial-markets",
    title: "Financial Markets",
    description: "Live data and neutral, educational tools for crypto, forex, and commodities.",
    icon: "trending-up",
  },
  {
    slug: "math-science",
    title: "Math & Science",
    description: "Scientific and pure math calculators for equations, trigonometry, and everyday math.",
    icon: "sigma",
  },
  {
    slug: "health-fitness",
    title: "Health & Fitness",
    description: "Track your BMI, calorie needs, and other personal health metrics.",
    icon: "heart-pulse",
  },
  {
    slug: "website-tools",
    title: "Website Tools",
    description: "Embeddable widgets and utilities for website owners and creators.",
    icon: "globe",
  },
];
