import { requireUser } from "@/lib/auth/server";
import prisma from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";

export async function GET() {
  try {
    await requireUser();

    const campaigns = await prisma.helpCampaign.findMany({
      where: { status: "ACTIVE" },
      include: {
        creator: { select: { id: true, name: true } },
        items: { orderBy: { sortOrder: "asc" } },
        donations: {
          where: { status: "CONFIRMED" },
          select: {
            id: true,
            amount: true,
            donorName: true,
            isAnonymous: true,
            message: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { publishedAt: "desc" },
    });

    // Attach server-computed aggregates (only CONFIRMED donations)
    const result = campaigns.map((c) => {
      const confirmedAmount = c.donations.reduce(
        (sum, d) => sum + Number(d.amount),
        0
      );
      return {
        ...c,
        _confirmedAmount: confirmedAmount,
        _donorCount: c.donations.length,
      };
    });

    return successResponse("Daftar kampanye aktif berhasil diambil", {
      campaigns: result,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("GET /nutriassist/campaigns error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}
