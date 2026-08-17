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
];
