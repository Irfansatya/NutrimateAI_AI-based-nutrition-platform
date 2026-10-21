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
 * Call OpenAI-compatible 9Router API and return structured plan output.
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000); // 60s hard timeout

  let response: Response;
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
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("GEMINI_TIMEOUT");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // Log status only — no API key echoed
    console.error(`AI Router error: HTTP ${response.status}`);
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
