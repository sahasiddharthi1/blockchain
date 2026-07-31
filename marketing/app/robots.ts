import type { MetadataRoute } from "next";

// Same file-convention pattern as sitemap.ts — served at /robots.txt.
// Explicitly pointing at the sitemap here (rather than relying on
// crawlers to guess /sitemap.xml) is a small, easy-to-forget SEO detail
// that matters for how quickly a new site gets indexed.
export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ledgerforge.dev";

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
