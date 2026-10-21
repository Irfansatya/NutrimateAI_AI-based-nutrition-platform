export interface DashboardSummary {
  totalUsers: number;
  pendingCampaigns: number;
  activeCampaigns: number;
  totalConfirmedDonations: number;
  confirmedDonationCount: number;
  unrepliedMessages: number;
  /** Unique campaign creators with ACTIVE or COMPLETED campaign */
  totalRecipients: number;
  monthlyUserGrowth: { label: string; count: number }[];
  recentActivity: { text: string; ts: string }[];
}

export async function apiGetDashboardSummary(): Promise<{
  success: boolean;
  data?: DashboardSummary;
  message?: string;
}> {
  const res = await fetch("/api/v1/admin/dashboard/summary", {
    method: "GET",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}
