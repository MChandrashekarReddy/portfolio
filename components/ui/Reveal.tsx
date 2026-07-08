"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type RevealVariant = "rise" | "flip" | "left" | "right" | "zoom";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** 3D entrance: rise (tilt up), flip (swing up from below), left/right (swing in), zoom (from depth) */
  variant?: RevealVariant;
}

/**
 * Scroll-triggered 3D entrance. Elements start tilted back / swung away in
 * perspective and settle flat once they enter the viewport.
 * Hidden/visible states live in globals.css (.rv3-*) so reduced-motion can
 * neutralize them globally.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "rise",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rv3 rv3-${variant} ${isVisible ? "rv3-in" : ""} ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
