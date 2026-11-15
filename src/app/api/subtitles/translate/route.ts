import { NextRequest, NextResponse } from "next/server";
import { SubtitleCue } from "@/types/subtitles";

// Helper to translate a chunk of lines via Google Translate free API
async function translateChunk(
  texts: string[],
  targetLang: string,
  sourceLang: string = "auto"
): Promise<string[]> {
  try {
    const DELIMITER = "\n__DELIM__\n";
    // Replace newlines within cue texts to avoid breaking the delimiter
    const sanitizedTexts = texts.map((t) => t.replace(/[\r\n]+/g, " ").trim());
    const joined = sanitizedTexts.join(DELIMITER);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      sourceLang
    )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(joined)}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.warn("Translation API status not OK:", res.status);
      return texts; // fallback to original texts
    }

    const data = await res.json();
    if (!data || !Array.isArray(data[0])) {
      return texts;
    }

    const translatedFull = data[0].map((item: any) => item[0]).join("");
    const splitResults = translatedFull.split(/__DELIM__/i).map((s: string) => s.trim());

    // If counts match closely, return translated
    if (splitResults.length === texts.length) {
      return splitResults;
    }

    // In case delimiter was slightly altered, best effort alignment
    return texts.map((original, i) => splitResults[i] || original);
  } catch (err) {
    console.error("translateChunk error:", err);
    return texts;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cues, targetLang = "si", sourceLang = "auto" } = body;

    if (!cues || !Array.isArray(cues) || cues.length === 0) {
      return NextResponse.json(
        { error: "No cues provided for translation" },
        { status: 400 }
      );
    }

    const CHUNK_SIZE = 40; // 40 cues per request
    const chunks: SubtitleCue[][] = [];
    for (let i = 0; i < cues.length; i += CHUNK_SIZE) {
      chunks.push(cues.slice(i, i + CHUNK_SIZE));
    }

    const CONCURRENCY = 5; // 5 parallel chunks at a time
    const translatedCues: SubtitleCue[] = [];

    for (let i = 0; i < chunks.length; i += CONCURRENCY) {
      const batch = chunks.slice(i, i + CONCURRENCY);
      const batchPromises = batch.map(async (chunk) => {
        const originalTexts = chunk.map((c) => c.text);
        const translatedTexts = await translateChunk(
          originalTexts,
          targetLang,
          sourceLang
        );

        return chunk.map((c, idx) => ({
          id: c.id,
          start: c.start,
          end: c.end,
          text: translatedTexts[idx] || c.text,
        }));
      });

      const results = await Promise.all(batchPromises);
      for (const res of results) {
        translatedCues.push(...res);
      }
    }

    return NextResponse.json({
      success: true,
      targetLang,
      cues: translatedCues,
      count: translatedCues.length,
    });
  } catch (error: any) {
    console.error("Translation route failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to translate subtitles" },
      { status: 500 }
    );
  }
}
