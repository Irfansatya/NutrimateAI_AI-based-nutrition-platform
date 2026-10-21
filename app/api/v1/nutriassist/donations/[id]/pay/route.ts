import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/server";
import prisma from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id: donationId } = await context.params;

    if (!donationId) {
      return errorResponse("ID donasi tidak valid.", 400, "VALIDATION_ERROR");
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            recipientName: true,
            category: true,
          },
        },
      },
    });

    if (!donation) {
      return errorResponse("Donasi tidak ditemukan.", 404, "NOT_FOUND");
    }

    if (donation.donorUserId !== user.id) {
      return errorResponse("Anda tidak memiliki akses ke transaksi donasi ini.", 403, "FORBIDDEN");
    }

    if (donation.status !== "PENDING_PAYMENT") {
      return errorResponse(`Status donasi saat ini adalah ${donation.status}. Tidak dapat diajukan verifikasi ulang.`, 400, "INVALID_STATUS");
    }

    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: "PENDING_VERIFICATION",
        paymentSubmittedAt: new Date(),
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            recipientName: true,
            category: true,
          },
        },
      },
    });

    return successResponse("Pembayaran berhasil dikonfirmasi dan menunggu verifikasi admin.", { donation: updated });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("POST /nutriassist/donations/:id/pay error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat memperbarui status pembayaran.", 500, "INTERNAL_SERVER_ERROR");
  }
}
