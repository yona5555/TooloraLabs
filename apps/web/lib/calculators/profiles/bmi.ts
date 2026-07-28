import type { CalculatorDefinition } from "../types";

const common = {
  faq: [],
  sources: [],
  relatedTools: [
    {
      name: "Ideal Weight Calculator",
      href: "/health/ideal-weight-calculator",
    },
    {
      name: "BMR Calculator",
      href: "/health/bmr-calculator",
    },
  ],
  aiPrompt:
    "Explain the BMI result in simple language and provide general healthy lifestyle guidance without giving medical diagnosis.",
};

export const bmiProfile: CalculatorDefinition = {
  id: "bmi",
  name: "BMI Calculator",
  category: "Health",
  description:
    "Calculate your Body Mass Index (BMI) and understand what your result means.",

  resultLevels: [
    {
      level: "warning",
      title: "Underweight",
      shortDescription: "Your BMI is below the recommended range.",
      detailedDescription:
        "Being underweight may indicate inadequate nutrition or other health-related factors.",
      actionTitle: "Recommended Actions",
      recommendations: [
        {
          title: "Eat a balanced diet",
          description: "Increase calorie intake with nutritious foods.",
        },
        {
          title: "Consult a professional",
          description: "Seek medical advice if weight loss is unexplained.",
        },
      ],
      ...common,
    },
    {
      level: "normal",
      title: "Healthy Weight",
      shortDescription: "Your BMI is within the recommended range.",
      detailedDescription:
        "Maintain your current healthy lifestyle with balanced nutrition and regular exercise.",
      actionTitle: "Recommended Actions",
      recommendations: [
        {
          title: "Stay Active",
          description: "Aim for at least 150 minutes of exercise weekly.",
        },
        {
          title: "Balanced Diet",
          description: "Eat a varied diet rich in whole foods.",
        },
      ],
      ...common,
    },
    {
      level: "high",
      title: "Overweight",
      shortDescription: "Your BMI is above the recommended range.",
      detailedDescription:
        "A modest reduction in weight may reduce future health risks.",
      actionTitle: "Recommended Actions",
      recommendations: [
        {
          title: "Exercise Regularly",
          description: "Increase daily physical activity.",
        },
        {
          title: "Improve Nutrition",
          description: "Reduce excess sugar and highly processed foods.",
        },
      ],
      ...common,
    },
    {
      level: "critical",
      title: "Obesity",
      shortDescription: "Your BMI is significantly above the recommended range.",
      detailedDescription:
        "Obesity is associated with increased health risks and should be addressed with appropriate lifestyle changes.",
      actionTitle: "Recommended Actions",
      recommendations: [
        {
          title: "Consult a healthcare professional",
          description: "Discuss a sustainable weight management plan.",
        },
        {
          title: "Lifestyle Changes",
          description: "Combine healthy eating with regular physical activity.",
        },
      ],
      ...common,
    },
  ],
};
