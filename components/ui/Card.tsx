import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function Card({
  children,
  className = "",
  hover = true,
  padding = "md",
  ...rest
}: CardProps) {
  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-surface border border-border-custom rounded-2xl ${paddings[padding]} shadow-sm ${
        hover ? "card-hover" : ""
      } ${className}`}
      style={{ borderRadius: "var(--radius-lg)" }}
      {...rest}
    >
      {children}
    </div>
  );
}
