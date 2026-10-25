import { tools } from "@/data/tools";

export type Category = {
  slug: string;
  title: string;
  description: string;
  icon: string;
};

const categoryList: Category[] = [
  {
    slug: "financial-calculators",
    title: "Finance",
    description: "Loans, mortgages, retirement, and other long-term personal finance planning tools.",
    icon: "piggy-bank",
  },
  {
    slug: "business-finance",
    title: "Business",
    description: "Tips, discounts, sales tax, invoicing, and other everyday and small-business money math.",
    icon: "receipt",
  },
  {
    slug: "financial-markets",
    title: "Markets",
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
    slug: "ai-tools",
    title: "AI Tools",
    description: "AI-powered productivity tools.",
    icon: "brain-circuit",
  },
  {
    slug: "developer-tools",
    title: "Dev Tools",
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
    title: "Student Tools",
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
  {
    slug: "algebra-number-theory",
    title: "Algebra & Number Theory",
    description: "Equations, polynomials, factoring, and the properties of numbers.",
    icon: "variable",
  },
  {
    slug: "calculus-analysis",
    title: "Calculus & Analysis",
    description: "Limits, derivatives, integrals, and the mathematics of continuous change.",
    icon: "spline",
  },
  {
    slug: "probability-statistics",
    title: "Probability & Statistics",
    description: "Distributions, combinatorics, and the mathematics of chance and data.",
    icon: "dices",
  },
  {
    slug: "geometry-coordinate-math",
    title: "Geometry & Coordinate Math",
    description: "Shapes, coordinate systems, and the mathematics of space and transformations.",
    icon: "axis-3d",
  },
];

/**
 * The one site-wide order of the sections (see .claude/rules/category-order.md). Every page, menu and
 * listing reads `categories` below, so changing the order means editing this list only.
 * Sections not listed here (the planned, still-empty ones) follow in their original order.
 */
export const CATEGORY_ORDER = [
  "math",
  "financial-markets",
  "physics",
  "chemistry",
  "health-fitness",
  "financial-calculators",
  "business-finance",
  "student-productivity",
  "text-tools",
  "date-time",
  "weather",
  "ai-tools",
  "developer-tools",
  "file-tools",
  "converters",
] as const;

const rank = (slug: string) => {
  const i = (CATEGORY_ORDER as readonly string[]).indexOf(slug);
  return i === -1 ? CATEGORY_ORDER.length + categoryList.findIndex((c) => c.slug === slug) : i;
};

export const categories: Category[] = [...categoryList].sort((a, b) => rank(a.slug) - rank(b.slug));


/**
 * A category page is generated only once the section has this many live tools (AdSense low-value rule,
 * see .claude/rules/category-order.md). Below it the page is not built, not in the sitemap, and every link
 * goes to `categoryHref` instead; next.config.ts 301-redirects the old URL.
 */
export const MIN_TOOLS_FOR_CATEGORY_PAGE = 3;

const liveToolCount = (slug: string) => tools.filter((tool) => tool.category === slug).length;

/** Sections that get a /categories/{slug} page, in the site-wide order. */
export const categoryPages: Category[] = categories.filter((c) => liveToolCount(c.slug) >= MIN_TOOLS_FOR_CATEGORY_PAGE);

export const hasCategoryPage = (slug: string) => categoryPages.some((c) => c.slug === slug);

/** Where a link to a section goes: its page, or (below the threshold) its block on the all-tools page. */
export const categoryHref = (slug: string) =>
  hasCategoryPage(slug) ? `/categories/${slug}` : `/tools#category-${slug}`;
