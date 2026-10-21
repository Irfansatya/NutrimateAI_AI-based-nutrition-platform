import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/server";
import { errorResponse, successResponse } from "@/lib/api/response";
import { CampaignStatus } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id: campaignId } = await context.params;
    const body = await req.json();
    const { action, endReason } = body || {};

    if (!action || !["publish", "cancel", "finish"].includes(action)) {
      return errorResponse("Aksi tidak valid (publish, cancel, finish).", 400, "INVALID_ACTION");
    }

    const campaign = await prisma.helpCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return errorResponse("Kampanye tidak ditemukan.", 404, "NOT_FOUND");
    }

    // Must be owner
    if (campaign.creatorUserId !== user.id) {
      return errorResponse("Anda tidak memiliki izin mengelola kampanye ini.", 403, "FORBIDDEN");
    }

    const now = new Date();
    let updatedStatus: CampaignStatus = campaign.status;
    let publishedAt = campaign.publishedAt;
    let deadlineAt = campaign.deadlineAt;
    let endedAt = campaign.endedAt;
    let finalEndReason = campaign.endReason;

    if (action === "publish") {
      // Allowed transition: APPROVED -> ACTIVE
      if (campaign.status !== "APPROVED") {
        return errorResponse("Hanya pengajuan dengan status APPROVED yang dapat dipublikasikan.", 400, "INVALID_STATUS_TRANSITION");
      }
      updatedStatus = "ACTIVE";
      publishedAt = now;
      deadlineAt = new Date(now.getTime() + campaign.durationDays * 864e5);
    } else if (action === "cancel") {
      // Allowed transition: REVIEW or APPROVED -> CANCELED
      if (campaign.status !== "REVIEW" && campaign.status !== "APPROVED") {
        return errorResponse("Hanya pengajuan pada status REVIEW atau APPROVED yang dapat dibatalkan.", 400, "INVALID_STATUS_TRANSITION");
      }
      updatedStatus = "CANCELED";
      endedAt = now;
      finalEndReason = "canceled_by_user";
    } else if (action === "finish") {
      // Allowed transition: ACTIVE -> COMPLETED
      if (campaign.status !== "ACTIVE") {
        return errorResponse("Hanya kampanye yang sedang berjalan (ACTIVE) yang dapat diselesaikan.", 400, "INVALID_STATUS_TRANSITION");
      }
      updatedStatus = "COMPLETED";
      endedAt = now;
      finalEndReason = endReason || "manual";
    }

    const updated = await prisma.helpCampaign.update({
      where: { id: campaignId },
      data: {
        status: updatedStatus,
        publishedAt,
        deadlineAt,
        endedAt,
        endReason: finalEndReason,
      },
      include: {
        items: true,
      },
    });

    return successResponse(`Status kampanye berhasil diubah menjadi ${updatedStatus}`, { campaign: updated });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("POST /campaigns/:id/action error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat memperbarui status kampanye.", 500, "INTERNAL_SERVER_ERROR");
  }
}
