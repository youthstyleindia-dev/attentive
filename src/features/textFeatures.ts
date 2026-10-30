/**
 * Text Feature Normalization & Sanitization
 * Synchronized with docs/architecture/preprocessing-spec.md and model/configs/preprocessing.json
 */

import {
  normalizeText,
  normalizeAndJoinCompositeText,
  scrubUrl,
} from "../intelligence/runtimePipeline";

export { normalizeText, normalizeAndJoinCompositeText };

export function sanitizeUrl(
  rawUrl: string,
): { sanitized: string; domain: string; pathTokens: string[] } | null {
  try {
    const parsed = new URL(rawUrl);
    // Ignore internal, data, javascript, extension schemas
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    parsed.search = "";
    parsed.hash = "";
    parsed.username = "";
    parsed.password = "";

    const sanitized = parsed.toString().replace(/\/$/, "");
    let domain = parsed.hostname.toLowerCase();
    if (domain.startsWith("www.")) {
      domain = domain.substring(4);
    }

    const pathTokens = parsed.pathname
      .toLowerCase()
      .split(/[\/\-_\.]+/)
      .filter((t) => t.length > 1 && !/^\d+$/.test(t));

    return { sanitized, domain, pathTokens };
  } catch {
    return null;
  }
}

export function cleanText(text: string, maxLength = 500): string {
  return normalizeText(text, maxLength);
}

/**
 * Builds composite feature text according to the shared spec:
 * title -> description -> headings -> excerpt
 * Falls back to including domain if title is empty.
 */
export function buildCompositeFeatureText(
  domain: string,
  pathTokens: string[],
  title: string,
  headings: string[] = [],
  metaDescription = "",
  excerpt = "",
): string {
  const composite = normalizeAndJoinCompositeText({
    title,
    description: metaDescription,
    headings,
    mainText: excerpt,
  });

  if (!composite && domain) {
    return normalizeText(
      `${domain.replace(/\./g, " ")} ${pathTokens.slice(0, 10).join(" ")}`,
    );
  }
  return composite;
}

export class TextFeatureExtractor {
  static extract(input: {
    url: string;
    title: string;
    metaDescription?: string;
    headings?: string[];
    excerpt?: string;
  }) {
    const urlInfo = sanitizeUrl(input.url);
    const cleanDomain = urlInfo?.domain || "";
    const sanitizedUrl = urlInfo?.sanitized || input.url;
    const pathTokens = urlInfo?.pathTokens || [];
    const compositeText = buildCompositeFeatureText(
      cleanDomain,
      pathTokens,
      input.title,
      input.headings,
      input.metaDescription,
      input.excerpt,
    );
    return {
      cleanDomain,
      sanitizedUrl,
      pathTokens,
      compositeText,
    };
  }
}
