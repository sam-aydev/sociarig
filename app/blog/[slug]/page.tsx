import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";

type PostData = {
  title: string;
  description: string | null;
  imageUrl: string | null;
  publishedAt: string;
  body: any;
};

type Props = {
  params: Promise<{ slug: string }>;
};

// Custom serializer for PortableText custom block types
const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const imageUrl = urlFor(value).url();

      return (
        <figure className="my-8 overflow-hidden rounded-2xl border border-ink/10">
          <div className="relative w-full h-[260px] sm:h-[380px] md:h-[480px]">
            <Image
              src={imageUrl}
              alt={value.alt || "Blog post image"}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-xs text-ink-soft py-2 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    "description": seo.metaDescription,
    "imageUrl": mainImage.asset->url
  }`;

  const post = await client.fetch(query, { slug });
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Sociarig Blog`,
    description: post.description || `Read ${post.title} on the Sociarig blog.`,
    openGraph: {
      title: post.title,
      description:
        post.description || `Read ${post.title} on the Sociarig blog.`,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    "description": seo.metaDescription,
    "imageUrl": mainImage.asset->url,
    "publishedAt": _createdAt,
    body
  }`;

  const post = await client.fetch<PostData>(query, { slug });

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <Nav />

      <main className="flex-1 w-full pt-32 md:pt-40 pb-24">
        <article className="max-w-3xl mx-auto px-6 md:px-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink mb-10 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back to blog
          </Link>

          <header className="mb-12">
            <div className="text-signal font-medium mb-4">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink mb-6">
              {post.title}
            </h1>
            {post.description && (
              <p className="text-lg md:text-xl text-ink-soft leading-relaxed">
                {post.description}
              </p>
            )}
          </header>

          {post.imageUrl && (
            <div className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden mb-16 shadow-lg border border-ink/10">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-lg md:prose-xl max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-signal hover:prose-a:text-green-700 prose-img:rounded-xl">
            {post.body ? (
              <PortableText
                value={post.body}
                components={portableTextComponents}
              />
            ) : (
              <p>No content available.</p>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
