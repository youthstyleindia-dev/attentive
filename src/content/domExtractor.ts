/**
 * DOM Feature Extractor — Content Script
 * Extracts structured semantic signals without reading raw HTML into memory.
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
  // Title
  const title = (document.title || "").trim().substring(0, 300);

  // Meta description
  let metaDescription = "";
  const metaTag = document.querySelector('meta[name="description"], meta[property="og:description"]');
  if (metaTag) {
    metaDescription = (metaTag.getAttribute("content") || "").trim().substring(0, 500);
  }

  // Headings (H1, H2, H3 up to 20 total)
  const headings: string[] = [];
  const headingElements = document.querySelectorAll("h1, h2, h3");
  for (let i = 0; i < headingElements.length && headings.length < 20; i++) {
    const text = (headingElements[i].textContent || "").trim().replace(/\s+/g, " ");
    if (text.length > 2 && text.length < 150) {
      headings.push(text);
    }
  }

  // Canonical URL
  let canonicalUrl: string | undefined;
  const canonicalTag = document.querySelector('link[rel="canonical"]');
  if (canonicalTag) {
    canonicalUrl = canonicalTag.getAttribute("href") || undefined;
  }

  // Language
  const lang = document.documentElement.lang || document.querySelector('meta[http-equiv="content-language"]')?.getAttribute("content") || undefined;

  // Media awareness (Section 33 & SRS 4.1)
  let hasAudioPlaying = false;
  let hasVideoPlaying = false;
  const mediaElements = document.querySelectorAll("video, audio");
  for (const media of Array.from(mediaElements) as HTMLMediaElement[]) {
    if (!media.paused && !media.ended && media.currentTime > 0) {
      if (media.tagName.toLowerCase() === "video") hasVideoPlaying = true;
      if (media.tagName.toLowerCase() === "audio" || !media.muted) hasAudioPlaying = true;
    }
  }

  // Safe Visible Text Excerpt (Max 2 KB, excluding form/input elements)
  let visibleTextExcerpt = "";
  try {
    const mainContent = document.querySelector("main, article, #content, .content") || document.body;
    if (mainContent) {
      // Clone and strip sensitive elements
      const clone = mainContent.cloneNode(true) as HTMLElement;
      const elementsToRemove = clone.querySelectorAll("script, style, noscript, iframe, input, textarea, select, button, form, nav, footer, header");
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
