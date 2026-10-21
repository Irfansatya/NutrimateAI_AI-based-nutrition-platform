import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/server";
import prisma from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { DonationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    const donations = await prisma.donation.findMany({
      where: statusParam ? { status: statusParam as DonationStatus } : {},
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            recipientName: true,
            category: true,
            creatorUserId: true,
          },
        },
        donorUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        verifierAdmin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse("Daftar donasi admin berhasil diambil", { donations });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
      }
      if (err.message === "FORBIDDEN") {
        return errorResponse("Akses ditolak. Khusus administrator.", 403, "FORBIDDEN");
      }
    }
    console.error("GET /admin/donations error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}
