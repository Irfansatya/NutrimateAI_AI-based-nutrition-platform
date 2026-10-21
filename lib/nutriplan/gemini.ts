import "server-only";

/**
 * AI service for NutriPlan generation via OpenAI-compatible 9Router API.
 * Reads NUTRIPLAN_API_BASE_URL, NUTRIPLAN_API_KEY, and NUTRIPLAN_MODEL.
 * Falls back to GEMINI_API_KEY / GEMINI_MODEL if NUTRIPLAN_* variables are not set.
 * Never logs secrets or unnecessary personal health identifiers.
 */

const DEFAULT_BASE_URL = "http://localhost:20128/v1";
const DEFAULT_MODEL = "lomba";

/** One item selected by AI for a single meal slot */
export interface GeminiMealSlot {
  time: string;   // e.g. "06:30"
  itemIds: string[];  // 1-3 catalogue item IDs
}

/** One day returned by AI */
export interface GeminiDay {
  dayIndex: number;      // 1-30
  dailyTips: string;
  meals: GeminiMealSlot[];
}

/** Full structured AI plan output */
export interface GeminiPlanOutput {
  days: GeminiDay[];
}

export interface GeminiGenerateOptions {
  /** PREGNANCY | BREASTFEEDING | CHILD */
  category: string;
  /** Allowed catalogue item IDs (after allergen/category filtering) */
  allowedItemIds: string[];
  /** Hard daily budget ceiling in IDR */
  dailyBudgetIDR: number;
  /** Meal slot times with labels, e.g. [{ time: "06:30", label: "Sarapan" }] */
  mealSlots: { time: string; label: string }[];
  /** Category-specific nutritional context — no PII */
  nutritionContext: string;
  /** Number of days to generate (always 30) */
  totalDays: number;
}

function getApiKey(): string {
  const key = process.env.NUTRIPLAN_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY environment variable is not set.");
  return key;
}

function getBaseUrl(): string {
  const raw = process.env.NUTRIPLAN_API_BASE_URL || DEFAULT_BASE_URL;
  return raw.replace(/\/+$/, "");
}

