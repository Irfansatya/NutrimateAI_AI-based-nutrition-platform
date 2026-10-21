import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/server";
import { errorResponse, successResponse } from "@/lib/api/response";

export async function GET() {
  try {
    await requireRole("ADMIN");

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      pendingCampaigns,
      activeCampaigns,
      donationAgg,
      unrepliedMessages,
      // totalRecipients: distinct user IDs with at least one ACTIVE/COMPLETED campaign
      // (one user may submit multiple campaigns; count unique beneficiaries)
      recipientRows,
      recentUsers,
      recentCampaigns,
      recentDonations,
      recentMessages,
      growthRows,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null, role: "USER" } }),
      prisma.helpCampaign.count({ where: { status: "REVIEW" } }),
      prisma.helpCampaign.count({ where: { status: "ACTIVE" } }),
      prisma.donation.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.contactMessage.count({ where: { status: "UNREPLIED" } }),
      // Count distinct creatorUserId on campaigns that reached ACTIVE or COMPLETED
      prisma.helpCampaign.groupBy({
        by: ["creatorUserId"],
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
      }),
      // Recent activity sources
      prisma.user.findMany({
        where: { deletedAt: null, role: "USER" },
        select: { name: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.helpCampaign.findMany({
        select: { applicantName: true, recipientName: true, submittedAt: true, status: true },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
      prisma.donation.findMany({
        where: { status: "CONFIRMED" },
        select: { donorName: true, amount: true, verifiedAt: true, isAnonymous: true },
        orderBy: { verifiedAt: "desc" },
        take: 5,
      }),
      prisma.contactMessage.findMany({
        select: { name: true, subject: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // User registrations grouped by month (last 12 months)
      prisma.$queryRaw<{ year: number; month: number; count: bigint }[]>`
        SELECT
          EXTRACT(YEAR  FROM created_at AT TIME ZONE 'Asia/Jakarta')::int AS year,
          EXTRACT(MONTH FROM created_at AT TIME ZONE 'Asia/Jakarta')::int AS month,
          COUNT(*)::bigint AS count
        FROM users
        WHERE deleted_at IS NULL
          AND role = 'USER'
          AND created_at >= ${twelveMonthsAgo}
        GROUP BY 1, 2
        ORDER BY 1, 2
      `,
    ]);

    // Build 12-month array aligned to calendar months
    const now = new Date();
    const monthlyUserGrowth: { label: string; count: number }[] = [];
    const ID_MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-based
      const row = growthRows.find((r) => Number(r.year) === y && Number(r.month) === m);
      monthlyUserGrowth.push({ label: ID_MONTHS[m - 1], count: row ? Number(row.count) : 0 });
    }

    // Build recent activity list sorted by timestamp descending
    type RawActivity = { text: string; ts: Date };
    const rawActivities: RawActivity[] = [];

    for (const u of recentUsers) {
      rawActivities.push({ text: `Pengguna baru bergabung: ${u.name}`, ts: u.createdAt });
    }
    for (const c of recentCampaigns) {
      const label =
        c.status === "REVIEW"
          ? `Pengajuan baru dari ${c.applicantName} menunggu verifikasi`
          : `Kampanye "${c.recipientName}" diperbarui menjadi ${c.status.toLowerCase()}`;
      rawActivities.push({ text: label, ts: c.submittedAt });
    }
    for (const d of recentDonations) {
      const who = d.isAnonymous ? "Anonim" : d.donorName;
      const amt = Number(d.amount).toLocaleString("id-ID");
      rawActivities.push({
        text: `Donasi Rp${amt} dari ${who} telah dikonfirmasi`,
        ts: d.verifiedAt ?? new Date(0),
      });
    }
    for (const m of recentMessages) {
      const subj = m.subject ? ` — "${m.subject}"` : "";
      rawActivities.push({ text: `Pesan baru dari ${m.name}${subj}`, ts: m.createdAt });
    }

    const recentActivity = rawActivities
      .sort((a, b) => b.ts.getTime() - a.ts.getTime())
      .slice(0, 10)
      .map((a) => ({ text: a.text, ts: a.ts.toISOString() }));

    return successResponse("Ringkasan dashboard admin berhasil diambil.", {
      totalUsers,
      pendingCampaigns,
      activeCampaigns,
      totalConfirmedDonations: Number(donationAgg._sum.amount ?? 0),
      confirmedDonationCount: donationAgg._count._all,
      unrepliedMessages,
      // Total unique submitters with an ACTIVE or COMPLETED campaign
      // Limitation: counts campaign creators, not necessarily end beneficiaries
      totalRecipients: recipientRows.length,
      monthlyUserGrowth,
      recentActivity,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
      }
      if (err.message === "FORBIDDEN") {
        return errorResponse("Akses ditolak. Endpoint khusus administrator.", 403, "FORBIDDEN");
      }
    }
    console.error(
      "GET /admin/dashboard/summary error:",
      err instanceof Error ? err.message : "Unknown"
    );
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}

// Force dynamic — session cookie required
export const dynamic = "force-dynamic";
