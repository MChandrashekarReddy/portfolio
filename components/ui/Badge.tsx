import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "status";
  statusColor?: "green" | "yellow" | "blue";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  statusColor = "green",
  className = "",
}: BadgeProps) {
  if (variant === "status") {
    const statusColors = {
      green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      yellow: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    };

    return (
      <span
        className={`ui-badge ui-badge-status inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${statusColors[statusColor]} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {children}
      </span>
    );
  }

  return (
    <span
      className={`ui-badge ui-badge-default inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-badge-bg text-badge-text transition-colors duration-200 ${className}`}
    >
      {children}
    </span>
  );
}
