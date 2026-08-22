import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/menu"],
      disallow: ["/admin", "/admin/", "/api", "/api/"],
    },
  };
}
