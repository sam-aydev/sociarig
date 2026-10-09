import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/sanity/lib/client"; // Adjust path to your Sanity client
import Nav from "@/components/landing/Nav"; // Adjust path
import Footer from "@/components/landing/Footer"; // Adjust path

export const metadata: Metadata = {
  title: "Blog | Sociarig Engine",
  description:
    "Insights on AI content syndication, omnipresence strategies, and product updates.",
  openGraph: {
    title: "Blog | Sociarig Engine",
    description:
      "Insights on AI content syndication, omnipresence strategies, and product updates.",
  },
};

type Post = {
  _id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  publishedAt: string;
};

const POSTS_QUERY = `*[_type == "post"] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  "imageUrl": mainImage.asset->url,
  "description": seo.metaDescription,
  "publishedAt": _createdAt
}`;

export default async function BlogIndex() {
  const posts = await client?.fetch<Post[]>(POSTS_QUERY);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col relative overflow-hidden">
      <Nav />

      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-125 bg-[radial-gradient(ellipse_at_top,_var(--color-signal)_0%,_transparent_50%)] opacity-[0.08] pointer-events-none" />

      <main className="flex-1 max-w-[var(--container-content,1200px)] mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-24 relative z-10 w-full">
        {/* Page Header */}
        <div className="max-w-2xl mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4 text-ink">
            The{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-tr from-green-700 to-signal">
              Sociarig
            </span>{" "}
            Blog
          </h1>
          <p className="text-lg text-ink-soft leading-relaxed">
            Strategies, technical updates, and guides on automating your content
            pipeline and dominating social channels.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group block h-full"
            >
              <article className="flex flex-col h-full rounded-2xl border border-ink/10 bg-white/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-ink/20 hover:-translate-y-1">
                {/* Image Container with Zoom effect */}
                <div className="relative w-full h-56 overflow-hidden bg-ink/5">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-ink-faint">Sociarig</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs font-medium text-signal mb-3 uppercase tracking-wider">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <h2 className="text-xl font-bold text-ink mb-3 line-clamp-2 group-hover:text-green-700 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-ink-soft line-clamp-3 mb-6 flex-1">
                    {post.description ||
                      "Read this article to learn more about our latest updates and strategies."}
                  </p>

                  <div className="mt-auto flex items-center gap-2 text-sm font-medium text-ink transition-colors group-hover:text-green-700">
                    Read article
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
