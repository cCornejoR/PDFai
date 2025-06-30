import React from "react";
import { Spotlight } from "../core/spotlight";

interface SpotlightBorderProps {
  children: React.ReactNode;
  className?: string;
  size?: number;
  aspectRatio?: "video" | "square" | "auto";
  height?: string;
}

export function SpotlightBorder({
  children,
  className = "",
  size = 124,
  aspectRatio = "auto",
  height = "auto",
}: SpotlightBorderProps) {
  const getAspectClass = () => {
    switch (aspectRatio) {
      case "video":
        return "aspect-video";
      case "square":
        return "aspect-square";
      default:
        return "";
    }
  };

  const getHeightClass = () => {
    if (height !== "auto") {
      return height;
    }
    return aspectRatio === "auto" ? "h-auto" : "";
  };

  return (
    <div
      className={`relative ${getAspectClass()} ${getHeightClass()} overflow-hidden rounded-xl bg-dark-surface/30 p-[1px] border border-dark-blue-gray/20 ${className}`}
    >
      <Spotlight
        className="from-dark-red via-dark-coral to-dark-rose blur-3xl"
        size={size}
      />
      <div className="relative h-full w-full rounded-xl bg-dark-bg/80 backdrop-blur-sm border border-dark-blue-gray/10">
        {children}
      </div>
    </div>
  );
}
