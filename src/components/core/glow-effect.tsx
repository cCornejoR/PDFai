import React from "react";

interface GlowEffectProps {
  colors: string[];
  mode?: "static" | "animated";
  blur?: "small" | "medium" | "large";
  className?: string;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  colors,
  mode = "animated",
  blur = "medium",
  className = "",
}) => {
  const getBlurSize = () => {
    switch (blur) {
      case "small":
        return "blur-xl";
      case "medium":
        return "blur-2xl";
      case "large":
        return "blur-3xl";
      default:
        return "blur-2xl";
    }
  };

  const getAnimationClass = (index: number) => {
    if (mode === "static") return "";
    const animations = ["animate-pulse", "animate-bounce", "animate-ping"];
    return animations[index % animations.length];
  };

  return (
    <div className={`absolute inset-0 ${className}`}>
      {colors.map((color, index) => (
        <div
          key={index}
          className={`absolute rounded-full ${getBlurSize()}`}
          style={{
            background: `radial-gradient(circle, ${color}50 0%, ${color}30 40%, transparent 80%)`,
            width: `${80 + index * 15}%`,
            height: `${80 + index * 15}%`,
            top: `${5 + index * 3}%`,
            left: `${5 + index * 3}%`,
            animation:
              mode === "animated"
                ? `glowPulse ${3 + index * 0.5}s ease-in-out infinite`
                : "none",
            animationDelay: `${index * 0.8}s`,
          }}
        />
      ))}

      {/* Additional animated orbs for more dynamic effect */}
      {mode === "animated" && (
        <>
          <div
            className="absolute w-40 h-40 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${colors[0]}40 0%, ${
                colors[1] || colors[0]
              }20 50%, transparent 80%)`,
              top: "15%",
              right: "15%",
              animation: "glowFloat 6s ease-in-out infinite",
              animationDelay: "1s",
            }}
          />
          <div
            className="absolute w-32 h-32 rounded-full blur-2xl"
            style={{
              background: `radial-gradient(circle, ${
                colors[2] || colors[0]
              }35 0%, ${
                colors[3] || colors[1] || colors[0]
              }15 60%, transparent 85%)`,
              bottom: "20%",
              left: "10%",
              animation: "glowFloat 8s ease-in-out infinite reverse",
              animationDelay: "2.5s",
            }}
          />
          <div
            className="absolute w-24 h-24 rounded-full blur-xl"
            style={{
              background: `radial-gradient(circle, ${
                colors[1] || colors[0]
              }30 0%, transparent 70%)`,
              top: "60%",
              right: "40%",
              animation: "glowOrbit 12s linear infinite",
              animationDelay: "0.5s",
            }}
          />
        </>
      )}
    </div>
  );
};
