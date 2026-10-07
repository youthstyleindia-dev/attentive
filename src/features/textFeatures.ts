/**
 * Text Feature Normalization & Sanitization
 */

export function sanitizeUrl(rawUrl: string): { sanitized: string; domain: string; pathTokens: string[] } | null {
  try {
    const parsed = new URL(rawUrl);
    // Ignore internal, data, javascript, extension schemas
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    // Remove query, hash, authentication credentials
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
  if (!text) return "";
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\.\-_]/g, " ")
    .trim();
  return cleaned.substring(0, maxLength);
}

export function buildCompositeFeatureText(
  domain: string,
  pathTokens: string[],
  title: string,
  headings: string[] = [],
  metaDescription = "",
  excerpt = ""
): string {
  const parts: string[] = [];
  if (domain) parts.push(domain.replace(/\./g, " "));
  if (pathTokens.length > 0) parts.push(pathTokens.slice(0, 10).join(" "));
  if (title) parts.push(cleanText(title, 200));
  if (metaDescription) parts.push(cleanText(metaDescription, 300));
  if (headings.length > 0) {
    const headingsText = headings.slice(0, 10).map((h) => cleanText(h, 80)).join(" ");
    parts.push(headingsText);
  }
  if (excerpt && parts.join(" ").length < 300) {
    parts.push(cleanText(excerpt, 200));
  }
  return parts.join(" ").toLowerCase().trim();
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
      input.excerpt
    );
    return {
      cleanDomain,
      sanitizedUrl,
      pathTokens,
      compositeText,
    };
  }
}

