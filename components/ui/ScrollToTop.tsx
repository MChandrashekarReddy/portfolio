"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll percentage
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      // Show button if scrolled down past 100px
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG circle calculations for progress ring
  const circleRadius = 20;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (scrollProgress / 100) * circleCircumference;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 focus:outline-none group ${
        isVisible ? "opacity-100 translate-y-0 cursor-pointer" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      aria-label="Scroll to top"
    >
      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-surface shadow-xl border border-border-custom backdrop-blur-md">
        {/* Background ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={circleRadius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border-custom"
          />
        </svg>

        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={circleRadius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circleCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-150 ease-out"
          />
        </svg>

        {/* Inner Content (Arrow or Percentage) */}
        <div className="relative flex flex-col items-center justify-center text-text-primary">
          <span className="text-[10px] font-bold tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity absolute">
            {Math.round(scrollProgress)}%
          </span>
          <svg 
            className="w-5 h-5 transition-opacity group-hover:opacity-0 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
