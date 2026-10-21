export type NutritionContextType = "PREGNANCY" | "BREASTFEEDING" | "CHILD";

export interface SaveAssessmentPayload {
  category: NutritionContextType;
  periodKey?: string;
  data: Record<string, unknown>;
}

export interface GrowthRecordItem {
  ym: number;
  x: number;
  bb: number;
  tb: number;
  bb0?: number | null;
  jk?: "L" | "P";
}

export interface AssessmentResponse {
  id: string;
  contextId: string;
  category: NutritionContextType;
  periodKey: string;
  version: number;
  isBaseline: boolean;
  status: string;
  economicData: unknown;
  healthData: unknown;
  environmentData: unknown;
  contextSnapshot: unknown;
  createdAt: string;
}

export async function apiSaveAssessment(payload: SaveAssessmentPayload) {
  const res = await fetch("/api/v1/nutricheck/assessments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiGetAssessments(category?: NutritionContextType) {
  const url = category
    ? `/api/v1/nutricheck/assessments?category=${category}`
    : "/api/v1/nutricheck/assessments";
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiGetLatestAssessment(category: NutritionContextType) {
  const res = await fetch(`/api/v1/nutricheck/assessments/latest?category=${category}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}
