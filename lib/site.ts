/**
 * Central Site URL helper
 * Production domain: https://countercrave.com
 */

export function getSiteUrl(): string {
  const envUrl = process.env.SITE_URL;
  if (!envUrl) {
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:3000";
    }
    // Fallback to official production domain if SITE_URL env var is unset
    return "https://countercrave.com";
  }
  return envUrl.replace(/\/+$/, "");
}

export function absoluteUrl(path = ""): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath === "/" ? "" : cleanPath}`;
}
