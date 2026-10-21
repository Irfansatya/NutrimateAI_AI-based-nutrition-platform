import { PrismaClient, Prisma } from "@prisma/client";

export interface UserWalletBalanceCalculation {
  wallet: {
    id: string;
    userId: string;
    recipientName: string;
    balance: number;
  };
  totalIn: number;
  heldBalance: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  availableBalance: number;
  donorCount: number;
}

/**
 * Calculates user wallet balances strictly according to docs/DATABASE.md:
 * - wallets.balance: stored balance = totalIn - totalWithdrawn
 * - heldBalance: confirmed donations from campaigns currently in status "ACTIVE"
 * - pendingWithdrawals: sum of withdrawals in status "PENDING"
 * - availableBalance: max(0, wallets.balance - heldBalance - pendingWithdrawals)
 */
export async function calculateUserWalletBalances(
  prismaTx: PrismaClient | Prisma.TransactionClient,
  userId: string,
  userName?: string
): Promise<UserWalletBalanceCalculation> {
  // 1. Upsert or find user's wallet
  let wallet = await prismaTx.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prismaTx.wallet.create({
      data: {
        userId,
        recipientName: userName || "Penerima Bantuan",
        balance: new Prisma.Decimal(0),
      },
    });
  }

  // 2. Total In: Total confirmed donations to user's campaigns
  const confirmedDonations = await prismaTx.donation.findMany({
    where: {
      status: "CONFIRMED",
      campaign: {
        creatorUserId: userId,
      },
    },
    select: {
      amount: true,
      campaign: {
        select: {
          status: true,
        },
      },
    },
  });

  let totalIn = 0;
  let heldBalance = 0;
  for (const d of confirmedDonations) {
    const amt = Number(d.amount);
    totalIn += amt;
    if (d.campaign.status === "ACTIVE") {
      heldBalance += amt;
    }
  }

  // 3. Withdrawals: COMPLETED (totalWithdrawn) and PENDING (pendingWithdrawals)
  const userWithdrawals = await prismaTx.withdrawal.findMany({
    where: {
      userId,
      status: { in: ["COMPLETED", "PENDING"] },
    },
    select: {
      amount: true,
      status: true,
    },
  });

  let totalWithdrawn = 0;
  let pendingWithdrawals = 0;
  for (const w of userWithdrawals) {
    const amt = Number(w.amount);
    if (w.status === "COMPLETED") {
      totalWithdrawn += amt;
    } else if (w.status === "PENDING") {
      pendingWithdrawals += amt;
    }
  }

  const walletBalance = Number(wallet.balance);
  const availableBalance = Math.max(0, walletBalance - heldBalance - pendingWithdrawals);

  return {
    wallet: {
      id: wallet.id,
      userId: wallet.userId,
      recipientName: wallet.recipientName,
      balance: walletBalance,
    },
    totalIn,
    heldBalance,
    totalWithdrawn,
    pendingWithdrawals,
    availableBalance,
    donorCount: confirmedDonations.length,
  };
}
