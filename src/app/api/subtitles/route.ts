import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { parseSRT } from "@/lib/subtitleParser";

const SUBDL_API_KEY =
  process.env.SUBDL_API_KEY || "subdl_-_WTN_WEKOok8UTOeT_mbELKJ71AfT3pSO8asLolel8";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imdbId = searchParams.get("imdb_id");
  const type = searchParams.get("type") || "movie"; // "movie" or "tv"
  const seasonNumber = searchParams.get("season_number");
  const episodeNumber = searchParams.get("episode_number");
  const languages = searchParams.get("languages") || "si,en";
  const action = searchParams.get("action") || "auto"; // "auto", "search", "download_cues"
  const targetUrl = searchParams.get("url");

  // Handler for direct zip download and extraction to cues
  if (action === "download_cues" && targetUrl) {
    try {
      const fullDownloadUrl = targetUrl.startsWith("http")
        ? targetUrl
        : `https://dl.subdl.com${targetUrl}`;

      const res = await fetch(fullDownloadUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to download subtitle zip: ${res.status}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Find all srt or vtt files in the zip
      let chosenSrtContent = "";
      let chosenFileName = "";

      for (const [filename, file] of Object.entries(zip.files)) {
        if (!file.dir && (filename.endsWith(".srt") || filename.endsWith(".vtt"))) {
          chosenFileName = filename;
          chosenSrtContent = await file.async("text");
          break; // Take the first matching subtitle
        }
      }

      if (!chosenSrtContent) {
        return NextResponse.json(
          { error: "No .srt or .vtt file found inside zip" },
          { status: 404 }
        );
      }

      const cues = parseSRT(chosenSrtContent);
      return NextResponse.json({
        success: true,
        filename: chosenFileName,
        cues,
      });
    } catch (err: any) {
      console.error("SubDL extraction error:", err);
      return NextResponse.json(
        { error: err.message || "Failed to extract subtitle" },
        { status: 500 }
      );
    }
  }

  // Search subtitles on SubDL API
  if (!imdbId) {
    return NextResponse.json(
      { error: "imdb_id parameter is required" },
      { status: 400 }
    );
  }

  try {
    const subdlUrl = new URL("https://api.subdl.com/api/v1/subtitles");
    subdlUrl.searchParams.set("api_key", SUBDL_API_KEY);
    subdlUrl.searchParams.set("imdb_id", imdbId);
    subdlUrl.searchParams.set("type", type);
    subdlUrl.searchParams.set("languages", languages);

    if (seasonNumber) subdlUrl.searchParams.set("season_number", seasonNumber);
    if (episodeNumber) subdlUrl.searchParams.set("episode_number", episodeNumber);

    const subdlRes = await fetch(subdlUrl.toString(), {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!subdlRes.ok) {
      console.warn(`SubDL responded with status: ${subdlRes.status}`);
      return NextResponse.json({
        success: false,
        subtitles: [],
        message: "No subtitles found or SubDL rate limited",
      });
    }

    const subdlData = await subdlRes.json();
    const subtitles = subdlData.subtitles || subdlData.results || [];

    // Filter into Sinhala and English lists
    const sinhalaSubs = subtitles.filter(
      (s: any) =>
        s.lang?.toLowerCase().includes("si") ||
        s.language?.toLowerCase().includes("sinhala") ||
        s.lang?.toLowerCase().includes("sinhala")
    );

    const englishSubs = subtitles.filter(
      (s: any) =>
        s.lang?.toLowerCase().includes("en") ||
        s.language?.toLowerCase().includes("english")
    );

    // If action is "auto", automatically fetch the first Sinhala sub and first English sub cues
    let autoSinhala = null;
    let autoEnglish = null;

    if (action === "auto") {
      if (sinhalaSubs.length > 0 && sinhalaSubs[0].url) {
        try {
          const zipUrl = sinhalaSubs[0].url.startsWith("http")
            ? sinhalaSubs[0].url
            : `https://dl.subdl.com${sinhalaSubs[0].url}`;
          const zRes = await fetch(zipUrl);
          if (zRes.ok) {
            const buf = await zRes.arrayBuffer();
            const zip = await JSZip.loadAsync(buf);
            for (const [filename, file] of Object.entries(zip.files)) {
              if (!file.dir && filename.endsWith(".srt")) {
                const text = await file.async("text");
                autoSinhala = {
                  name: sinhalaSubs[0].release_name || filename,
                  language: "si",
                  cues: parseSRT(text),
                };
                break;
              }
            }
          }
        } catch (e) {
          console.warn("Failed auto extraction of Sinhala sub:", e);
        }
      }

      if (englishSubs.length > 0 && englishSubs[0].url) {
        try {
          const zipUrl = englishSubs[0].url.startsWith("http")
            ? englishSubs[0].url
            : `https://dl.subdl.com${englishSubs[0].url}`;
          const zRes = await fetch(zipUrl);
          if (zRes.ok) {
            const buf = await zRes.arrayBuffer();
            const zip = await JSZip.loadAsync(buf);
            for (const [filename, file] of Object.entries(zip.files)) {
              if (!file.dir && filename.endsWith(".srt")) {
                const text = await file.async("text");
                autoEnglish = {
                  name: englishSubs[0].release_name || filename,
                  language: "en",
                  cues: parseSRT(text),
                };
                break;
              }
            }
          }
        } catch (e) {
          console.warn("Failed auto extraction of English sub:", e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: subtitles.length,
      subtitles: subtitles.map((s: any) => ({
        release_name: s.release_name || s.name || "Subtitle Track",
        name: s.name || s.release_name,
        language: s.lang || s.language,
        author: s.author,
        url: s.url,
        full_url: s.url?.startsWith("http") ? s.url : `https://dl.subdl.com${s.url}`,
        hi: !!s.hi,
      })),
      sinhalaCount: sinhalaSubs.length,
      englishCount: englishSubs.length,
      autoSinhala,
      autoEnglish,
    });
  } catch (err: any) {
    console.error("Subtitles API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch subtitles from SubDL" },
      { status: 500 }
    );
  }
}
