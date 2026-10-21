export interface NutriPlanDay {
  id: string;
  dayIndex: number;
  recommendationDate: string;
  totalCalories: number | null;
  estimatedCost: number;
  isOverBudget: boolean;
  dailyTips: string | null;
  meals: {
    time: string;
    label: string;
    items: {
      id: string;
      name: string;
      portion: string;
      estimatedCost: number;
      nutritionSummary: string;
      benefit: string;
    }[];
  }[];
}

export interface NutriPlanData {
  id: string;
  assessmentId: string;
  category: "PREGNANCY" | "BREASTFEEDING" | "CHILD";
  version: number;
  periodStart: string;
  periodEnd: string;
  dailyBudget: number;
  targetNutrition: string | null;
  status: string;
  modelProvider: string | null;
  modelName: string | null;
  isApproved: boolean;
  readyAt: string | null;
  createdAt: string;
  days: NutriPlanDay[];
}

export async function apiGetCurrentPlan(category?: string) {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`/api/v1/nutriplan/current${query}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiGeneratePlan(
  category: string,
  options?: { regenerate?: boolean; excludeWords?: string[]; budgetFactor?: number }
) {
  const res = await fetch("/api/v1/nutriplan/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      category,
      regenerate: Boolean(options?.regenerate),
      excludeWords: options?.excludeWords || [],
      budgetFactor: options?.budgetFactor ?? 1,
    }),
  });
  return res.json();
}
