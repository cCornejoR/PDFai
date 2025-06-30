import React, { useEffect, useRef, useState } from "react";

interface SpotlightProps {
  className?: string;
  size?: number;
  intensity?: number;
  speed?: number;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  className = "",
  size = 124,
  intensity = 0.8,
  speed = 1,
}) => {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = spotlight.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const animate = () => {
      // Smooth interpolation towards mouse position
      currentX += (mouseX - currentX) * 0.15 * speed;
      currentY += (mouseY - currentY) * 0.15 * speed;

      // Create a more sophisticated gradient with multiple colors
      const gradient = `radial-gradient(${size}px circle at ${currentX}px ${currentY}px,
        rgba(157, 61, 61, ${intensity * 0.3}) 0%,
        rgba(206, 124, 115, ${intensity * 0.2}) 25%,
        rgba(249, 225, 221, ${intensity * 0.1}) 50%,
        transparent 70%)`;

      spotlight.style.background = gradient;

      animationId = requestAnimationFrame(animate);
    };

    // Initialize position to center
    const rect = spotlight.getBoundingClientRect();
    mouseX = rect.width / 2;
    mouseY = rect.height / 2;
    currentX = mouseX;
    currentY = mouseY;

    spotlight.addEventListener("mousemove", handleMouseMove);
    spotlight.addEventListener("mouseenter", handleMouseEnter);
    spotlight.addEventListener("mouseleave", handleMouseLeave);
    animate();

    return () => {
      spotlight.removeEventListener("mousemove", handleMouseMove);
      spotlight.removeEventListener("mouseenter", handleMouseEnter);
      spotlight.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [size, speed, intensity]);

  return (
    <div
      ref={spotlightRef}
      className={`absolute inset-0 transition-opacity duration-500 ${
        isHovered ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{
        background: `radial-gradient(${size}px circle at 50% 50%,
          rgba(157, 61, 61, ${intensity * 0.2}) 0%,
          rgba(206, 124, 115, ${intensity * 0.15}) 25%,
          rgba(249, 225, 221, ${intensity * 0.08}) 50%,
          transparent 70%)`,
        mixBlendMode: "overlay",
      }}
    />
  );
};
