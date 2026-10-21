import { requireUser } from "@/lib/auth/server";
import prisma from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { calculateUserWalletBalances } from "@/lib/nutriwallet/balances";

export async function GET() {
  try {
    const user = await requireUser();

    const summary = await calculateUserWalletBalances(prisma, user.id, user.name);

    return successResponse("Ringkasan saldo dompet berhasil diambil", summary);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("GET /nutriwallet/summary error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}
