export type Tool = {
  slug: string;
  title: string;
  category: string;
  description: string;
  featured: boolean;
  keywords: string[];
};

export const tools: Tool[] = [
  {
    slug: "age-calculator",
    title: "Age Calculator",
    category: "calculators",
    description: "Calculate your exact age in years, months and days.",
    featured: true,
    keywords: ["age", "birthday", "date", "calculator"],
  },
  {
    slug: "bmi-calculator",
    title: "BMI Calculator",
    category: "calculators",
    description: "Calculate your Body Mass Index instantly.",
    featured: true,
    keywords: ["bmi", "body mass index", "health"],
  },
  {
    slug: "mortgage-calculator",
    title: "Mortgage Calculator",
    category: "calculators",
    description:
      "Calculate monthly mortgage payments, total interest, and total repayment.",
    featured: true,
    keywords: [
      "mortgage",
      "home loan",
      "loan",
      "interest",
      "payment",
      "finance",
    ],
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator",
    category: "calculators",
    description: "Perform fast percentage calculations.",
    featured: true,
    keywords: ["percentage", "math"],
  },
  {
    slug: "image-converter",
    title: "Image Converter",
    category: "converters",
    description: "Convert images between popular formats.",
    featured: true,
    keywords: ["image", "png", "jpg", "webp"],
  },
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    category: "developer-tools",
    description: "Format and validate JSON online.",
    featured: true,
    keywords: ["json", "formatter", "developer"],
  },
  {
    slug: "password-generator",
    title: "Password Generator",
    category: "developer-tools",
    description: "Generate strong and secure passwords.",
    featured: true,
    keywords: ["password", "security"],
  },
  {
    slug: "unit-converter",
    title: "Unit Converter",
    category: "converters",
    description: "Convert length, weight, temperature and more.",
    featured: true,
    keywords: ["unit", "converter", "measurement"],
  },
  {
    slug: "qr-code-generator",
    title: "QR Code Generator",
    category: "ai-tools",
    description: "Generate QR codes instantly.",
    featured: true,
    keywords: ["qr", "barcode"],
  },
];
