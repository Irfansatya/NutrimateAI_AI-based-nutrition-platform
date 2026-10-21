import { getCurrentUser } from "@/lib/auth/server";
import { errorResponse, successResponse } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }

    return successResponse("Sesi pengguna valid", { user });
  } catch (err: unknown) {
    console.error("Me API error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}
