import type { MetadataRoute } from "next";

// Adult catalog — keep it out of search engine indexes.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
