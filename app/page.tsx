/**
 * Landing page for AI Content OS.
 * Modern, clean design showcasing the platform's capabilities.
 */

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              A
            </div>
            <span className="text-lg font-semibold tracking-tight">
              AI Content <span className="text-primary">OS</span>
            </span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#commands"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Commands
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="https://t.me/your_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              Open in Telegram
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                🚀 Version 1.0 — Now Available
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Your AI Content
                <br />
                <span className="text-primary">Operating System</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Control your entire AI content pipeline through Telegram.
                Create, edit, schedule, and publish AI-generated content across
                multiple social media platforms — all from one chat interface.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="https://t.me/your_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-95 sm:w-auto"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.127.087.497.084.857-.015.727-.384 5.138-.543 6.832-.07.76-.212 1.026-.35 1.052-.291.058-.622-.197-.97-.47-.408-.32-1.356-.922-2.158-1.489-.26-.185-.64-.653-.216-1.144.384-.445 1.167-1.1 1.893-1.648.201-.152.271-.238.014-.538a384.94 384.94 0 0 0-2.317-2.395.394.394 0 0 0-.409-.128.455.455 0 0 0-.24.196c-.22.398-.936 1.378-1.082 1.596-.069.103-.206.197-.387.133-.214-.077-.64-.218-.956-.36-.416-.178-.76-.276-.706-.53.027-.146.207-.297.517-.454.977-.53 5.573-2.26 6.676-2.597z" />
                  </svg>
                  Try the Bot
                </Link>
                <Link
                  href="#commands"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-background px-8 text-sm font-medium transition-all hover:bg-muted active:scale-95 sm:w-auto"
                >
                  View Commands
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b border-border/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { label: "Commands", value: "10+" },
                { label: "Platforms", value: "7" },
                { label: "AI Models", value: "8+" },
                { label: "Languages", value: "50+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold tracking-tight text-primary">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-b border-border/40 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Everything you need to create content
              </h2>
              <p className="mt-4 text-muted-foreground">
                From scripts to captions, hashtags to carousels — generate
                everything through a single Telegram chat.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commands Section */}
        <section id="commands" className="border-b border-border/40 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Command reference
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every command is a content superpower. Type them directly in
                Telegram.
              </p>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {commands.map((cmd) => (
                <div
                  key={cmd.name}
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-card p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm">
                    {cmd.icon}
                  </span>
                  <div className="min-w-0">
                    <code className="text-sm font-medium">/{cmd.name}</code>
                    <p className="truncate text-xs text-muted-foreground">
                      {cmd.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-b border-border/40 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                How it works
              </h2>
              <p className="mt-4 text-muted-foreground">
                Three simple steps to AI-powered content creation.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Open Telegram",
                  description: "Start a chat with the AI Content OS bot and type /start to begin.",
                },
                {
                  step: "02",
                  title: "Send a command",
                  description: "Use structured commands like /script or /caption with your topic and preferences.",
                },
                {
                  step: "03",
                  title: "Publish & schedule",
                  description: "Review the AI-generated content, then publish or schedule it across your platforms.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {item.step}
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to streamline your content workflow?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start creating AI-powered content in seconds. No signup required
                — just open Telegram and start chatting.
              </p>
              <div className="mt-8">
                <Link
                  href="https://t.me/your_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-95"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.127.087.497.084.857-.015.727-.384 5.138-.543 6.832-.07.76-.212 1.026-.35 1.052-.291.058-.622-.197-.97-.47-.408-.32-1.356-.922-2.158-1.489-.26-.185-.64-.653-.216-1.144.384-.445 1.167-1.1 1.893-1.648.201-.152.271-.238.014-.538a384.94 384.94 0 0 0-2.317-2.395.394.394 0 0 0-.409-.128.455.455 0 0 0-.24.196c-.22.398-.936 1.378-1.082 1.596-.069.103-.206.197-.387.133-.214-.077-.64-.218-.956-.36-.416-.178-.76-.276-.706-.53.027-.146.207-.297.517-.454.977-.53 5.573-2.26 6.676-2.597z" />
                  </svg>
                  Start on Telegram
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
                A
              </div>
              <span className="text-sm text-muted-foreground">
                AI Content OS
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} AI Content OS. Built with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "📝",
    title: "Script Generation",
    description:
      "Generate platform-optimized scripts for reels, YouTube, LinkedIn, Twitter threads, and more with the perfect tone and structure.",
  },
  {
    icon: "🎠",
    title: "Carousel Creator",
    description:
      "Create engaging multi-slide carousels with Canva-compatible JSON output. Perfect for Instagram and LinkedIn.",
  },
  {
    icon: "🎨",
    title: "Image Prompts",
    description:
      "Generate detailed, optimized prompts for AI image generation tools like Midjourney, DALL-E, and Stable Diffusion.",
  },
  {
    icon: "🎬",
    title: "Video Prompts",
    description:
      "Create comprehensive video prompts with scene breakdowns, camera motion, lighting, and audio suggestions.",
  },
  {
    icon: "#️⃣",
    title: "Smart Hashtags",
    description:
      "Get 30 hashtags grouped by competition level — high, medium, low, and niche — for maximum reach and engagement.",
  },
  {
    icon: "💬",
    title: "Caption Writer",
    description:
      "Write scroll-stopping captions with hooks, body, emojis, CTAs, and SEO keywords tailored to each platform.",
  },
  {
    icon: "🎙️",
    title: "Voice Scripts",
    description:
      "Generate natural voice-over scripts with SSML markup, timing, and narration style guidance.",
  },
  {
    icon: "📤",
    title: "Multi-Platform Publishing",
    description:
      "Publish content directly to Instagram, LinkedIn, Facebook, X, Threads, and YouTube Shorts from Telegram.",
  },
  {
    icon: "📅",
    title: "Content Scheduling",
    description:
      "Schedule your content for optimal posting times across all connected platforms.",
  },
];

const commands = [
  { name: "script", icon: "📝", description: "Generate platform scripts" },
  { name: "carousel", icon: "🎠", description: "Create carousel content" },
  { name: "image", icon: "🎨", description: "Generate image prompts" },
  { name: "video", icon: "🎬", description: "Create video prompts" },
  { name: "voice", icon: "🎙️", description: "Generate voice scripts" },
  { name: "hashtags", icon: "#️⃣", description: "Smart hashtag suggestions" },
  { name: "caption", icon: "💬", description: "Write engaging captions" },
  { name: "post", icon: "📤", description: "Publish to platforms" },
  { name: "schedule", icon: "📅", description: "Schedule publications" },
  { name: "help", icon: "❓", description: "Show command reference" },
];
