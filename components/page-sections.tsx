"use client";

import { useEffect, useRef, useState } from "react";

// ═══════════════════════════════════════════════════
// ScrollReveal — animates in when element scrolls
// into view
// ═══════════════════════════════════════════════════
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// TypeWriter — types out text character by character
// ═══════════════════════════════════════════════════
export function TypeWriter({
  text,
  className = "",
  speed = 40,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, done]);

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="animate-pulse text-primary">▌</span>}
    </span>
  );
}

// ═══════════════════════════════════════════════════
// FloatingOrbs — decorative animated background
// ═══════════════════════════════════════════════════
export function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Orb 1 */}
      <div
        className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-20 dark:opacity-10"
        style={{
          background: "radial-gradient(circle, oklch(0.6 0.2 260 / 0.3), transparent 70%)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      {/* Orb 2 */}
      <div
        className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full opacity-20 dark:opacity-10"
        style={{
          background: "radial-gradient(circle, oklch(0.55 0.18 280 / 0.25), transparent 70%)",
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />
      {/* Orb 3 */}
      <div
        className="absolute left-1/3 top-1/3 h-[300px] w-[300px] rounded-full opacity-10 dark:opacity-5"
        style={{
          background: "radial-gradient(circle, oklch(0.5 0.15 250 / 0.2), transparent 70%)",
          animation: "float 12s ease-in-out infinite",
          animationDelay: "-3s",
        }}
      />
    </div>
  );
}
