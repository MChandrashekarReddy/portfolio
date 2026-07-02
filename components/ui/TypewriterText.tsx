"use client";

import React, { useState, useEffect } from "react";

interface TypewriterTextProps {
  lines: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  cursorClassName?: string;
}

export function TypewriterText({
  lines,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2000,
  className = "",
  cursorClassName = "bg-primary",
}: TypewriterTextProps) {
  const [text, setText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const currentLine = lines[lineIndex];

    if (isDeleting) {
      if (text === "") {
        // Finished deleting, move to next line
        setIsDeleting(false);
        setLineIndex((prev) => (prev + 1) % lines.length);
      } else {
        // Delete one character
        timer = setTimeout(() => {
          setText(currentLine.substring(0, text.length - 1));
        }, deletingSpeed);
      }
    } else {
      if (text === currentLine) {
        // Finished typing, wait before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      } else {
        // Type one character
        timer = setTimeout(() => {
          setText(currentLine.substring(0, text.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, lineIndex, lines, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{text}</span>
      <span
        className={`ml-[2px] inline-block w-[3px] h-[1.1em] translate-y-[-1px] animate-pulse ${cursorClassName}`}
        style={{ animationDuration: '0.8s' }}
      ></span>
    </span>
  );
}
