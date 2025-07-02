import { useTheme } from "@/lib/hooks/useTheme";

interface DynamicBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function DynamicBackground({
  children,
  className = "",
}: DynamicBackgroundProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  const backgroundStyle = {
    backgroundImage: `url(${isDark ? "/bck.png" : "/bck-light.png"})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${className}`}
      style={backgroundStyle}
    >
      {/* Overlay glassmorphism mejorado */}
      <div
        className={`min-h-screen ${
          isDark
            ? "bg-gradient-to-br from-black/30 via-dark-bg/20 to-dark-surface/40"
            : "bg-gradient-to-br from-white/30 via-light-bg/20 to-light-surface/40"
        }`}
        style={{
          backdropFilter: "blur(8px) saturate(120%)",
          WebkitBackdropFilter: "blur(8px) saturate(120%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
