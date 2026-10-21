import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/server";
import { errorResponse, successResponse } from "@/lib/api/response";
import { CampaignStatus, ReviewDecision, Prisma } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const adminUser = await requireRole("ADMIN");
    const { id: campaignId } = await context.params;
    const body = await req.json();
    const { decision, note, checklist } = body || {};

    if (!decision || !["APPROVED", "REVISION_REQUESTED", "REJECTED"].includes(decision)) {
      return errorResponse("Keputusan review tidak valid (APPROVED, REVISION_REQUESTED, REJECTED).", 400, "INVALID_DECISION");
    }

    if ((decision === "REVISION_REQUESTED" || decision === "REJECTED") && (!note || typeof note !== "string" || note.trim().length < 10)) {
      return errorResponse("Catatan review minimal 10 karakter untuk revisi atau penolakan.", 400, "VALIDATION_ERROR");
    }

    const campaign = await prisma.helpCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return errorResponse("Kampanye tidak ditemukan.", 404, "NOT_FOUND");
    }

    // Only REVIEW campaigns can be reviewed
    if (campaign.status !== "REVIEW") {
      return errorResponse(`Kampanye dengan status ${campaign.status} tidak dapat ditinjau ulang.`, 400, "INVALID_CAMPAIGN_STATUS");
    }

    // Determine target campaign status based on decision
    let nextStatus: CampaignStatus = "REVIEW";
    if (decision === "APPROVED") {
      nextStatus = "APPROVED";
    } else if (decision === "REVISION_REQUESTED") {
      nextStatus = "REVISION";
    } else if (decision === "REJECTED") {
      nextStatus = "REJECTED";
    }

    // Atomic transaction: Create CampaignReview and update HelpCampaign status
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.campaignReview.create({
        data: {
          campaignId: campaign.id,
          adminUserId: adminUser.id,
          decision: decision as ReviewDecision,
          note: note ? note.trim() : null,
          checklist: checklist ? (checklist as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });

      const updatedCampaign = await tx.helpCampaign.update({
        where: { id: campaign.id },
        data: {
          status: nextStatus,
          adminNote: note ? note.trim() : null,
        },
        include: {
          items: true,
          reviews: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      return { review, campaign: updatedCampaign };
    });

    return successResponse(`Keputusan review berhasil disimpan. Status kampanye: ${nextStatus}`, result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
      }
      if (err.message === "FORBIDDEN") {
        return errorResponse("Akses ditolak. Endpoint khusus administrator.", 403, "FORBIDDEN");
      }
    }
    console.error("POST /admin/campaigns/:id/review error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat menyimpan keputusan review.", 500, "INTERNAL_SERVER_ERROR");
  }
}
