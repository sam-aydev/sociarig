import { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";

  // Fetch all post slugs and their last modified dates
  const POSTS_QUERY = `*[_type == "post" && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt
  }`;

  // We wrap the fetch in a try-catch to ensure the core sitemap
  // still builds even if the Sanity connection fails during static generation.
  let posts = [];
  try {
    posts = await client.fetch(POSTS_QUERY);
  } catch (error) {
    console.error("Failed to fetch Sanity posts for sitemap:", error);
  }

  // Map Sanity posts to the Next.js sitemap format
  const blogUrls: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Define your core static routes, including the new legal pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(), 
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    },
  ];

  return [...staticUrls, ...blogUrls];
}
