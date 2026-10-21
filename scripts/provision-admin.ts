import path from "path";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

// Ensure .env is explicitly loaded from project root (Node.js 20+ built-in)
try {
  process.loadEnvFile(path.resolve(process.cwd(), ".env"));
} catch {
  // If .env is missing or already loaded in the environment, continue safely
}

const prisma = new PrismaClient();

async function main() {
  const emailRaw = process.env.INITIAL_ADMIN_EMAIL;
  const passwordRaw = process.env.INITIAL_ADMIN_PASSWORD;
  const nameRaw = process.env.INITIAL_ADMIN_NAME || "NutriMate Administrator";

  if (!emailRaw || !passwordRaw) {
    console.error(
      "[ADMIN_PROVISION_ERROR] INITIAL_ADMIN_EMAIL dan INITIAL_ADMIN_PASSWORD wajib disetel di environment variables."
    );
    process.exit(1);
  }

  const cleanEmail = emailRaw.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    console.error(
      "[ADMIN_PROVISION_ERROR] Format INITIAL_ADMIN_EMAIL tidak valid."
    );
    process.exit(1);
  }

  if (passwordRaw.length < 8) {
    console.error(
      "[ADMIN_PROVISION_ERROR] INITIAL_ADMIN_PASSWORD minimal 8 karakter."
    );
    process.exit(1);
  }

  if (passwordRaw.length > 128) {
    console.error(
      "[ADMIN_PROVISION_ERROR] INITIAL_ADMIN_PASSWORD maksimal 128 karakter."
    );
    process.exit(1);
  }

  // Check if account already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existingUser) {
    if (existingUser.role === "ADMIN") {
      console.log(
        `[ADMIN_PROVISION_OK] Akun admin dengan email target sudah ada. Tidak ada perubahan yang dilakukan.`
      );
      return;
    } else {
      console.error(
        `[ADMIN_PROVISION_BLOCKED] Email target sudah terdaftar sebagai pengguna non-admin (${existingUser.role}). Operasi dihentikan tanpa mengubah role atau akun.`
      );
      process.exit(1);
    }
  }

  // Hash password using exact same scrypt implementation
  const passwordHash = await hashPassword(passwordRaw);

  const newAdmin = await prisma.user.create({
    data: {
      name: nameRaw.trim(),
      email: cleanEmail,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  console.log(
    `[ADMIN_PROVISION_SUCCESS] Akun admin berhasil dibuat dengan ID: ${newAdmin.id}`
  );
}

main()
  .catch((err) => {
    console.error(
      "[ADMIN_PROVISION_EXCEPTION]",
      err instanceof Error ? err.message : "Terjadi kesalahan internal"
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
