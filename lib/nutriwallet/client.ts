export interface CreateWithdrawalPayload {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
}

export interface WalletSummaryData {
  wallet: {
    id: string;
    userId: string;
    recipientName: string;
    balance: number;
  };
  totalIn: number;
  heldBalance: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  availableBalance: number;
  donorCount: number;
}

export interface AdminRejectWithdrawalPayload {
  reason: string;
}

export async function apiGetWalletSummary() {
  const res = await fetch("/api/v1/nutriwallet/summary", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiGetWalletWithdrawals() {
  const res = await fetch("/api/v1/nutriwallet/withdrawals", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiCreateWithdrawal(payload: CreateWithdrawalPayload) {
  const res = await fetch("/api/v1/nutriwallet/withdrawals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiGetAdminWithdrawals(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`/api/v1/admin/withdrawals${query}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiAdminCompleteWithdrawal(withdrawalId: string) {
  const res = await fetch(`/api/v1/admin/withdrawals/${withdrawalId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  return res.json();
}

export async function apiAdminRejectWithdrawal(
  withdrawalId: string,
  payload: AdminRejectWithdrawalPayload
) {
  const res = await fetch(`/api/v1/admin/withdrawals/${withdrawalId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  return res.json();
}
