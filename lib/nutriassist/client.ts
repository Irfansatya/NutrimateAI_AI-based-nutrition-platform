import { DonationStatus } from "@prisma/client";

export interface CreateDonationPayload {
  campaignId: string;
  amount: number;
  donorName?: string;
  isAnonymous?: boolean;
  message?: string;
}

export interface AdminVerifyDonationPayload {
  decision: "CONFIRMED" | "REJECTED";
}

export async function apiGetActiveCampaigns() {
  const res = await fetch("/api/v1/nutriassist/campaigns", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiGetMyDonations() {
  const res = await fetch("/api/v1/nutriassist/donations", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiCreateDonation(payload: CreateDonationPayload) {
  const res = await fetch("/api/v1/nutriassist/donations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiMarkDonationPaid(donationId: string) {
  const res = await fetch(`/api/v1/nutriassist/donations/${donationId}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiGetAdminDonations(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`/api/v1/admin/donations${query}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiAdminVerifyDonation(
  donationId: string,
  payload: AdminVerifyDonationPayload
) {
  const res = await fetch(`/api/v1/admin/donations/${donationId}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  return res.json();
}
