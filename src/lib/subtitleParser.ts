import { SubtitleCue } from "@/types/subtitles";

/**
 * Converts timestamp string (e.g., "00:01:20,450" or "00:01:20.450") to seconds
 */
export function timeStringToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace(",", ".");
  const parts = cleaned.split(":");
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  }
  return parseFloat(cleaned) || 0;
}

/**
 * Formats seconds into "HH:MM:SS" or "MM:SS"
 */
export function formatSecondsToTime(seconds: number): string {
  const isNegative = seconds < 0;
  const absSec = Math.abs(seconds);
  const hrs = Math.floor(absSec / 3600);
  const mins = Math.floor((absSec % 3600) / 60);
  const secs = Math.floor(absSec % 60);

  const prefix = isNegative ? "-" : "";
  if (hrs > 0) {
    return `${prefix}${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${prefix}${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Parses raw SRT string into array of SubtitleCues
 */
export function parseSRT(srtContent: string): SubtitleCue[] {
  if (!srtContent) return [];

  // Normalize line endings and strip BOM
  const cleaned = srtContent.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = cleaned.split(/\n\s*\n/);
  const cues: SubtitleCue[] = [];

  let cueId = 1;
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;

    // Check if first line is number or timecode
    let timeIndex = 0;
    if (/^\d+$/.test(lines[0].trim()) && lines.length >= 2) {
      timeIndex = 1;
    }

    const timeLine = lines[timeIndex];
    if (!timeLine || !timeLine.includes("-->")) continue;

    const [startRaw, endRaw] = timeLine.split("-->").map((s) => s.trim());
    const start = timeStringToSeconds(startRaw);
    const end = timeStringToSeconds(endRaw);

    const textLines = lines.slice(timeIndex + 1);
    // Remove HTML formatting tags from text like <i>, <b>, <font ...>
    const text = textLines
      .join("\n")
      .replace(/<[^>]*>/g, "")
      .trim();

    if (text) {
      cues.push({
        id: cueId++,
        start,
        end,
        text,
      });
    }
  }

  return cues;
}

/**
 * Converts SubtitleCue array to standard WebVTT string
 */
export function cuesToVTT(cues: SubtitleCue[]): string {
  let vtt = "WEBVTT\n\n";
  for (const cue of cues) {
    const startStr = formatSecondsToTime(cue.start) + ".000";
    const endStr = formatSecondsToTime(cue.end) + ".000";
    vtt += `${cue.id}\n${startStr} --> ${endStr}\n${cue.text}\n\n`;
  }
  return vtt;
}
