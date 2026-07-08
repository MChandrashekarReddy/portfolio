import React from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-12 md:mb-16 ${
        align === "center" ? "text-center" : "text-left"
      } ${className}`}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed text-balance">
          {subtitle}
        </p>
      )}
      <div
        className={`section-accent mt-6 h-1 w-12 rounded-full bg-primary ${
          align === "center" ? "mx-auto" : ""
        }`}
      />
    </div>
  );
}
