import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/server";
import prisma from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { WithdrawalStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    const withdrawals = await prisma.withdrawal.findMany({
      where: statusParam ? { status: statusParam as WithdrawalStatus } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        wallet: {
          select: {
            id: true,
            recipientName: true,
            balance: true,
          },
        },
        processor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse("Daftar penarikan admin berhasil diambil", { withdrawals });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
      }
      if (err.message === "FORBIDDEN") {
        return errorResponse("Akses ditolak. Khusus administrator.", 403, "FORBIDDEN");
      }
    }
    console.error("GET /admin/withdrawals error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}
