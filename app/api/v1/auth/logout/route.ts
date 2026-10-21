import { NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth/server";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST() {
  try {
    await revokeCurrentSession();
    return successResponse("Keluar berhasil");
  } catch (err: unknown) {
    console.error("Logout API error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan saat keluar.", 500, "INTERNAL_SERVER_ERROR");
  }
}
