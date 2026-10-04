import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "./lib/util/providers/QueryProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";

export const metadata: Metadata = {
  title: {
    template: "%s | Sociarig - AI Content Repurposing",
    default: "Sociarig - Turn One Link Into a Month of Content",
  },
  description:
    "The AI synthesis engine for founders and creators. Repurpose blogs, YouTube videos, and raw ideas into viral Twitter threads, LinkedIn posts, and newsletters instantly.",
  keywords: [
    "AI content repurposing",
    "social media automation",
    "YouTube to Twitter thread",
    "AI writer for founders",
    "LinkedIn post generator",
    "content scaling SaaS",
  ],
  authors: [{ name: "Sociarig" }],
  creator: "Sociarig",
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "Sociarig | AI Content Repurposing Engine",
    description:
      "Repurpose a single link into a month's worth of highly-aligned social content. Scale your brand voice without the manual effort.",
    siteName: "Sociarig",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "Sociarig Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sociarig - AI Content Repurposing Engine",
    description:
      "Turn one link into a month of content. The AI synthesis engine for founders and creators.",
    images: ["/og-image.jpg"],
    creator: "@sociarig", 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <Toaster />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
