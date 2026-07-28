export type ResultLevel =
  | "excellent"
  | "good"
  | "normal"
  | "warning"
  | "high"
  | "critical";

export interface Recommendation {
  title: string;
  description: string;
}

export interface RelatedTool {
  name: string;
  href: string;
}

export interface SourceReference {
  title: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ResultAnalysis {
  level: ResultLevel;

  title: string;

  shortDescription: string;

  detailedDescription: string;

  actionTitle: string;

  recommendations: Recommendation[];

  relatedTools: RelatedTool[];

  faq: FAQItem[];

  sources: SourceReference[];

  aiPrompt: string;
}

export interface CalculatorDefinition {
  id: string;

  name: string;

  category: string;

  description: string;

  resultLevels: ResultAnalysis[];
}
