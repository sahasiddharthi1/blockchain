import type { MetadataRoute } from "next";

// Next.js's file-convention sitemap: this function's return value is
// served at /sitemap.xml automatically, generated at build time (no
// hand-maintained XML file to forget to update when a route is added).
// changeFrequency/priority are hints, not guarantees — search engines
// weight them alongside actual crawl history.
export default function sitemap(): MetadataRoute.Sitemap {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ledgerforge.dev";

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
