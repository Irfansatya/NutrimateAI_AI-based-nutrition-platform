import { CampaignCategory, CampaignStatus, ReviewDecision } from "@prisma/client";

export interface NeedItemPayload {
  name: string;
  quantity: string;
  estimatedCost: number;
}

export interface CreateCampaignPayload {
  category: CampaignCategory;
  applicantName: string;
  recipientName: string;
  whatsappNumber: string;
  relationship: string;
  province: string;
  city: string;
  title: string;
  story: string;
  healthConditionDesc: string;
  economicConditionDesc: string;
  durationDays: number;
  items: NeedItemPayload[];
  thumbnailUrl?: string;
  documents?: {
    ktp?: string[];
    kondisi?: string[];
    ekonomi?: string[];
    thumb?: string[];
  };
  formSnapshot?: Record<string, unknown>;
}

export interface CampaignActionPayload {
  action: "publish" | "cancel" | "finish";
  endReason?: "manual" | "target" | "expired";
}

export interface AdminReviewPayload {
  decision: ReviewDecision; // "APPROVED" | "REVISION_REQUESTED" | "REJECTED"
  note?: string;
  checklist?: boolean[];
}

export async function apiGetUserCampaigns() {
  const res = await fetch("/api/v1/nutrihelp/campaigns", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiCreateCampaign(payload: CreateCampaignPayload) {
  const res = await fetch("/api/v1/nutrihelp/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiUpdateCampaignAction(
  campaignId: string,
  payload: CampaignActionPayload
) {
  const res = await fetch(`/api/v1/nutrihelp/campaigns/${campaignId}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiGetAdminCampaigns() {
  const res = await fetch("/api/v1/admin/campaigns", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiAdminReviewCampaign(
  campaignId: string,
  payload: AdminReviewPayload
) {
  const res = await fetch(`/api/v1/admin/campaigns/${campaignId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  return res.json();
}
