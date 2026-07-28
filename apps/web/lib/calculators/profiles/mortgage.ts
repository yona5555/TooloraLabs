import type { CalculatorDefinition } from "../types";

const common = {
  faq: [],
  sources: [],
  relatedTools: [
    {
      name: "Loan Calculator",
      href: "/finance/loan-calculator",
    },
    {
      name: "Affordability Calculator",
      href: "/finance/mortgage-affordability-calculator",
    },
  ],
  aiPrompt:
    "Explain the mortgage result in simple language and provide practical financial guidance without giving financial or legal advice.",
};

export const mortgageProfile: CalculatorDefinition = {
  id: "mortgage",
  name: "Mortgage Calculator",
  category: "Finance",
  description:
    "Calculate your monthly mortgage payment, total interest, and total repayment.",

  resultLevels: [
    {
      level: "excellent",
      title: "Excellent",
      shortDescription: "Your mortgage terms are very favorable.",
      detailedDescription:
        "The mortgage has a relatively low borrowing cost and appears financially efficient.",
      actionTitle: "Recommended Actions",
      recommendations: [
        {
          title: "Maintain your payment schedule",
          description: "Continue making payments on time.",
        },
      ],
      ...common,
    },
    {
      level: "good",
      title: "Good",
      shortDescription: "Your mortgage terms are generally favorable.",
      detailedDescription:
        "The mortgage is reasonably efficient, though small improvements may be possible.",
      actionTitle: "Recommended Actions",
      recommendations: [
        {
          title: "Review refinancing opportunities",
          description: "Compare future market rates periodically.",
        },
      ],
      ...common,
    },
    {
      level: "normal",
      title: "Average",
      shortDescription: "Your mortgage is within a typical range.",
      detailedDescription:
        "The mortgage is acceptable but comparing alternatives could reduce long-term costs.",
      actionTitle: "Recommended Actions",
      recommendations: [
        {
          title: "Compare lenders",
          description: "Shop around before finalizing your mortgage.",
        },
      ],
      ...common,
    },
    {
      level: "warning",
      title: "High Cost",
      shortDescription: "Your mortgage may be more expensive than expected.",
      detailedDescription:
        "Interest costs may have a noticeable impact on the total amount repaid.",
      actionTitle: "Recommended Actions",
      recommendations: [
        {
          title: "Increase your down payment",
          description: "Reducing the loan amount lowers interest costs.",
        },
      ],
      ...common,
    },
    {
      level: "high",
      title: "Very High Cost",
      shortDescription: "Your mortgage has a high borrowing cost.",
      detailedDescription:
        "Consider reviewing loan terms or comparing additional lenders.",
      actionTitle: "Recommended Actions",
      recommendations: [
        {
          title: "Consider refinancing",
          description: "Lower rates may significantly reduce total payments.",
        },
      ],
      ...common,
    },
    {
      level: "critical",
      title: "Critical",
      shortDescription: "Your mortgage may create substantial financial pressure.",
      detailedDescription:
        "The borrowing cost is very high and deserves careful evaluation before proceeding.",
      actionTitle: "Recommended Actions",
      recommendations: [
        {
          title: "Seek professional financial advice",
          description: "Review all available financing options before committing.",
        },
      ],
      ...common,
    },
  ],
};
