/**
 * Root layout for AI Content OS.
 * Provides metadata, global styles, and font configuration.
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Content OS | AI-Powered Content Creation Platform",
    template: "%s | AI Content OS",
  },
  description:
    "Control your entire AI content pipeline through Telegram. Create, edit, schedule, and publish AI-generated content across multiple social media platforms.",
  keywords: [
    "AI content",
    "content creation",
    "social media",
    "telegram bot",
    "AI writing",
    "content automation",
    "OpenRouter",
    "Gemini",
  ],
  authors: [{ name: "AI Content OS" }],
  creator: "AI Content OS",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AI Content OS",
    title: "AI Content OS | AI-Powered Content Creation",
    description:
      "Control your entire AI content pipeline through Telegram. Create, edit, schedule, and publish content across social media.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Content OS",
    description:
      "Control your AI content pipeline through Telegram.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a1a" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
