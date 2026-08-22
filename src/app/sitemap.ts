import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/public/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  if (!siteUrl) return [];

  return [
    {
      url: new URL("/menu", siteUrl).toString(),
    },
  ];
}
