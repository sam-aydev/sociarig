import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/api/", "/_next/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
