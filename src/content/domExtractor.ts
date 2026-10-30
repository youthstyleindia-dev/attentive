/**
 * DOM Feature Extractor — Content Script
 * Extracts structured semantic signals without reading raw HTML into memory.
 * Conforms to SRS Revision 3.1 Section 4.1 & Part A Step 4 of the Preprocessing Spec.
 */

export interface ExtractedPageSignals {
  title: string;
  headings: string[];
  metaDescription: string;
  visibleTextExcerpt: string;
  canonicalUrl?: string;
  language?: string;
  hasAudioPlaying: boolean;
  hasVideoPlaying: boolean;
}

export function extractPageSignals(): ExtractedPageSignals {
  // 1. Title (up to 300 chars)
  const title = (document.title || "").trim().substring(0, 300);

  // 2. Meta description (prefers og:description, falls back to description, max 500 chars)
  let metaDescription = "";
  const metaTag = document.querySelector(
    'meta[property="og:description"], meta[name="description"]',
  );
  if (metaTag) {
    metaDescription = (metaTag.getAttribute("content") || "")
      .trim()
      .substring(0, 500);
  }

  // 3. Headings (H1, H2, H3 up to 20 total, each up to 150 chars)
  const headings: string[] = [];
  const headingElements = document.querySelectorAll("h1, h2, h3");
  for (let i = 0; i < headingElements.length && headings.length < 20; i++) {
    const text = (headingElements[i].textContent || "")
      .trim()
      .replace(/\s+/g, " ");
    if (text.length > 2 && text.length < 150) {
      headings.push(text);
    }
  }

  // 4. Canonical URL
  let canonicalUrl: string | undefined;
  const canonicalTag = document.querySelector('link[rel="canonical"]');
  if (canonicalTag) {
    canonicalUrl = canonicalTag.getAttribute("href") || undefined;
  }

  // 5. Language
  const lang =
    document.documentElement.lang ||
    document
      .querySelector('meta[http-equiv="content-language"]')
      ?.getAttribute("content") ||
    undefined;

  // 6. Media awareness (Section 33 & SRS 4.1 / FR-03)
  let hasAudioPlaying = false;
  let hasVideoPlaying = false;
  const mediaElements = document.querySelectorAll("video, audio");
  for (const media of Array.from(mediaElements) as HTMLMediaElement[]) {
    if (!media.paused && !media.ended && media.currentTime > 0) {
      if (media.tagName.toLowerCase() === "video") hasVideoPlaying = true;
      if (media.tagName.toLowerCase() === "audio" || !media.muted)
        hasAudioPlaying = true;
    }
  }

  // 7. Safe Visible Text Excerpt (Max 2 KB, prioritizing <main>/<article>, excluding forms/inputs/passwords/ads/hidden)
  let visibleTextExcerpt = "";
  try {
    const mainContent =
      document.querySelector("main") ||
      document.querySelector("article") ||
      document.querySelector("#content, .content, #main, .main") ||
      document.body;

    if (mainContent) {
      // Clone and strip sensitive elements
      const clone = mainContent.cloneNode(true) as HTMLElement;
      const elementsToRemove = clone.querySelectorAll(
        "script, style, noscript, iframe, input, textarea, select, button, form, nav, footer, header, " +
          "[role='banner'], [role='navigation'], [role='contentinfo'], [hidden], [aria-hidden='true'], " +
          ".ad, .ads, .advertisement, #cookie-banner, .cookie-banner, .cookie-consent",
      );
      elementsToRemove.forEach((el) => el.remove());

      const rawText = (clone.textContent || "").replace(/\s+/g, " ").trim();
      visibleTextExcerpt = rawText.substring(0, 2048);
    }
  } catch {
    visibleTextExcerpt = "";
  }

  return {
    title,
    headings,
    metaDescription,
    visibleTextExcerpt,
    canonicalUrl,
    language: lang ? lang.substring(0, 10) : undefined,
    hasAudioPlaying,
    hasVideoPlaying,
  };
}
