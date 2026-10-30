/**
 * Atentiv Audio Classification & Distraction Scoring Subsystem
 * Identifies audio streaming platforms, runs fastText ML inference on media context,
 * and computes quantitative distraction/focus scores.
 */
import { Classifier } from "./classifier";
import type { ProductivityType } from "../db/schemas";

export type AudioPlatform =
  | "YouTube"
  | "YouTube Music"
  | "Spotify"
  | "SoundCloud"
  | "Apple Music"
  | "Apple Podcasts"
  | "Twitch"
  | "Netflix"
  | "Bandcamp"
  | "Deezer"
  | "Mixcloud"
  | "Audible"
  | "BBC Sounds"
  | "Amazon Music"
  | "Pandora"
  | "Voice / Meeting"
  | "Web Audio Stream";

export interface AudioClassificationResult {
  platform: AudioPlatform;
  category: string;
  confidence: number;
  distractionScore: number; // 0 (focus-enhancing) to 100 (highly distracting)
  isDistracting: boolean; // true if distractionScore >= 60
  distractionLevel: "low" | "moderate" | "high";
  distractionReason: string;
  productivityType: ProductivityType;
  activity: string;
  modelVersion: string;
  timestamp: number;
}

export class AudioClassifier {
  /**
   * Detects the audio streaming or media platform from the URL and title.
   */
  static detectPlatform(url: string, title = ""): AudioPlatform {
    const raw = (url + " " + title).toLowerCase();

    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

      if (host === "music.youtube.com") return "YouTube Music";
      if (host === "youtube.com" || host === "youtu.be") return "YouTube";
      if (host === "open.spotify.com" || host === "spotify.com")
        return "Spotify";
      if (host === "soundcloud.com") return "SoundCloud";
      if (host === "music.apple.com") return "Apple Music";
      if (host === "podcasts.apple.com") return "Apple Podcasts";
      if (host === "twitch.tv") return "Twitch";
      if (host === "netflix.com") return "Netflix";
      if (host.includes("bandcamp.com")) return "Bandcamp";
      if (host.includes("deezer.com")) return "Deezer";
      if (host.includes("mixcloud.com")) return "Mixcloud";
      if (host.includes("audible.com")) return "Audible";
      if (host.includes("bbc.co.uk") && parsed.pathname.includes("sounds"))
        return "BBC Sounds";
      if (host === "music.amazon.com") return "Amazon Music";
      if (host.includes("pandora.com")) return "Pandora";
      if (
        host === "meet.google.com" ||
        host.includes("zoom.us") ||
        host.includes("teams.microsoft.com") ||
        host === "discord.com"
      ) {
        return "Voice / Meeting";
      }
    } catch {
      // Fallback to substring matching if URL parsing fails
    }

    if (raw.includes("spotify")) return "Spotify";
    if (raw.includes("youtube") || raw.includes("youtu.be")) return "YouTube";
    if (raw.includes("soundcloud")) return "SoundCloud";
    if (raw.includes("twitch")) return "Twitch";
    if (raw.includes("netflix")) return "Netflix";
    if (raw.includes("podcast")) return "Apple Podcasts";
    if (raw.includes("audible")) return "Audible";

