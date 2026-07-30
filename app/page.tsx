/**
 * AI Content OS — Landing Page
 * Stunning animated landing with live command playground.
 */

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPlayground } from "@/components/command-playground";
import { ScrollReveal, TypeWriter, FloatingOrbs } from "@/components/page-sections";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              A
            </div>
            <span className="text-lg font-bold tracking-tight">
              AI Content <span className="text-gradient">OS</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {[
              { href: "#features", label: "Features" },
              { href: "#playground", label: "Playground" },
              { href: "#commands", label: "Commands" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="https://t.me/ai_content_os_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.127.087.497.084.857-.015.727-.384 5.138-.543 6.832-.07.76-.212 1.026-.35 1.052-.291.058-.622-.197-.97-.47-.408-.32-1.356-.922-2.158-1.489-.26-.185-.64-.653-.216-1.144.384-.445 1.167-1.1 1.893-1.648.201-.152.271-.238.014-.538a384.94 384.94 0 0 0-2.317-2.395.394.394 0 0 0-.409-.128.455.455 0 0 0-.24.196c-.22.398-.936 1.378-1.082 1.596-.069.103-.206.197-.387.133-.214-.077-.64-.218-.956-.36-.416-.178-.76-.276-.706-.53.027-.146.207-.297.517-.454.977-.53 5.573-2.26 6.676-2.597z" />
              </svg>
              Try Bot
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ════════════════════════════════════════════ */}
        {/* HERO */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <FloatingOrbs />
          <div className="grid-bg absolute inset-0" />

          <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-32 lg:pt-28">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                Version 1.0 — AI-powered content creation
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
                Your AI Content
                <br />
                <span className="text-gradient">Operating System</span>
              </h1>

              {/* Typewriter subtitle */}
              <div className="mt-6 h-8 text-lg text-muted-foreground sm:text-xl">
                <TypeWriter text="Create. Edit. Schedule. Publish. All from Telegram." speed={35} />
              </div>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="https://t.me/ai_content_os_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95 sm:w-auto animate-glow"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.127.087.497.084.857-.015.727-.384 5.138-.543 6.832-.07.76-.212 1.026-.35 1.052-.291.058-.622-.197-.97-.47-.408-.32-1.356-.922-2.158-1.489-.26-.185-.64-.653-.216-1.144.384-.445 1.167-1.1 1.893-1.648.201-.152.271-.238.014-.538a384.94 384.94 0 0 0-2.317-2.395.394.394 0 0 0-.409-.128.455.455 0 0 0-.24.196c-.22.398-.936 1.378-1.082 1.596-.069.103-.206.197-.387.133-.214-.077-.64-.218-.956-.36-.416-.178-.76-.276-.706-.53.027-.146.207-.297.517-.454.977-.53 5.573-2.26 6.676-2.597z" />
                  </svg>
                  Try the Bot on Telegram
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="#playground"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-8 text-sm font-medium backdrop-blur-sm transition-all hover:bg-muted active:scale-95 sm:w-auto"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Live Demo
                </Link>
              </div>
            </div>

            {/* Floating feature badges */}
            <div className="mt-16 flex flex-wrap justify-center gap-3">
              {[
                "🤖 AI-Powered",
                "📱 Telegram Native",
                "🎨 Image Generation",
                "🎬 Video Prompts",
                "📅 Content Scheduling",
                "🌐 Multi-Platform",
              ].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex animate-fade-in items-center gap-1.5 rounded-full border border-border/40 bg-card/50 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:text-foreground"
                  style={{ animationDelay: `${Math.random() * 1.5}s` }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* STATS */}
        {/* ════════════════════════════════════════════ */}
        <section className="border-y border-border/40">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { label: "Commands", value: "10+", desc: "Content tools" },
                { label: "Platforms", value: "7", desc: "Social networks" },
                { label: "AI Models", value: "8+", desc: "FLUX, SD, Wan2.1" },
                { label: "Cost", value: "Free", desc: "Start at $0.00" },
              ].map((stat) => (
                <div key={stat.label} className="group text-center">
                  <div className="text-4xl font-bold tracking-tight text-gradient">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* LIVE PLAYGROUND */}
        {/* ════════════════════════════════════════════ */}
        <section id="playground" className="relative overflow-hidden py-20 lg:py-28">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-accent/[0.02]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  🚀 Interactive
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Try it <span className="text-gradient">live</span>
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Pick a command, type a topic, and watch AI generate content in real time.
                  No Telegram needed.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-10">
              <CommandPlayground />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* FEATURES */}
        {/* ════════════════════════════════════════════ */}
        <section id="features" className="border-t border-border/40 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  ✨ Capabilities
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Everything you need to create content
                </h2>
                <p className="mt-3 text-muted-foreground">
                  From scripts to captions, hashtags to carousels — generate everything
                  through a single Telegram chat.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <ScrollReveal key={feature.title} delay={i * 80}>
                  <div className="group relative rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    {/* Hover gradient effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="relative">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-xl transition-transform group-hover:scale-110">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* COMMANDS */}
        {/* ════════════════════════════════════════════ */}
        <section id="commands" className="border-t border-border/40 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  ⌨️ Reference
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Command reference
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Every command is a content superpower. Type them directly in Telegram.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {commands.map((cmd, i) => (
                <ScrollReveal key={cmd.name} delay={i * 50}>
                  <div className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80 hover:shadow-sm">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 text-base transition-transform group-hover:scale-110">
                      {cmd.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <code className="text-sm font-semibold">/{cmd.name}</code>
                      <p className="truncate text-xs text-muted-foreground">
                        {cmd.description}
                      </p>
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* HOW IT WORKS */}
        {/* ════════════════════════════════════════════ */}
        <section className="border-t border-border/40 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  🎯 Workflow
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  How it works
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Three simple steps to AI-powered content creation.
                </p>
              </div>
            </ScrollReveal>

            <div className="relative mt-16">
              {/* Connector line on desktop */}
              <div className="absolute left-1/2 top-16 hidden h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent md:block" />

              <div className="grid gap-12 md:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Open Telegram",
                    desc: "Start a chat with the AI Content OS bot and type /start to begin.",
                    icon: "💬",
                  },
                  {
                    step: "02",
                    title: "Send a command",
                    desc: "Use structured commands like /script or /caption with your topic.",
                    icon: "⚡",
                  },
                  {
                    step: "03",
                    title: "Publish & schedule",
                    desc: "Review the AI-generated content, then publish across your platforms.",
                    icon: "🚀",
                  },
                ].map((item, i) => (
                  <ScrollReveal key={item.step} delay={i * 150}>
                    <div className="group relative text-center">
                      {/* Step number */}
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                        {item.step}
                      </div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* CTA */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-t border-border/40 py-20 lg:py-28">
          <FloatingOrbs />
          <div className="grid-bg absolute inset-0" />

          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Ready to streamline your
                  <br />
                  <span className="text-gradient">content workflow?</span>
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Start creating AI-powered content in seconds. No signup required —
                  just open Telegram and start chatting.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link
                    href="https://t.me/ai_content_os_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95 sm:w-auto animate-glow"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.127.087.497.084.857-.015.727-.384 5.138-.543 6.832-.07.76-.212 1.026-.35 1.052-.291.058-.622-.197-.97-.47-.408-.32-1.356-.922-2.158-1.489-.26-.185-.64-.653-.216-1.144.384-.445 1.167-1.1 1.893-1.648.201-.152.271-.238.014-.538a384.94 384.94 0 0 0-2.317-2.395.394.394 0 0 0-.409-.128.455.455 0 0 0-.24.196c-.22.398-.936 1.378-1.082 1.596-.069.103-.206.197-.387.133-.214-.077-.64-.218-.956-.36-.416-.178-.76-.276-.706-.53.027-.146.207-.297.517-.454.977-.53 5.573-2.26 6.676-2.597z" />
                    </svg>
                    Start on Telegram
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="#playground"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-8 text-sm font-medium backdrop-blur-sm transition-all hover:bg-muted active:scale-95 sm:w-auto"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Try Live Demo
                  </Link>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  ✨ No credit card required · Free tier available · Powered by Hugging Face &amp; OpenRouter
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* ════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ════════════════════════════════════════════ */}
      <footer className="border-t border-border/40 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-primary-foreground">
                A
              </div>
              <span className="text-sm text-muted-foreground">
                AI Content OS
              </span>
            </div>

            <div className="flex items-center gap-6">
              {[
                { href: "#features", label: "Features" },
                { href: "#playground", label: "Playground" },
                { href: "#commands", label: "Commands" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
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

// ═══════════════════════════════════════════════════
// Data
// ═══════════════════════════════════════════════════

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
    title: "Image Generation",
    description:
      "Generate actual images from text prompts using FLUX.1, Stable Diffusion, and more — delivered directly to Telegram.",
  },
  {
    icon: "🎬",
    title: "Video Prompts & Generation",
    description:
      "Create comprehensive video briefs or generate actual videos with scene breakdowns, camera motion, and audio suggestions.",
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
  { name: "image", icon: "🎨", description: "Generate images from text" },
  { name: "video", icon: "🎬", description: "Create video prompts" },
  { name: "voice", icon: "🎙️", description: "Generate voice scripts" },
  { name: "hashtags", icon: "#️⃣", description: "Smart hashtag suggestions" },
  { name: "caption", icon: "💬", description: "Write engaging captions" },
  { name: "post", icon: "📤", description: "Publish to platforms" },
  { name: "schedule", icon: "📅", description: "Schedule publications" },
  { name: "help", icon: "❓", description: "Show command reference" },
];