function getModelName(): string {
  return process.env.NUTRIPLAN_MODEL || process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

function buildPrompt(opts: GeminiGenerateOptions): string {
  const categoryLabel =
    opts.category === "PREGNANCY"
      ? "ibu hamil"
      : opts.category === "BREASTFEEDING"
      ? "ibu menyusui"
      : "anak usia 6-24 bulan (MPASI)";

  const slotList = opts.mealSlots.map((s) => `- ${s.time} (${s.label})`).join("\n");
  const idList = opts.allowedItemIds.join(", ");

  return `Anda adalah ahli gizi yang membantu membuat rencana makan harian selama ${opts.totalDays} hari untuk ${categoryLabel}.

**Konteks gizi pengguna:**
${opts.nutritionContext}

**Budget harian maksimal (hard ceiling):** Rp ${opts.dailyBudgetIDR.toLocaleString("id-ID")} per hari.

**Slot makan yang tersedia (harus diisi semua, setiap hari):**
${slotList}

**Daftar ID bahan makanan yang diizinkan:**
${idList}

**Tugas Anda:**
Buat rencana makan untuk ${opts.totalDays} hari. Setiap hari harus memiliki semua ${opts.mealSlots.length} slot makan terisi.
Setiap slot makan pilih 1 hingga 3 bahan dari daftar ID yang diizinkan di atas.
Variasikan pilihan bahan antar hari agar tidak monoton.
Berikan tips gizi harian yang singkat dan spesifik untuk kondisi pengguna (1-2 kalimat, bahasa Indonesia, tidak perlu menyebut nama bahan makanan spesifik).

**FORMAT OUTPUT (JSON murni, tanpa markdown, tanpa komentar, tanpa teks di luar JSON):**
Kembalikan hanya JSON dengan struktur berikut:
{
  "days": [
    {
      "dayIndex": 1,
      "dailyTips": "...",
      "meals": [
        {
          "time": "06:30",
          "itemIds": ["id_bahan1", "id_bahan2"]
        }
      ]
    }
  ]
}

Pastikan:
- Semua ID dalam "itemIds" adalah ID yang ada di daftar yang diizinkan.
- Array "days" memiliki tepat ${opts.totalDays} elemen.
- Setiap elemen "meals" memiliki tepat ${opts.mealSlots.length} slot.
- Output adalah JSON valid yang dapat di-parse langsung tanpa preprocessing.`;
}

/**
 * Error thrown when the 9Router / AI service is unreachable or connection is refused.
 */
export class RouterUnavailableError extends Error {
  constructor(message = "ROUTER_UNAVAILABLE") {
    super(message);
    this.name = "RouterUnavailableError";
  }
}

/**
 * Call OpenAI-compatible 9Router API and return structured plan output.
 * Retries transient connection/network errors and 5xx statuses up to 2 times
 * with short exponential backoff (1s, 2s) within an overall bounded budget.
 * Throws on API error, timeout, or JSON parse failure.
 */
export async function callGemini(opts: GeminiGenerateOptions): Promise<GeminiPlanOutput> {
  const apiKey = getApiKey();
  const baseUrl = getBaseUrl();
  const model = getModelName();
  const prompt = buildPrompt(opts);

  const requestBody = {
    model,
    messages: [
      {
        role: "system",
        content: "Anda adalah sistem API yang HANYA merespons dengan JSON murni tanpa markdown fence atau teks penjelasan tambahan.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    stream: false,
  };

  const MAX_ATTEMPTS = 3; // 1 initial + 2 retries
  const OVERALL_TIMEOUT_MS = 60_000;
  const overallStart = Date.now();

  let response: Response | null = null;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const elapsed = Date.now() - overallStart;
    const remainingBudget = OVERALL_TIMEOUT_MS - elapsed;

    if (remainingBudget <= 2_000) {
      throw new Error("GEMINI_TIMEOUT");
    }

    // Allocate per-attempt timeout bounded by remaining budget, max 45s per attempt
    const attemptTimeoutMs = Math.min(45_000, remainingBudget);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), attemptTimeoutMs);

    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      lastError = null;
    } catch (err: unknown) {
      lastError = err;
      response = null;

      if (err instanceof Error && err.name === "AbortError") {
        // If overall budget is expired, treat as genuine timeout
        if (Date.now() - overallStart >= OVERALL_TIMEOUT_MS - 2_000) {
          throw new Error("GEMINI_TIMEOUT");
        }
      }
    } finally {
      clearTimeout(timer);
    }

    // Evaluate response or connection error
    if (response) {
      if (response.ok) {
        break; // Success, proceed to body parsing
      }

      const status = response.status;
      // Do NOT retry client errors (400, 401, 403, 404, 422, etc.)
      if (status < 500) {
        console.error(`AI Router client error: HTTP ${status}`);
        throw new Error(`GEMINI_API_ERROR:${status}`);
      }

      // 5xx (502, 503, 504, etc.) are eligible for retry
      lastError = new Error(`HTTP_${status}`);
    }

    // If we reach here, attempt failed. Decide if we can retry.
    if (attempt < MAX_ATTEMPTS) {
      const backoffMs = attempt === 1 ? 1_000 : 2_000;
      const willExceed = Date.now() - overallStart + backoffMs >= OVERALL_TIMEOUT_MS - 2_000;
      if (willExceed) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  // If after attempts we don't have a successful response:
  if (!response || !response.ok) {
    if (lastError instanceof Error && lastError.name === "AbortError") {
      throw new Error("GEMINI_TIMEOUT");
    }

    if (!response) {
      // Network/connection failure (ECONNREFUSED, fetch failed, DNS failure, etc.)
      console.error("AI Router connection failure after retries:", lastError instanceof Error ? lastError.message : "Unreachable");
      throw new RouterUnavailableError();
    }

    console.error(`AI Router error after retries: HTTP ${response.status}`);
    if ([502, 503, 504].includes(response.status)) {
      throw new RouterUnavailableError();
    }
    throw new Error(`GEMINI_API_ERROR:${response.status}`);
  }

  const raw = await response.json();

  // Extract content from OpenAI-compatible completion format
  const choice = raw?.choices?.[0];
  const messageContent = choice?.message?.content;

  if (!messageContent || typeof messageContent !== "string") {
    const finishReason = choice?.finish_reason;
    throw new Error(`GEMINI_EMPTY_RESPONSE:${finishReason ?? "unknown"}`);
  }

  // Parse JSON — strip potential markdown code fences defensively
  let parsed: unknown;
  try {
    const cleaned = messageContent.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("GEMINI_INVALID_JSON");
  }

  const output = parsed as GeminiPlanOutput;

  if (!Array.isArray(output?.days)) {
    throw new Error("GEMINI_INVALID_STRUCTURE:missing_days");
  }

  return output;
}
