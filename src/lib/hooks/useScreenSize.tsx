import { useState, useEffect, useCallback } from "react";

export type ScreenSize = "mobile" | "tablet" | "desktop";

export interface ScreenSizeConfig {
  size: ScreenSize;
  width: number;
  height: number;
  label: string;
}

export const SCREEN_SIZES: ScreenSizeConfig[] = [
  {
    size: "mobile",
    width: 430,
    height: 700,
    label: "iPhone",
  },
  {
    size: "tablet",
    width: 768,
    height: 1024,
    label: "Tablet",
  },
  {
    size: "desktop",
    width: 1200,
    height: 800,
    label: "Desktop",
  },
];

export const useScreenSize = () => {
  const [currentSize, setCurrentSize] = useState<ScreenSize>("desktop");
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Detectar tamaño actual basado en las dimensiones de la ventana
  const detectScreenSize = useCallback((width: number): ScreenSize => {
    if (width < 768) return "mobile";
    if (width < 1200) return "tablet";
    return "desktop";
  }, []);

  // Actualizar dimensiones y tamaño
  const updateDimensions = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setDimensions({ width, height });
    setCurrentSize(detectScreenSize(width));
  }, [detectScreenSize]);

  // Configurar tamaño específico (para testing de responsive)
  const setScreenSize = useCallback(async (size: ScreenSize) => {
    const config = SCREEN_SIZES.find(s => s.size === size);
    if (!config) return;

    try {
      // Si estamos en Tauri, redimensionar la ventana
      if (window.__TAURI__) {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const appWindow = getCurrentWindow();
        await appWindow.setSize({
          width: config.width,
          height: config.height,
        });
      }
      
      setCurrentSize(size);
      setDimensions({ width: config.width, height: config.height });
    } catch (error) {
      console.error("Error setting screen size:", error);
      // Fallback: solo actualizar el estado local
      setCurrentSize(size);
      setDimensions({ width: config.width, height: config.height });
    }
  }, []);

  // Obtener configuración del tamaño actual
  const getCurrentConfig = useCallback((): ScreenSizeConfig => {
    return SCREEN_SIZES.find(s => s.size === currentSize) || SCREEN_SIZES[2];
  }, [currentSize]);

  // Verificar si es un tamaño específico
  const isMobile = currentSize === "mobile";
  const isTablet = currentSize === "tablet";
  const isDesktop = currentSize === "desktop";
  const isMobileOrTablet = isMobile || isTablet;

  // Obtener clases CSS responsivas
  const getResponsiveClasses = useCallback((classes: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    default?: string;
  }) => {
    const baseClass = classes.default || "";
    
    if (isMobile && classes.mobile) {
      return `${baseClass} ${classes.mobile}`;
    }
    if (isTablet && classes.tablet) {
      return `${baseClass} ${classes.tablet}`;
    }
    if (isDesktop && classes.desktop) {
      return `${baseClass} ${classes.desktop}`;
    }
    
    return baseClass;
  }, [isMobile, isTablet, isDesktop]);

  // Obtener padding/margin responsivo
  const getResponsiveSpacing = useCallback((spacing: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }) => {
    if (isMobile) return spacing.mobile || "p-2";
    if (isTablet) return spacing.tablet || "p-4";
    return spacing.desktop || "p-6";
  }, [isMobile, isTablet]);

  // Obtener tamaño de texto responsivo
  const getResponsiveTextSize = useCallback((sizes: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }) => {
    if (isMobile) return sizes.mobile || "text-sm";
    if (isTablet) return sizes.tablet || "text-base";
    return sizes.desktop || "text-lg";
  }, [isMobile, isTablet]);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [updateDimensions]);

  return {
    currentSize,
    dimensions,
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    setScreenSize,
    getCurrentConfig,
    getResponsiveClasses,
    getResponsiveSpacing,
    getResponsiveTextSize,
    availableSizes: SCREEN_SIZES,
  };
};
