import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/server";
import prisma from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const admin = await requireRole("ADMIN");
    const { id: withdrawalId } = await context.params;
    const body = await req.json();
    const { reason } = body || {};

    if (!withdrawalId) {
      return errorResponse("ID penarikan tidak valid.", 400, "VALIDATION_ERROR");
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return errorResponse("Alasan penolakan pencairan wajib diisi.", 400, "VALIDATION_ERROR");
    }

    // Atomic transaction for conditional status check
    const updated = await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({
        where: { id: withdrawalId },
      });

      if (!withdrawal) {
        throw new Error("NOT_FOUND");
      }

      if (withdrawal.status !== "PENDING") {
        throw new Error("INVALID_STATUS");
      }

      const now = new Date();

      return tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "REJECTED",
          processedBy: admin.id,
          processedAt: now,
          rejectionReason: reason.trim().slice(0, 500),
        },
      });
    });

    return successResponse(`Permohonan penarikan dana ${withdrawalId} telah ditolak. Saldo dompet tidak terpotong.`, {
      withdrawal: updated,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
      }
      if (err.message === "FORBIDDEN") {
        return errorResponse("Akses ditolak. Khusus administrator.", 403, "FORBIDDEN");
      }
      if (err.message === "NOT_FOUND") {
        return errorResponse("Permohonan penarikan dana tidak ditemukan.", 404, "NOT_FOUND");
      }
      if (err.message === "INVALID_STATUS") {
        return errorResponse("Hanya permohonan dengan status PENDING yang dapat ditolak.", 400, "INVALID_STATUS_TRANSITION");
      }
    }
    console.error("POST /admin/withdrawals/:id/reject error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat menolak penarikan.", 500, "INTERNAL_SERVER_ERROR");
  }
}
