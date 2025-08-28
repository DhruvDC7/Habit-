"use client";
import React from "react";

export default function GlowButton({ children, className = "", onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`glow-button ${className}`}
    >
      {children}
    </button>
  );
}
