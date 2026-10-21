import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/server";
import { errorResponse, successResponse } from "@/lib/api/response";
import { CampaignStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    const campaigns = await prisma.helpCampaign.findMany({
      where: statusParam ? { status: statusParam as CampaignStatus } : {},
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            adminUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        donations: {
          where: { status: "CONFIRMED" },
          select: {
            amount: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return successResponse("Daftar kampanye admin berhasil diambil", { campaigns });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
      }
      if (err.message === "FORBIDDEN") {
        return errorResponse("Akses ditolak. Endpoint khusus administrator.", 403, "FORBIDDEN");
      }
    }
    console.error("GET /admin/campaigns error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}