    return "Web Audio Stream";
  }

  /**
   * Classifies an audible tab using fastText ML and computes the distraction score.
   */
  static async classifyAudio(
    url: string,
    title = "",
    metaDescription = "",
  ): Promise<AudioClassificationResult> {
    const platform = this.detectPlatform(url, title);
    const cleanTitle = (title || "").trim();

    // 1. Run inference through the fastText model via the unified classifier
    const syntheticTitle = `[${platform} Audio] ${cleanTitle}`;
    const classification = await Classifier.classify({
      url,
      title: syntheticTitle,
      metaDescription,
    });

    const category = classification.category || "Uncategorized";
    const confidence = classification.confidence || 0.7;
    const modelVersion = classification.modelVersion || "fastText-1.0";

    // 2. Compute Distraction Score (0 - 100)
    const { score, level, isDistracting, reason, productivity } =
      this.computeDistractionScore(platform, category, cleanTitle, confidence);

    return {
      platform,
      category,
      confidence,
      distractionScore: score,
      isDistracting,
      distractionLevel: level,
      distractionReason: reason,
      productivityType: productivity,
      activity: classification.activity || `Audio: ${platform}`,
      modelVersion,
      timestamp: Date.now(),
    };
  }

  /**
   * Computes quantitative distraction score based on FastText category + acoustic/semantic modifiers.
   */
  static computeDistractionScore(
    platform: AudioPlatform,
    category: string,
    title: string,
    confidence: number,
  ): {
    score: number;
    level: "low" | "moderate" | "high";
    isDistracting: boolean;
    reason: string;
    productivity: ProductivityType;
  } {
    const t = title.toLowerCase();

    // Base distraction score based on FastText ML classification category
    let baseScore = 50; // default neutral
    switch (category) {
      case "Education":
        baseScore = 15;
        break;
      case "Technology":
      case "Research":
      case "Work":
        baseScore = 20;
        break;
      case "Communication":
        baseScore = 35;
        break;
      case "Travel":
      case "Government":
      case "Health":
        baseScore = 45;
        break;
      case "News":
        baseScore = 60;
        break;
      case "Chat":
      case "Shop":
        baseScore = 75;
        break;
      case "Entertainment":
        baseScore = 85;
        break;
      default:
        baseScore = 50;
        break;
    }

    // Acoustic / Semantic modifiers:
    let modifier = 0;
    const reasons: string[] = [];

    // 1. Focus Aids (Instrumental, Ambient, Lo-Fi, Classical, Study, Binaural)
    const focusPattern =
      /\b(lo-?fi|lofi|ambient|instrumental|classical|binaural|white\s*noise|pink\s*noise|nature|rain|synthwave|meditation|chillhop|piano|sleep|study\s*(beats|music)?|deep\s*focus|concentration|soundtrack|bgm)\b/i;
    if (focusPattern.test(t)) {
      modifier -= 35;
      reasons.push(
        "Acoustic profile indicates ambient/instrumental focus aid (-35)",
      );
    }

    // 2. Educational & Informational Modifiers (Lecture, Tutorial, Course, Keynote)
    const lecturePattern =
      /\b(lecture|tutorial|course|seminar|keynote|conference|audiobook|lesson|documentary|deep\s*dive|explanation|walkthrough)\b/i;
    if (lecturePattern.test(t)) {
      modifier -= 25;
      reasons.push("Spoken content is educational/instructional (-25)");
    }

    // 3. High Distraction Modifiers (Gaming, Reactions, Sitcom, Comedy, Entertainment, Music Video)
    const distractionPattern =
      /\b(gameplay|gaming|let'?s\s*play|reaction|reacting|comedy|stand-?up|prank|meme|drama|anime|sitcom|trailer|streamer|esports|speedrun|music\s*video|official\s*(video|mv))\b/i;
    if (distractionPattern.test(t)) {
      modifier += 25;
      reasons.push("Visual/entertainment media with high cognitive draw (+25)");
    }

    // Platform-specific defaults
    if (platform === "Voice / Meeting") {
      baseScore = 25;
      reasons.push("Live communication/meeting channel");
    } else if (platform === "Netflix" || platform === "Twitch") {
      modifier += 15;
      reasons.push(`${platform} streaming video platform (+15)`);
    } else if (platform === "Audible" || platform === "Apple Podcasts") {
      modifier -= 10;
      reasons.push("Spoken audio / podcast platform (-10)");
    }

    const finalScore = Math.max(
      0,
      Math.min(100, Math.round(baseScore + modifier)),
    );

    const isDistracting = finalScore >= 60;
    const level: "low" | "moderate" | "high" =
      finalScore < 40 ? "low" : finalScore < 65 ? "moderate" : "high";

    const productivity: ProductivityType =
      finalScore < 40
        ? "productive"
        : finalScore < 65
          ? "neutral"
          : "distracting";

    const reasonSummary = `[${platform} · ML: ${category} (${(confidence * 100).toFixed(0)}%)] ${
      reasons.length > 0 ? reasons.join("; ") : `Base ${category} audio profile`
    } → Score: ${finalScore}/100 (${isDistracting ? "Distracting" : "Focus-friendly"})`;

    return {
      score: finalScore,
      level,
      isDistracting,
      reason: reasonSummary,
      productivity,
    };
  }
}
